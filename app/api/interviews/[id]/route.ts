import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interviews } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const interview = await db.query.interviews.findFirst({
      where: and(eq(interviews.id, id), eq(interviews.userId, userId)),
      with: {
        questions: { orderBy: (q, { asc }) => [asc(q.orderIndex)] },
        report: true,
      },
    });

    if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: interview });
  } catch (error) {
    console.error("[GET /api/interviews/:id]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const deleted = await db
      .delete(interviews)
      .where(and(eq(interviews.id, id), eq(interviews.userId, userId)))
      .returning();

    if (!deleted.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/interviews/:id]", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
