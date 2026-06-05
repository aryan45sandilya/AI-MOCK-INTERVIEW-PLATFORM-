import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interviews, questions, users, resumes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CreateInterviewSchema } from "@/types";
import { generateInterviewQuestions } from "@/lib/ai/gemini";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = CreateInterviewSchema.parse(body);

    // Ensure user row exists
    await db
      .insert(users)
      .values({ id: userId, email: `${userId}@clerk.local` })
      .onConflictDoNothing();

    // Optional resume text
    let resumeText: string | undefined;
    if (data.resumeId) {
      const resume = await db.query.resumes.findFirst({
        where: eq(resumes.id, data.resumeId),
        columns: { extractedText: true },
      });
      resumeText = resume?.extractedText ?? undefined;
    }

    const title = data.title?.trim() || `${data.interviewType} Interview — ${data.role}`;

    const [interview] = await db
      .insert(interviews)
      .values({
        userId,
        title,
        role: data.role,
        experience: data.experience,
        difficulty: data.difficulty,
        interviewType: data.interviewType,
        techStack: data.techStack,
        resumeText: resumeText ?? null,
        status: "pending",
      })
      .returning();

    // Generate questions
    const generated = await generateInterviewQuestions({
      role: data.role,
      experience: data.experience,
      difficulty: data.difficulty,
      interviewType: data.interviewType,
      techStack: data.techStack,
      numberOfQuestions: data.numberOfQuestions,
      resumeText,
    });

    if (generated.length > 0) {
      await db.insert(questions).values(
        generated.map((q, idx) => ({
          interviewId: interview.id,
          questionText: q.questionText,
          questionType: (q.questionType?.toLowerCase() ?? "technical") as "technical" | "behavioral" | "hr" | "coding" | "system_design",
          orderIndex: idx,
          difficulty: (q.difficulty?.toLowerCase() ?? "medium") as "easy" | "medium" | "hard",
          expectedAnswer: q.expectedAnswer ?? null,
          hints: q.hints ?? [],
          codeTemplate: q.codeTemplate ?? null,
          programmingLanguage: q.programmingLanguage ?? null,
        }))
      );
    }

    return NextResponse.json({ success: true, data: interview }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("[POST /api/interviews]", error);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);

    const data = await db.query.interviews.findMany({
      where: eq(interviews.userId, userId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/interviews]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
