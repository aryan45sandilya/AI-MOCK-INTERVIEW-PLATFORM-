import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const resume = await db.query.resumes.findFirst({
      where: and(eq(resumes.id, id), eq(resumes.userId, userId)),
    });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      await unlink(join(process.cwd(), "public", resume.fileUrl));
    } catch {
      // file may already be gone
    }

    await db.delete(resumes).where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/resume/:id]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
