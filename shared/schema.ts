import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  quizData: jsonb("quiz_data").notNull(),
  score: integer("score").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Single quiz question schema
const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string()
});

// Chapter schema
const chapterSchema = z.object({
  chapterName: z.string(),
  quizQuestions: z.array(quizQuestionSchema)
});

// Quiz schema - allows either a single subject or an array of subjects
export const quizSchema = z.union([
  // Single subject format
  z.object({
    subject: z.string(),
    chapters: z.array(chapterSchema)
  }),
  // Array of subjects format
  z.array(z.object({
    subject: z.string(),
    chapters: z.array(chapterSchema)
  }))
]);

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).pick({
  userId: true,
  quizData: true,
  score: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Quiz = z.infer<typeof quizSchema>;