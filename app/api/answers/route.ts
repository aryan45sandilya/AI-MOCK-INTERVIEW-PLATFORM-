export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { answers, questions, interviews } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { SubmitAnswerSchema } from "@/types";
import { evaluateAnswer } from "@/lib/ai/gemini";
import { ZodError } from "zod";

async function evaluateAndSave(
  data: {
    questionId: string;
    interviewId: string;
    answerText?: string;
    codeAnswer?: string;
    transcription?: string;
    timeTaken?: number;
    emotionSnapshot?: unknown;
  },
  userId: string,
  question: { questionText: string; questionType: string; expectedAnswer?: string | null },
  interview: { role: string; experience: string }
) {
  const answerContent = (data.answerText || data.transcription || data.codeAnswer || "").trim();

  let evaluation = {
    score: 0,
    feedback: "No answer was provided.",
    strengths: [] as string[],
    improvements: ["Always attempt an answer, even if unsure"] as string[],
  };

  if (answerContent.length >= 5) {
    try {
      evaluation = await evaluateAnswer({
        question: question.questionText,
        answer: answerContent,
        questionType: question.questionType,
        expectedAnswer: question.expectedAnswer || undefined,
        role: interview.role,
        experience: interview.experience,
      });
    } catch (e) {
      console.error("Answer evaluation failed:", e);
      evaluation = {
        score: 45,
        feedback: "Answer recorded.",
        strengths: ["Answer was provided"],
        improvements: ["Keep practising"],
      };
    }
  }

  const existing = await db.query.answers.findFirst({
    where: and(eq(answers.questionId, data.questionId), eq(answers.userId, userId)),
  });

  if (existing) {
    await db.update(answers).set({
      answerText: data.answerText ?? null,
      codeAnswer: data.codeAnswer ?? null,
      transcription: data.transcription ?? null,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      timeTaken: data.timeTaken ?? null,
      updatedAt: new Date(),
    }).where(eq(answers.id, existing.id));
  } else {
    await db.insert(answers).values({
      questionId: data.questionId,
      interviewId: data.interviewId,
      userId,
      answerText: data.answerText ?? null,
      codeAnswer: data.codeAnswer ?? null,
      transcription: data.transcription ?? null,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      timeTaken: data.timeTaken ?? null,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = SubmitAnswerSchema.parse(body);

    const [question, interview] = await Promise.all([
      db.query.questions.findFirst({ where: eq(questions.id, data.questionId) }),
      db.query.interviews.findFirst({
        where: and(eq(interviews.id, data.interviewId), eq(interviews.userId, userId)),
      }),
    ]);

    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

    // Mark interview in_progress if pending
    if (interview.status === "pending") {
      await db.update(interviews)
        .set({ status: "in_progress", startedAt: new Date(), updatedAt: new Date() })
        .where(eq(interviews.id, data.interviewId));
    }

    // Save answer immediately with placeholder score, evaluate in background
    const answerContent = (data.answerText || data.transcription || data.codeAnswer || "").trim();
    const hasAnswer = answerContent.length >= 5;

    const existing = await db.query.answers.findFirst({
      where: and(eq(answers.questionId, data.questionId), eq(answers.userId, userId)),
    });

    if (existing) {
      await db.update(answers).set({
        answerText: data.answerText ?? null,
        codeAnswer: data.codeAnswer ?? null,
        transcription: data.transcription ?? null,
        score: hasAnswer ? 50 : 0, // placeholder — will be updated by background job
        timeTaken: data.timeTaken ?? null,
        updatedAt: new Date(),
      }).where(eq(answers.id, existing.id));
    } else {
      await db.insert(answers).values({
        questionId: data.questionId,
        interviewId: data.interviewId,
        userId,
        answerText: data.answerText ?? null,
        codeAnswer: data.codeAnswer ?? null,
        transcription: data.transcription ?? null,
        score: hasAnswer ? 50 : 0,
        timeTaken: data.timeTaken ?? null,
      });
    }

    // Evaluate in background — don't block the response
    if (hasAnswer) {
      evaluateAndSave(data, userId, question, interview).catch(console.error);
    }

    // Respond immediately
    return NextResponse.json({ success: true, data: { score: hasAnswer ? 50 : 0 } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("[POST /api/answers]", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
