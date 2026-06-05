import { Router, Request, Response } from "express";
import { generateInterviewQuestions, evaluateAnswer } from "../../lib/ai/gemini";

export const interviewRouter = Router();

interviewRouter.post("/generate-questions", async (req: Request, res: Response) => {
  try {
    const { role, experience, difficulty, interviewType, techStack, numberOfQuestions, resumeText } = req.body;

    if (!role || !experience || !difficulty || !interviewType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const questions = await generateInterviewQuestions({
      role,
      experience,
      difficulty,
      interviewType,
      techStack: techStack || [],
      numberOfQuestions: numberOfQuestions || 10,
      resumeText,
    });

    res.json({ success: true, data: questions });
  } catch (error) {
    console.error("[POST /interview/generate-questions]", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

interviewRouter.post("/evaluate-answer", async (req: Request, res: Response) => {
  try {
    const { question, answer, questionType, expectedAnswer, role, experience } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const evaluation = await evaluateAnswer({ question, answer, questionType, expectedAnswer, role, experience });
    res.json({ success: true, data: evaluation });
  } catch (error) {
    console.error("[POST /interview/evaluate-answer]", error);
    res.status(500).json({ error: "Evaluation failed" });
  }
});
