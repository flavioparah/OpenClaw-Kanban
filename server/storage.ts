import { db } from "./db";
import {
  tasks,
  type Task,
  type InsertTask,
  type UpdateTaskRequest,
  apiTokens,
  type ApiToken,
  type CreateApiTokenRequest,
  users,
  type User,
  type InsertUser,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface IStorage {
  // Usuários (Necessário para o login simulado funcionar)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;

  // Tasks
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(id: number, userId: string, updates: UpdateTaskRequest): Promise<Task | undefined>;
  deleteTask(id: number, userId: string): Promise<void>;
  
  // Agent methods
  getTasksForAgent(userId: string): Promise<Task[]>;
  updateTaskByAgent(id: number, userId: string, updates: UpdateTaskRequest): Promise<Task | undefined>;

  // API Tokens
  getApiTokens(userId: string): Promise<ApiToken[]>;
  createApiToken(userId: string, request: CreateApiTokenRequest): Promise<ApiToken>;
  deleteApiToken(id: number, userId: string): Promise<void>;
  getUserByApiToken(token: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // --- Métodos de Usuário ---
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .onConflictDoUpdate({
        target: users.id,
        set: insertUser,
      })
      .returning();
    return user;
  }

  // --- Métodos de Tasks ---
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(userId: string, insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({ ...insertTask, userId })
      .returning();
    return task;
  }

  async updateTask(id: number, userId: string, updates: UpdateTaskRequest): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTask(id: number, userId: string): Promise<void> {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  }

  async getTasksForAgent(userId: string): Promise<Task[]> {
     return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async updateTaskByAgent(id: number, userId: string, updates: UpdateTaskRequest): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return updated;
  }

  // --- Métodos de API Tokens ---
  async getApiTokens(userId: string): Promise<ApiToken[]> {
    return await db.select().from(apiTokens).where(eq(apiTokens.userId, userId)).orderBy(desc(apiTokens.createdAt));
  }

  async createApiToken(userId: string, request: CreateApiTokenRequest): Promise<ApiToken> {
    const token = "oc_" + randomBytes(24).toString("hex");
    const [apiToken] = await db
      .insert(apiTokens)
      .values({ 
        userId, 
        token, 
        name: request.name 
      })
      .returning();
    return apiToken;
  }

  async deleteApiToken(id: number, userId: string): Promise<void> {
    await db.delete(apiTokens).where(and(eq(apiTokens.id, id), eq(apiTokens.userId, userId)));
  }

  async getUserByApiToken(token: string): Promise<User | undefined> {
    const [tokenRecord] = await db.select().from(apiTokens).where(eq(apiTokens.token, token));
    if (!tokenRecord) return undefined;
    
    const [user] = await db.select().from(users).where(eq(users.id, tokenRecord.userId));
    return user;
  }
}

export const storage = new DatabaseStorage();
