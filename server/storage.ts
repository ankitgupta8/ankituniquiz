import { User, InsertUser, QuizAttempt, InsertQuizAttempt } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempts(userId: number): Promise<QuizAttempt[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizAttempts: Map<number, QuizAttempt>;
  sessionStore: session.Store;
  currentId: number;
  currentQuizId: number;

  constructor() {
    this.users = new Map();
    this.quizAttempts = new Map();
    this.currentId = 1;
    this.currentQuizId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.currentQuizId++;
    const quizAttempt = { 
      ...attempt, 
      id,
      timestamp: new Date()
    };
    this.quizAttempts.set(id, quizAttempt);
    return quizAttempt;
  }

  async getQuizAttempts(userId: number): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values())
      .filter(attempt => attempt.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const storage = new MemStorage();
