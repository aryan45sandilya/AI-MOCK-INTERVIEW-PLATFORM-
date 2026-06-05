import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { interviews, questions, answers, interviewReports } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { InterviewReportView } from "@/components/reports/interview-report-view";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const interview = await db.query.interviews.findFirst({
    where: and(eq(interviews.id, id), eq(interviews.userId, userId)),
  });
  if (!interview) notFound();

  // Not completed yet — send back to room
  if (interview.status !== "completed") redirect(`/interviews/${id}/room`);

  const [reportData, interviewQuestions] = await Promise.all([
    db.query.interviewReports.findFirst({
      where: eq(interviewReports.interviewId, id),
    }),
    db.query.questions.findMany({
      where: eq(questions.interviewId, id),
      orderBy: (q, { asc: a }) => [a(q.orderIndex)],
      with: {
        answers: {
          where: eq(answers.userId, userId),
          limit: 1,
        },
      },
    }),
  ]);

  return (
    <InterviewReportView
      interview={interview}
      report={reportData ?? null}
      questionsWithAnswers={interviewQuestions}
    />
  );
}
