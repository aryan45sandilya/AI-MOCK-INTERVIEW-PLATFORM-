import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { interviews, answers, interviewReports } from "@/lib/db/schema";
import { eq, desc, count, avg, and, gte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, TrendingUp, Clock, CheckCircle2, Target, ArrowRight, BarChart3 } from "lucide-react";
import { InterviewCard } from "@/components/interviews/interview-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { formatScore, formatRelativeTime } from "@/lib/utils";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  // Fetch stats in parallel
  const [allInterviews, completedInterviews, avgScore] = await Promise.all([
    db.select({ count: count() }).from(interviews).where(eq(interviews.userId, userId)),
    db.select({ count: count() }).from(interviews).where(
      and(eq(interviews.userId, userId), eq(interviews.status, "completed"))
    ),
    db.select({ avg: avg(interviews.overallScore) }).from(interviews).where(
      and(eq(interviews.userId, userId), eq(interviews.status, "completed"))
    ),
  ]);

  const totalCount = allInterviews[0]?.count ?? 0;
  const completedCount = completedInterviews[0]?.count ?? 0;
  const averageScore = Math.round(Number(avgScore[0]?.avg) || 0);

  // Recent interviews
  const recentInterviews = await db.query.interviews.findMany({
    where: eq(interviews.userId, userId),
    orderBy: [desc(interviews.createdAt)],
    limit: 5,
    with: {
      questions: { columns: { id: true } },
    },
  });

  const firstName = user?.firstName || "there";

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to practice? Your next interview is waiting.
          </p>
        </div>
        <Link href="/interviews/new">
          <Button variant="gradient" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Interviews"
          value={totalCount}
          icon={Target}
          description="All time"
          trend={totalCount > 0 ? "+12% this month" : undefined}
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle2}
          description={`${totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% completion rate`}
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatsCard
          title="Average Score"
          value={`${averageScore}%`}
          icon={TrendingUp}
          description={averageScore >= 70 ? "Above average" : "Keep practicing!"}
          iconColor={averageScore >= 70 ? "text-blue-500" : "text-orange-500"}
          bgColor={averageScore >= 70 ? "bg-blue-500/10" : "bg-orange-500/10"}
        />
        <StatsCard
          title="In Progress"
          value={totalCount - completedCount}
          icon={Clock}
          description="Pending interviews"
          iconColor="text-purple-500"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Quick Start Banner (shown when no interviews) */}
      {totalCount === 0 && (
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start your first mock interview!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a personalized interview based on your target role and get instant AI feedback.
            </p>
            <Link href="/interviews/new">
              <Button variant="gradient" size="lg" className="gap-2">
                <PlusCircle className="h-5 w-5" />
                Create Interview
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent Interviews */}
      {recentInterviews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Interviews</h2>
            <Link href="/interviews">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={{
                  ...interview,
                  _count: { questions: interview.questions?.length ?? 0 },
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Upload your resume for personalized, experience-based questions</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Use the webcam feature for emotion analysis and confidence tracking</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Practice coding rounds with the built-in Monaco editor</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Review your detailed reports to identify patterns in weak areas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
