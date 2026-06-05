import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const interviewTypeEnum = pgEnum("interview_type", [
  "technical",
  "hr",
  "behavioral",
  "system_design",
  "coding",
  "mixed",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const interviewStatusEnum = pgEnum("interview_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "technical",
  "behavioral",
  "hr",
  "coding",
  "system_design",
]);

// Users table (synced from Clerk)
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interviews table
export const interviews = pgTable("interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  role: text("role").notNull(),
  experience: text("experience").notNull(), // e.g. "0-1 years", "2-5 years"
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  interviewType: interviewTypeEnum("interview_type").notNull().default("mixed"),
  status: interviewStatusEnum("status").notNull().default("pending"),
  techStack: text("tech_stack").array(), // array of technologies
  resumeUrl: text("resume_url"),
  resumeText: text("resume_text"),
  duration: integer("duration"), // in seconds
  overallScore: real("overall_score"),
  feedbackSummary: text("feedback_summary"),
  strengths: text("strengths").array(),
  weaknesses: text("weaknesses").array(),
  improvements: text("improvements").array(),
  emotionData: jsonb("emotion_data"), // aggregated emotion analysis
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Questions table
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interviews.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  questionType: questionTypeEnum("question_type").notNull(),
  orderIndex: integer("order_index").notNull(),
  expectedAnswer: text("expected_answer"),
  hints: text("hints").array(),
  codeTemplate: text("code_template"), // for coding questions
  programmingLanguage: text("programming_language"),
  difficulty: difficultyEnum("difficulty").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Answers table
export const answers = pgTable("answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interviews.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  answerText: text("answer_text"),
  codeAnswer: text("code_answer"),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  score: real("score"), // 0-100
  feedback: text("feedback"),
  strengths: text("strengths").array(),
  improvements: text("improvements").array(),
  timeTaken: integer("time_taken"), // in seconds
  emotionSnapshot: jsonb("emotion_snapshot"), // emotion at time of answer
  codeExecutionResult: jsonb("code_execution_result"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Emotion Analysis Records
export const emotionRecords = pgTable("emotion_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interviews.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  confidence: real("confidence"), // 0-1
  attention: real("attention"), // 0-1
  eyeContact: real("eye_contact"), // 0-1
  stress: real("stress"), // 0-1
  expression: text("expression"), // "neutral", "happy", "anxious", etc.
  blinkRate: real("blink_rate"),
  headPose: jsonb("head_pose"), // x, y, z rotation
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  extractedText: text("extracted_text"),
  parsedData: jsonb("parsed_data"), // structured resume data
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Interview Reports
export const interviewReports = pgTable("interview_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  interviewId: uuid("interview_id")
    .notNull()
    .unique()
    .references(() => interviews.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  overallScore: real("overall_score"),
  technicalScore: real("technical_score"),
  communicationScore: real("communication_score"),
  confidenceScore: real("confidence_score"),
  problemSolvingScore: real("problem_solving_score"),
  strengths: text("strengths").array(),
  weaknesses: text("weaknesses").array(),
  improvements: text("improvements").array(),
  detailedFeedback: text("detailed_feedback"),
  emotionSummary: jsonb("emotion_summary"),
  questionBreakdown: jsonb("question_breakdown"),
  recommendations: text("recommendations").array(),
  nextSteps: text("next_steps").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  interviews: many(interviews),
  answers: many(answers),
  emotionRecords: many(emotionRecords),
  resumes: many(resumes),
  interviewReports: many(interviewReports),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  user: one(users, {
    fields: [interviews.userId],
    references: [users.id],
  }),
  questions: many(questions),
  answers: many(answers),
  emotionRecords: many(emotionRecords),
  report: one(interviewReports, {
    fields: [interviews.id],
    references: [interviewReports.interviewId],
  }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  interview: one(interviews, {
    fields: [questions.interviewId],
    references: [interviews.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  interview: one(interviews, {
    fields: [answers.interviewId],
    references: [interviews.id],
  }),
  user: one(users, {
    fields: [answers.userId],
    references: [users.id],
  }),
}));

export const emotionRecordsRelations = relations(emotionRecords, ({ one }) => ({
  interview: one(interviews, {
    fields: [emotionRecords.interviewId],
    references: [interviews.id],
  }),
  user: one(users, {
    fields: [emotionRecords.userId],
    references: [users.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

export const interviewReportsRelations = relations(
  interviewReports,
  ({ one }) => ({
    interview: one(interviews, {
      fields: [interviewReports.interviewId],
      references: [interviews.id],
    }),
    user: one(users, {
      fields: [interviewReports.userId],
      references: [users.id],
    }),
  })
);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type EmotionRecord = typeof emotionRecords.$inferSelect;
export type NewEmotionRecord = typeof emotionRecords.$inferInsert;
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type InterviewReport = typeof interviewReports.$inferSelect;
export type NewInterviewReport = typeof interviewReports.$inferInsert;
