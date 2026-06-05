import OpenAI from "openai";
import { Readable } from "stream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionResult {
  text: string;
  duration?: number;
}

// Transcribe audio using Whisper
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = "audio.webm"
): Promise<TranscriptionResult> {
  const file = new File([audioBuffer], filename, { type: "audio/webm" });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "en",
    response_format: "verbose_json",
  });

  return {
    text: transcription.text,
    duration: transcription.duration,
  };
}

// Evaluate answer using GPT-4o
export async function evaluateAnswerGPT4(params: {
  question: string;
  answer: string;
  questionType: string;
  expectedAnswer?: string;
  role: string;
  experience: string;
}): Promise<{
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}> {
  const { question, answer, questionType, expectedAnswer, role, experience } =
    params;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer. Evaluate interview answers objectively and constructively. Always return valid JSON.",
      },
      {
        role: "user",
        content: `Evaluate this interview answer:

Role: ${role}
Experience: ${experience}
Question Type: ${questionType}
Question: ${question}
${expectedAnswer ? `Expected Key Points: ${expectedAnswer}` : ""}
Candidate Answer: ${answer}

Return JSON only:
{
  "score": <0-100>,
  "feedback": "detailed feedback",
  "strengths": ["s1", "s2"],
  "improvements": ["i1", "i2"]
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from GPT-4o");

  return JSON.parse(content);
}

// Generate questions using GPT-4o
export async function generateQuestionsGPT4(params: {
  role: string;
  experience: string;
  difficulty: string;
  interviewType: string;
  techStack: string[];
  numberOfQuestions: number;
  resumeText?: string;
}) {
  const {
    role,
    experience,
    difficulty,
    interviewType,
    techStack,
    numberOfQuestions,
    resumeText,
  } = params;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer. Generate realistic interview questions. Always return valid JSON.",
      },
      {
        role: "user",
        content: `Generate ${numberOfQuestions} interview questions:
Role: ${role}, Experience: ${experience}, Difficulty: ${difficulty}
Type: ${interviewType}, Tech Stack: ${techStack.join(", ")}
${resumeText ? `Resume: ${resumeText.substring(0, 1500)}` : ""}

Return JSON array only:
[{"questionText":"...","questionType":"technical|behavioral|hr|coding","difficulty":"easy|medium|hard","expectedAnswer":"...","hints":[],"codeTemplate":"","programmingLanguage":""}]`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from GPT-4o");

  const parsed = JSON.parse(content);
  return Array.isArray(parsed) ? parsed : parsed.questions || [];
}
