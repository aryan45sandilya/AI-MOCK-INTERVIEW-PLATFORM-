import { z } from "zod";

// ============ Interview Types ============
export const InterviewTypeEnum = z.enum([
  "technical",
  "hr",
  "behavioral",
  "system_design",
  "coding",
  "mixed",
]);

export const DifficultyEnum = z.enum(["easy", "medium", "hard"]);

export const InterviewStatusEnum = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const QuestionTypeEnum = z.enum([
  "technical",
  "behavioral",
  "hr",
  "coding",
  "system_design",
]);

// ============ Zod Schemas ============
export const CreateInterviewSchema = z.object({
  title: z.string().max(100).optional().or(z.literal("")),
  role: z.string().min(2, "Role is required").max(100),
  experience: z.enum([
    "Beginner (No Experience)",
    "0-1 years",
    "1-2 years",
    "2-5 years",
    "5-8 years",
    "8+ years",
  ]),
  difficulty: DifficultyEnum,
  interviewType: InterviewTypeEnum,
  techStack: z.array(z.string()).default([]),
  resumeId: z.string().optional(),
  numberOfQuestions: z.number().min(5).max(20).default(10),
});

export const UpdateInterviewSchema = CreateInterviewSchema.partial();

export const SubmitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  interviewId: z.string().uuid(),
  answerText: z.string().optional(),
  codeAnswer: z.string().optional(),
  transcription: z.string().optional(),
  timeTaken: z.number().optional(),
  emotionSnapshot: z
    .object({
      confidence: z.number(),
      attention: z.number(),
      eyeContact: z.number(),
      stress: z.number(),
      expression: z.string(),
    })
    .optional(),
});

export const CreateUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const UploadResumeSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileSize: z.number().optional(),
});

export const EmotionDataSchema = z.object({
  confidence: z.number().min(0).max(1),
  attention: z.number().min(0).max(1),
  eyeContact: z.number().min(0).max(1),
  stress: z.number().min(0).max(1),
  expression: z.string(),
  blinkRate: z.number().optional(),
  headPose: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
});

export const CodeExecutionSchema = z.object({
  code: z.string(),
  language: z.enum([
    "javascript",
    "typescript",
    "python",
    "java",
    "cpp",
    "go",
    "rust",
  ]),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
      })
    )
    .optional(),
});

// ============ Inferred Types ============
export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof UpdateInterviewSchema>;
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UploadResumeInput = z.infer<typeof UploadResumeSchema>;
export type EmotionData = z.infer<typeof EmotionDataSchema>;
export type CodeExecutionInput = z.infer<typeof CodeExecutionSchema>;

// ============ UI Types ============
export interface InterviewQuestion {
  id: string;
  questionText: string;
  questionType: string;
  orderIndex: number;
  difficulty: string;
  codeTemplate?: string;
  programmingLanguage?: string;
  hints?: string[];
}

export interface InterviewWithDetails {
  id: string;
  title: string;
  role: string;
  experience: string;
  difficulty: string;
  interviewType: string;
  status: string;
  techStack?: string[];
  overallScore?: number;
  duration?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  questions?: InterviewQuestion[];
  _count?: {
    questions: number;
    answers: number;
  };
}

export interface EmotionMetrics {
  confidence: number;
  attention: number;
  eyeContact: number;
  stress: number;
  expression: string;
  timestamp: number;
}

export interface DashboardStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  improvementRate: number;
  strongestSkill: string;
  weeklyActivity: { date: string; count: number }[];
  scoreHistory: { date: string; score: number }[];
  skillBreakdown: { skill: string; score: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type InterviewType = z.infer<typeof InterviewTypeEnum>;
export type Difficulty = z.infer<typeof DifficultyEnum>;
export type InterviewStatus = z.infer<typeof InterviewStatusEnum>;
export type QuestionType = z.infer<typeof QuestionTypeEnum>;
