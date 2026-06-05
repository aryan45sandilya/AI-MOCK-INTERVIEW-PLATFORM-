import { Router, Request, Response } from "express";
import multer from "multer";
import { transcribeAudio } from "../../lib/ai/openai";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export const speechRouter = Router();

speechRouter.post("/transcribe", upload.single("audio"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const result = await transcribeAudio(req.file.buffer, req.file.originalname || "audio.webm");
    res.json({ success: true, text: result.text, duration: result.duration });
  } catch (error) {
    console.error("[POST /speech/transcribe]", error);
    res.status(500).json({ error: "Transcription failed" });
  }
});
