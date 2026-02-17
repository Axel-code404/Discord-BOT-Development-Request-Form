import { z } from "zod";
import { insertMessageSchema, messages, users, inquiries, notifications } from "./schema";

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

export const api = {
  messages: {
    list: {
      method: "GET" as const,
      path: "/api/messages" as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    send: {
      method: "POST" as const,
      path: "/api/messages" as const,
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    listUsers: {
      method: "GET" as const,
      path: "/api/admin/users" as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { lastMessageAt: string | null }>()),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
      },
    },
    getMessages: {
      method: "GET" as const,
      path: "/api/admin/users/:userId/messages" as const,
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
    reply: {
      method: "POST" as const,
      path: "/api/admin/users/:userId/messages" as const,
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listInquiries: {
      method: "GET" as const,
      path: "/api/admin/inquiries" as const,
      responses: {
        200: z.array(z.custom<typeof inquiries.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    replyInquiry: {
      method: "POST" as const,
      path: "/api/admin/inquiries/:id/reply" as const,
      input: z.object({ reply: z.string() }),
      responses: {
        200: z.custom<typeof inquiries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  inquiries: {
    list: {
      method: "GET" as const,
      path: "/api/inquiries" as const,
      responses: {
        200: z.array(z.custom<typeof inquiries.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/inquiries" as const,
      input: z.object({ subject: z.string(), message: z.string() }),
      responses: {
        201: z.custom<typeof inquiries.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  notifications: {
    list: {
      method: "GET" as const,
      path: "/api/notifications" as const,
      responses: {
        200: z.array(z.custom<typeof notifications.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    markRead: {
      method: "PATCH" as const,
      path: "/api/notifications/:id/read" as const,
      responses: {
        204: z.null(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
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

export type MessageResponse = typeof messages.$inferSelect;
export type UserWithLastMessage = typeof users.$inferSelect & { lastMessageAt: string | null };
