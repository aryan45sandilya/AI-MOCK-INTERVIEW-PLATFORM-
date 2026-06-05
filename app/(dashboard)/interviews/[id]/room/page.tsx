import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { interviews, questions } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { InterviewRoom } from "@/components/interviews/interview-room";

// Retry helper for transient DB errors
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

export default async function InterviewRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const interview = await withRetry(() =>
    db.query.interviews.findFirst({
      where: and(eq(interviews.id, id), eq(interviews.userId, userId)),
    })
  );

  if (!interview) notFound();
  if (interview.status === "completed") redirect(`/interviews/${id}/report`);

  const interviewQuestions = await withRetry(() =>
    db.select().from(questions).where(eq(questions.interviewId, id)).orderBy(asc(questions.orderIndex))
  );

  return (
    <InterviewRoom
      interview={{
        id: interview.id,
        title: interview.title,
        role: interview.role,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
      }}
      questions={interviewQuestions}
    />
  );
}
