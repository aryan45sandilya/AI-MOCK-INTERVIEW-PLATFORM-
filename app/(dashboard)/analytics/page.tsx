import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { interviews, interviewReports } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [completedInterviews, reports] = await Promise.all([
    db.query.interviews.findMany({
      where: and(eq(interviews.userId, userId), eq(interviews.status, "completed")),
      orderBy: [desc(interviews.completedAt)],
    }),
    db.query.interviewReports.findMany({
      where: eq(interviewReports.userId, userId),
      orderBy: [desc(interviewReports.createdAt)],
    }),
  ]);

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your interview performance over time</p>
      </div>
      <AnalyticsDashboard interviews={completedInterviews} reports={reports} />
    </div>
  );
}
