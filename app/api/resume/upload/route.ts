export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseResumeFile } from "@/lib/pdf-parser";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const setDefault = formData.get("setDefault") === "true";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse
    let extractedText = "";
    let parsedData: Record<string, unknown> = {};
    try {
      const parsed = await parseResumeFile(buffer);
      extractedText = parsed.text;
      parsedData = { skills: parsed.skills, experience: parsed.experience, education: parsed.education };
    } catch (e) {
      console.error("PDF parse error:", e);
    }

    // Ensure user row
    await db.insert(users).values({ id: userId, email: `${userId}@clerk.local` }).onConflictDoNothing();

    // Persist file
    const uploadsDir = join(process.cwd(), "public", "uploads", userId);
    await mkdir(uploadsDir, { recursive: true });
    const fileName = `${randomUUID()}.pdf`;
    await writeFile(join(uploadsDir, fileName), buffer);
    const fileUrl = `/uploads/${userId}/${fileName}`;

    if (setDefault) {
      await db.update(resumes).set({ isDefault: false }).where(eq(resumes.userId, userId));
    }

    const [resume] = await db
      .insert(resumes)
      .values({ userId, fileName: file.name, fileUrl, fileSize: file.size, extractedText, parsedData, isDefault: setDefault })
      .returning();

    return NextResponse.json({ success: true, data: resume }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/resume/upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await db.query.resumes.findMany({
      where: eq(resumes.userId, userId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      columns: { extractedText: false },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}
