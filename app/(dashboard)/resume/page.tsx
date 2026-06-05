import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ResumeManager } from "@/components/resume/resume-manager";

export const metadata = { title: "Resume Manager" };

export default async function ResumePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, userId),
    orderBy: [desc(resumes.createdAt)],
    columns: { extractedText: false },
  });

  return (
    <div className="container py-8 max-w-4xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Resume Manager</h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume to get personalized interview questions based on your experience.
        </p>
      </div>
      <ResumeManager initialResumes={userResumes} />
    </div>
  );
}
