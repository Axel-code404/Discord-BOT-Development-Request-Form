import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === User Routes ===

  // Get messages for current user
  app.get(api.messages.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const messages = await storage.getMessages(userId);
    res.json(messages);
  });

  // Send message (as user)
  app.post(api.messages.send.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.messages.send.input.parse(req.body);
      const message = await storage.createMessage(userId, input.content, false);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // === Inquiry Routes ===

  app.get(api.inquiries.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const inquiries = await storage.getInquiries(userId);
    res.json(inquiries);
  });

  app.post(api.inquiries.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(userId, input);
      res.status(201).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // === Notification Routes ===

  app.get(api.notifications.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const notifications = await storage.getNotifications(userId);
    res.json(notifications);
  });

  app.patch(api.notifications.markRead.path, isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    await storage.markNotificationRead(id);
    res.status(204).end();
  });

  // === Admin Routes ===
  // For MVP, we'll just check if the user is authenticated. 
  // In a real app, we'd check for an 'admin' role or specific user IDs.

  // List users with chats
  app.get(api.admin.listUsers.path, isAuthenticated, async (req: any, res) => {
    // TODO: Add admin check here
    const users = await storage.getUsersWithChats();
    res.json(users);
  });

  // Get specific user's messages
  app.get(api.admin.getMessages.path, isAuthenticated, async (req: any, res) => {
    // TODO: Add admin check here
    const userId = req.params.userId;
    const messages = await storage.getMessages(userId);
    res.json(messages);
  });

  // Reply to user (as admin)
  app.post(api.admin.reply.path, isAuthenticated, async (req: any, res) => {
    // TODO: Add admin check here
    const userId = req.params.userId;
    try {
      const input = api.admin.reply.input.parse(req.body);
      const message = await storage.createMessage(userId, input.content, true);
      
      // Also create a notification
      await storage.createNotification({
        userId,
        title: "新着メッセージ",
        message: "管理者から新しいメッセージが届きました。",
      });

      res.status(201).json(message);
    } catch (err) {
       if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.admin.listInquiries.path, isAuthenticated, async (req: any, res) => {
    // TODO: Add admin check here
    const inquiries = await storage.getInquiries();
    res.json(inquiries);
  });

  app.post(api.admin.replyInquiry.path, isAuthenticated, async (req: any, res) => {
    // TODO: Add admin check here
    const id = parseInt(req.params.id);
    try {
      const input = api.admin.replyInquiry.input.parse(req.body);
      const inquiry = await storage.updateInquiryReply(id, input.reply);
      
      // Also create a notification
      await storage.createNotification({
        userId: inquiry.userId,
        title: "お問い合わせへの返信",
        message: `「${inquiry.subject}」へのお問い合わせに返信がありました。`,
      });

      res.status(200).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  return httpServer;
}
