import { z } from 'zod';
import { insertTaskSchema, tasks, apiTokens, insertApiTokenSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks' as const,
      input: z.object({
        status: z.enum(["pending", "todo", "in_progress", "done", "failed", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks' as const,
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id' as const,
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  apiTokens: {
    list: {
      method: 'GET' as const,
      path: '/api/tokens' as const,
      responses: {
        200: z.array(z.custom<typeof apiTokens.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tokens' as const,
      input: z.object({ name: z.string().min(1) }),
      responses: {
        201: z.object({ token: z.string(), name: z.string(), id: z.number(), createdAt: z.string().optional() }),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tokens/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  // Agent API (Authenticated via Token)
  agent: {
    listTasks: {
      method: 'GET' as const,
      path: '/api/agent/tasks' as const,
      input: z.object({
        status: z.enum(["pending", "todo", "in_progress", "done", "failed", "cancelled"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    updateTask: {
      method: 'PATCH' as const,
      path: '/api/agent/tasks/:id' as const,
      input: z.object({
        status: z.enum(["pending", "todo", "in_progress", "done", "failed", "cancelled"]).optional(),
        description: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
