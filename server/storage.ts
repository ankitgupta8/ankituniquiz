import { User, InsertUser, QuizAttempt, InsertQuizAttempt } from "@shared/schema";
import session from "express-session";
import { db, users, quizAttempts } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempts(userId: number): Promise<QuizAttempt[]>;
  createBookmark(userId: number, questionData: any): Promise<Bookmark>;
  getBookmarks(userId: number): Promise<Bookmark[]>;
  deleteBookmark(bookmarkId: number): Promise<void>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async createBookmark(userId: number, questionData: any): Promise<Bookmark> {
    const [bookmark] = await db
      .insert(bookmarks)
      .values({ userId, questionData })
      .returning();
    return bookmark;
  }

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(bookmarks.timestamp);
  }

  async deleteBookmark(bookmarkId: number): Promise<void> {
    await db
      .delete(bookmarks)
      .where(eq(bookmarks.id, bookmarkId));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [quizAttempt] = await db
      .insert(quizAttempts)
      .values(attempt)
      .returning();
    return quizAttempt;
  }

  async getQuizAttempts(userId: number): Promise<QuizAttempt[]> {
    return db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(quizAttempts.timestamp);
  }
}

export const storage = new DatabaseStorage();