import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export auth models for convenience
export * from "./models/auth";

// Enums
export const statusEnum = pgEnum("status", ["pending", "todo", "in_progress", "done", "failed", "cancelled"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

// === TABLE DEFINITIONS ===
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: statusEnum("status").default("pending").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  name: text("name").notNull(), // e.g. "OpenClaw Agent 1"
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  apiTokens: many(apiTokens),
}));

export const apiTokensRelations = relations(apiTokens, ({ one }) => ({
  user: one(users, {
    fields: [apiTokens.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertApiTokenSchema = createInsertSchema(apiTokens).omit({
  id: true,
  userId: true,
  createdAt: true
});

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type ApiToken = typeof apiTokens.$inferSelect;

// Request types
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type CreateApiTokenRequest = { name: string };

// Response types
export type TaskResponse = Task;
export type TasksListResponse = Task[];
export type ApiTokenResponse = ApiToken;

// Query/filter types
export interface TasksQueryParams {
  status?: Task['status'];
  priority?: Task['priority'];
  search?: string;
  sortBy?: 'createdAt' | 'priority';
}
