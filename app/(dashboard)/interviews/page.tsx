import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { interviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { InterviewCard } from "@/components/interviews/interview-card";
import { InterviewFilters } from "@/components/interviews/interview-filters";

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const { status, type } = params;

  const allInterviews = await db.query.interviews.findMany({
    where: eq(interviews.userId, userId),
    orderBy: [desc(interviews.createdAt)],
    with: { questions: { columns: { id: true } } },
  });

  const filtered = allInterviews.filter((i) => {
    if (status && i.status !== status) return false;
    if (type && i.interviewType !== type) return false;
    return true;
  });

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Interviews</h1>
          <p className="text-muted-foreground mt-1">{allInterviews.length} interviews total</p>
        </div>
        <Link href="/interviews/new">
          <Button variant="gradient" className="gap-2">
            <PlusCircle className="h-4 w-4" /> New Interview
          </Button>
        </Link>
      </div>

      <InterviewFilters activeStatus={status} activeType={type} />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No interviews found</p>
          <p className="text-sm mb-6">
            {allInterviews.length > 0 ? "Try changing the filters" : "Create your first interview to get started"}
          </p>
          <Link href="/interviews/new">
            <Button variant="gradient" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Create Interview
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={{
                ...interview,
                _count: { questions: interview.questions?.length ?? 0 },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
