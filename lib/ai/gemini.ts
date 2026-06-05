/**
 * AI service — uses Groq (llama-3.3-70b) as the primary engine.
 * Groq is free, fast, and OpenAI-SDK compatible.
 */
import OpenAI from "openai";

// Groq uses OpenAI-compatible SDK
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? "",
  baseURL: "https://api.groq.com/openai/v1",
});

async function generateJSON<T>(prompt: string): Promise<T> {
  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are an expert AI assistant. Always respond with valid JSON only. No markdown, no explanation, just raw JSON.",
      },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0].message.content ?? "{}";

  // Strip markdown code blocks if present
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  // Extract JSON array or object
  const match = clean.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (!match) throw new Error("No valid JSON in response: " + clean.substring(0, 200));

  const parsed = JSON.parse(match[0]);

  // Unwrap { questions: [...] } if needed
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.questions) {
    return parsed.questions as T;
  }

  return parsed as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GeneratedQuestion {
  questionText: string;
  questionType: "technical" | "behavioral" | "hr" | "coding" | "system_design";
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer?: string;
  hints?: string[];
  codeTemplate?: string;
  programmingLanguage?: string;
}

export interface AIEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewReport {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  detailedFeedback: string;
  recommendations: string[];
  nextSteps: string[];
}

// ─── Generate interview questions ─────────────────────────────────────────────
export async function generateInterviewQuestions(params: {
  role: string;
  experience: string;
  difficulty: string;
  interviewType: string;
  techStack: string[];
  numberOfQuestions: number;
  resumeText?: string;
}): Promise<GeneratedQuestion[]> {
  const { role, experience, difficulty, interviewType, techStack, numberOfQuestions, resumeText } = params;

  const resumeCtx = resumeText
    ? `\nCandidate Resume:\n${resumeText.substring(0, 1500)}`
    : "";

  const prompt = `Generate exactly ${numberOfQuestions} interview questions as a JSON array.

Role: ${role}
Experience: ${experience}
Difficulty: ${difficulty}
Type: ${interviewType}
Tech Stack: ${techStack.join(", ")}
${resumeCtx}

Rules:
- "mixed" type: include technical, behavioral, and HR questions
- "coding" type: include coding problems with a code template
- "behavioral": use STAR method format
- Match difficulty: ${difficulty}

Return ONLY a raw JSON array like this (no markdown):
[
  {
    "questionText": "Explain the difference between REST and GraphQL",
    "questionType": "technical",
    "difficulty": "medium",
    "expectedAnswer": "REST uses fixed endpoints, GraphQL uses single endpoint with flexible queries",
    "hints": ["Think about data fetching patterns", "Consider over-fetching"],
    "codeTemplate": "",
    "programmingLanguage": ""
  }
]`;

  const result = await generateJSON<GeneratedQuestion[]>(prompt);
  const arr = Array.isArray(result) ? result : [];
  return arr.map((q) => ({
    ...q,
    questionType: (q.questionType?.toLowerCase().replace(" ", "_") ?? "technical") as GeneratedQuestion["questionType"],
    difficulty: (q.difficulty?.toLowerCase() ?? "medium") as GeneratedQuestion["difficulty"],
  }));
}

// ─── Evaluate answer ──────────────────────────────────────────────────────────
export async function evaluateAnswer(params: {
  question: string;
  answer: string;
  questionType: string;
  expectedAnswer?: string;
  role: string;
  experience: string;
}): Promise<AIEvaluation> {
  const { question, answer, questionType, expectedAnswer, role, experience } = params;

  const prompt = `Evaluate this interview answer and return a JSON object.

Role: ${role} | Experience: ${experience} | Type: ${questionType}
Question: ${question}
${expectedAnswer ? `Expected key points: ${expectedAnswer}` : ""}
Candidate Answer: ${answer || "No answer provided"}

Return ONLY this raw JSON:
{
  "score": 72,
  "feedback": "Good understanding of core concepts. Could elaborate more on practical examples.",
  "strengths": ["Clear explanation", "Used relevant example"],
  "improvements": ["Add more detail on edge cases", "Mention performance implications"]
}`;

  return generateJSON<AIEvaluation>(prompt);
}

// ─── Generate interview report ────────────────────────────────────────────────
export async function generateInterviewReport(params: {
  role: string;
  experience: string;
  interviewType: string;
  questionsAndAnswers: Array<{ question: string; answer: string; score: number; questionType: string }>;
  emotionSummary?: { averageConfidence: number; averageAttention: number; averageEyeContact: number; averageStress: number };
}): Promise<InterviewReport> {
  const { role, experience, interviewType, questionsAndAnswers, emotionSummary } = params;

  const qaText = questionsAndAnswers
    .slice(0, 8) // limit to avoid token overflow
    .map((qa, i) => `Q${i + 1}(${qa.questionType}): ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/100`)
    .join("\n\n");

  const emotionCtx = emotionSummary
    ? `Emotion: Confidence ${Math.round(emotionSummary.averageConfidence * 100)}%, Attention ${Math.round(emotionSummary.averageAttention * 100)}%`
    : "";

  const prompt = `Generate an interview performance report as a JSON object.

Role: ${role} | Experience: ${experience} | Type: ${interviewType}
${emotionCtx}

Q&A:
${qaText}

Return ONLY this raw JSON:
{
  "overallScore": 74,
  "technicalScore": 78,
  "communicationScore": 70,
  "confidenceScore": 72,
  "problemSolvingScore": 75,
  "strengths": ["Strong technical foundation", "Clear communication", "Good problem-solving approach"],
  "weaknesses": ["Needs more depth on system design", "Could improve on edge case handling"],
  "improvements": ["Study distributed systems", "Practice coding under time pressure", "Work on explaining trade-offs"],
  "detailedFeedback": "Overall solid performance with good technical knowledge...",
  "recommendations": ["Review system design patterns", "Practice mock interviews"],
  "nextSteps": ["Study 1 system design topic per week", "Do 3 LeetCode problems daily", "Record yourself answering questions"]
}`;

  return generateJSON<InterviewReport>(prompt);
}

// ─── Resume-based questions ───────────────────────────────────────────────────
export async function generateResumeBasedQuestions(params: {
  resumeText: string;
  role: string;
  experience: string;
  numberOfQuestions?: number;
}): Promise<GeneratedQuestion[]> {
  const { resumeText, role, experience, numberOfQuestions = 5 } = params;

  const prompt = `Generate ${numberOfQuestions} targeted interview questions based on this resume for ${role} (${experience}).

Resume:
${resumeText.substring(0, 2000)}

Return ONLY a raw JSON array:
[
  {
    "questionText": "...",
    "questionType": "technical",
    "difficulty": "medium",
    "expectedAnswer": "key points",
    "hints": []
  }
]`;

  const result = await generateJSON<GeneratedQuestion[]>(prompt);
  return Array.isArray(result) ? result : [];
}
