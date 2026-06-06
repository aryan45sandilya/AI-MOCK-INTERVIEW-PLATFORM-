export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emotionRecords } from "@/lib/db/schema";
import { EmotionDataSchema } from "@/types";
import { z } from "zod";

const EmotionPayloadSchema = EmotionDataSchema.extend({
  interviewId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  // Fire-and-forget — respond immediately, save in background
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const body = await req.json();
    const data = EmotionPayloadSchema.parse(body);

    // Don't await — just fire and forget
    db.insert(emotionRecords)
      .values({
        interviewId: data.interviewId,
        userId,
        confidence: data.confidence,
        attention: data.attention,
        eyeContact: data.eyeContact,
        stress: data.stress,
        expression: data.expression,
        blinkRate: data.blinkRate,
        headPose: data.headPose,
      })
      .catch(() => {}); // silently ignore errors

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
