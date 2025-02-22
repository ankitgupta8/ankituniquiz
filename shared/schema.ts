import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
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
  isQuizCreation: boolean("is_quiz_creation").default(false),
});

export const bookmarkedQuestions = pgTable("bookmarked_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  chapterName: text("chapter_name").notNull(),
  question: text("question").notNull(),
  options: text("options").array(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).pick({
  userId: true,
  quizData: true,
  score: true,
});

export const insertBookmarkedQuestionSchema = createInsertSchema(bookmarkedQuestions).pick({
  userId: true,
  subject: true,
  chapterName: true,
  question: true,
  options: true,
  correctAnswer: true,
  explanation: true,
});

export const quizSchema = z.array(z.object({
  subject: z.string(),
  chapters: z.array(z.object({
    chapterName: z.string(),
    quizQuestions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.string(),
      explanation: z.string()
    }))
  }))
}));

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Quiz = z.infer<typeof quizSchema>;
export type InsertBookmarkedQuestion = z.infer<typeof insertBookmarkedQuestionSchema>;
export type BookmarkedQuestion = typeof bookmarkedQuestions.$inferSelect;