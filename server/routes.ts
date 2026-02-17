import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === User API Routes (Authenticated via Session) ===

  // List tasks
  app.get(api.tasks.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Create task
  app.post(api.tasks.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.tasks.create.input.parse(req.body);
      const task = await storage.createTask(userId, input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Get task
  app.get(api.tasks.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const task = await storage.getTask(Number(req.params.id));
      
      if (!task || task.userId !== userId) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Update task
  app.patch(api.tasks.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.tasks.update.input.parse(req.body);
      const updated = await storage.updateTask(Number(req.params.id), userId, input);
      
      if (!updated) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Delete task
  app.delete(api.tasks.delete.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteTask(Number(req.params.id), userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // === API Token Routes ===
  
  app.get(api.apiTokens.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const tokens = await storage.getApiTokens(userId);
    res.json(tokens);
  });

  app.post(api.apiTokens.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.apiTokens.create.input.parse(req.body);
      const token = await storage.createApiToken(userId, input);
      res.status(201).json(token);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.apiTokens.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteApiToken(Number(req.params.id), userId);
    res.status(204).send();
  });

  // === Agent API Routes (Authenticated via Bearer Token) ===
  
  // Middleware for API Token Auth
  const apiTokenAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Missing Bearer token" });
    }
    
    const token = authHeader.split(" ")[1];
    const user = await storage.getUserByApiToken(token);
    
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    
    req.agentUser = user;
    next();
  };

  app.get(api.agent.listTasks.path, apiTokenAuth, async (req: any, res) => {
    const tasks = await storage.getTasksForAgent(req.agentUser.id);
    res.json(tasks);
  });

  app.patch(api.agent.updateTask.path, apiTokenAuth, async (req: any, res) => {
    try {
      const input = api.agent.updateTask.input.parse(req.body);
      const updated = await storage.updateTaskByAgent(Number(req.params.id), req.agentUser.id, input);
      
      if (!updated) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
