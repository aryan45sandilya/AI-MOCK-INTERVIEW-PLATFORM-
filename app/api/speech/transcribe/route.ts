import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) return NextResponse.json({ error: "No audio file" }, { status: 400 });
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const result = await transcribeAudio(buffer, audioFile.name || "audio.webm");

    return NextResponse.json({ success: true, text: result.text, duration: result.duration });
  } catch (error) {
    console.error("[POST /api/speech/transcribe]", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
