import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CreateInterviewForm } from "@/components/interviews/create-interview-form";

export const metadata = { title: "New Interview" };

export default async function NewInterviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userResumes = await db.query.resumes.findMany({
    where: eq(resumes.userId, userId),
    orderBy: [desc(resumes.createdAt)],
    columns: { id: true, fileName: true, isDefault: true, createdAt: true },
  });

  return (
    <div className="container py-8 max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Interview</h1>
        <p className="text-muted-foreground mt-2">
          Configure your mock interview session. AI will generate personalised questions.
        </p>
      </div>
      <CreateInterviewForm resumes={userResumes} />
    </div>
  );
}
