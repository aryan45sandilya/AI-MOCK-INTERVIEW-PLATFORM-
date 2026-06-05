import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  interviews,
  questions,
  answers,
  interviewReports,
  emotionRecords,
} from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { generateInterviewReport } from "@/lib/ai/gemini";

async function generateAndSaveReport(
  id: string,
  userId: string,
  interview: { role: string; experience: string; interviewType: string }
) {
  try {
    const [interviewQuestions, interviewAnswers, emotionData] = await Promise.all([
      db.query.questions.findMany({
        where: eq(questions.interviewId, id),
        orderBy: (q, { asc }) => [asc(q.orderIndex)],
      }),
      db.query.answers.findMany({
        where: and(eq(answers.interviewId, id), eq(answers.userId, userId)),
      }),
      db.query.emotionRecords.findMany({
        where: and(eq(emotionRecords.interviewId, id), eq(emotionRecords.userId, userId)),
      }),
    ]);

    const questionsAndAnswers = interviewQuestions.map((q) => {
      const ans = interviewAnswers.find((a) => a.questionId === q.id);
      const hasAnswer = !!(
        ans?.answerText?.trim() ||
        ans?.transcription?.trim() ||
        ans?.codeAnswer?.trim()
      );
      return {
        question: q.questionText,
        answer: hasAnswer
          ? (ans?.answerText ?? ans?.transcription ?? ans?.codeAnswer ?? "")
          : "No answer provided",
        score: hasAnswer ? (ans?.score ?? 50) : 0,
        questionType: q.questionType,
      };
    });

    const emotionSummary =
      emotionData.length > 0
        ? {
            averageConfidence:
              emotionData.reduce((s, r) => s + (r.confidence ?? 0), 0) / emotionData.length,
            averageAttention:
              emotionData.reduce((s, r) => s + (r.attention ?? 0), 0) / emotionData.length,
            averageEyeContact:
              emotionData.reduce((s, r) => s + (r.eyeContact ?? 0), 0) / emotionData.length,
            averageStress:
              emotionData.reduce((s, r) => s + (r.stress ?? 0), 0) / emotionData.length,
          }
        : undefined;

    const answeredQs = questionsAndAnswers.filter((q) => q.answer !== "No answer provided");
    const unanswered = questionsAndAnswers.length - answeredQs.length;
    const avgScore =
      answeredQs.length > 0
        ? Math.round(answeredQs.reduce((s, q) => s + q.score, 0) / answeredQs.length)
        : 0;

    let report;

    if (answeredQs.length === 0) {
      // Instant report — no AI needed
      report = {
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
        problemSolvingScore: 0,
        strengths: [] as string[],
        weaknesses: ["No questions were answered", "Interview ended prematurely"],
        improvements: [
          "Complete the full interview",
          "Attempt every question",
          "Maintain face position in camera",
        ],
        detailedFeedback: `The interview ended before any questions were answered (${unanswered} unanswered). Please complete a full session for an accurate assessment.`,
        recommendations: ["Start a new interview and answer each question"],
        nextSteps: ["Create a new interview", "Keep face centered in camera"],
      };
    } else {
      try {
        report = await generateInterviewReport({
          role: interview.role,
          experience: interview.experience,
          interviewType: interview.interviewType,
          questionsAndAnswers,
          emotionSummary,
        });
      } catch (err) {
        console.error("Report generation error:", err);
        report = {
          overallScore: avgScore,
          technicalScore: avgScore,
          communicationScore: avgScore,
          confidenceScore: avgScore,
          problemSolvingScore: avgScore,
          strengths: answeredQs.length > 0 ? ["Attempted questions"] : [],
          weaknesses: [
            ...(unanswered > 0 ? [`${unanswered} question(s) unanswered`] : []),
            "Needs improvement",
          ],
          improvements: ["Answer all questions", "Explain your thought process clearly"],
          detailedFeedback: `You answered ${answeredQs.length} of ${questionsAndAnswers.length} questions. Average score: ${avgScore}%.`,
          recommendations: ["Practice more mock interviews"],
          nextSteps: ["Attempt all questions next time"],
        };
      }
    }

    await db
      .insert(interviewReports)
      .values({
        interviewId: id,
        userId,
        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        confidenceScore: report.confidenceScore,
        problemSolvingScore: report.problemSolvingScore,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        improvements: report.improvements,
        detailedFeedback: report.detailedFeedback,
        recommendations: report.recommendations,
        nextSteps: report.nextSteps,
        emotionSummary,
      })
      .onConflictDoUpdate({
        target: interviewReports.interviewId,
        set: {
          overallScore: report.overallScore,
          technicalScore: report.technicalScore,
          communicationScore: report.communicationScore,
          confidenceScore: report.confidenceScore,
          problemSolvingScore: report.problemSolvingScore,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          improvements: report.improvements,
          detailedFeedback: report.detailedFeedback,
          recommendations: report.recommendations,
          nextSteps: report.nextSteps,
          emotionSummary,
        },
      });

    await db
      .update(interviews)
      .set({ overallScore: report.overallScore })
      .where(eq(interviews.id, id));
  } catch (err) {
    console.error("Background report error:", err);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const interview = await db.query.interviews.findFirst({
      where: and(eq(interviews.id, id), eq(interviews.userId, userId)),
    });
    if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Already completed — return immediately
    if (interview.status === "completed") {
      return NextResponse.json({ success: true, data: { score: interview.overallScore } });
    }

    const completedAt = new Date();
    const duration = Math.round(
      (completedAt.getTime() - (interview.startedAt ?? interview.createdAt).getTime()) / 1000
    );

    // Mark as completed FIRST — respond immediately
    await db
      .update(interviews)
      .set({ status: "completed", completedAt, duration, updatedAt: new Date() })
      .where(eq(interviews.id, id));

    // Generate report in background — don't await
    generateAndSaveReport(id, userId, {
      role: interview.role,
      experience: interview.experience,
      interviewType: interview.interviewType,
    });

    // Return immediately — frontend navigates to report page
    return NextResponse.json({ success: true, data: { score: null } });
  } catch (error) {
    console.error("[POST /api/interviews/:id/complete]", error);
    return NextResponse.json({ error: "Failed to complete interview" }, { status: 500 });
  }
}
