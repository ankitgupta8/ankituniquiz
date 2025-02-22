import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { quizSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/quizzes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const quizData = quizSchema.parse(req.body.quizData);
      const score = req.body.score;
      const isQuizCreation = req.body.isQuizCreation || false;

      const attempt = await storage.createQuizAttempt({
        userId: req.user.id,
        quizData,
        score,
        isQuizCreation
      });

      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid quiz data format" });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.get("/api/quizzes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const attempts = await storage.getQuizAttempts(req.user.id);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const bookmark = await storage.createBookmark(req.user.id, req.body.questionData);
      res.status(201).json(bookmark);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/bookmarks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const bookmarks = await storage.getBookmarks(req.user.id);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      await storage.deleteBookmark(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}