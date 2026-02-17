import { db } from "./db";
import { messages, users, inquiries, notifications, type Message, type User, type Inquiry, type Notification, type InsertInquiry, type InsertNotification } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: any): Promise<User>;
  
  // Message methods
  getMessages(userId: string): Promise<Message[]>;
  createMessage(userId: string, content: string, isFromAdmin: boolean): Promise<Message>;
  getUsersWithChats(): Promise<(User & { lastMessageAt: Date | null })[]>;

  // Inquiry methods
  createInquiry(userId: string, insertInquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(userId?: string): Promise<Inquiry[]>;
  getInquiry(id: number): Promise<Inquiry | undefined>;
  updateInquiryReply(id: number, reply: string): Promise<Inquiry>;

  // Notification methods
  createNotification(insertNotification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return authStorage.getUser(id);
  }

  async upsertUser(user: any): Promise<User> {
    return authStorage.upsertUser(user);
  }

  async getMessages(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.createdAt);
  }

  async createMessage(userId: string, content: string, isFromAdmin: boolean): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        userId,
        content,
        isFromAdmin,
      })
      .returning();
    return message;
  }

  async getUsersWithChats(): Promise<(User & { lastMessageAt: Date | null })[]> {
    const usersList = await db.select().from(users);
    
    const usersWithLastMessage = await Promise.all(usersList.map(async (user) => {
      const [lastMsg] = await db
        .select({ createdAt: messages.createdAt })
        .from(messages)
        .where(eq(messages.userId, user.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
        
      return {
        ...user,
        lastMessageAt: lastMsg ? lastMsg.createdAt : null
      };
    }));

    return usersWithLastMessage
      .filter(u => u.lastMessageAt !== null)
      .sort((a, b) => (b.lastMessageAt!.getTime() - a.lastMessageAt!.getTime()));
  }

  // Inquiry methods
  async createInquiry(userId: string, insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values({ ...insertInquiry, userId })
      .returning();
    return inquiry;
  }

  async getInquiries(userId?: string): Promise<Inquiry[]> {
    const query = db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    if (userId) {
      return query.where(eq(inquiries.userId, userId));
    }
    return query;
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async updateInquiryReply(id: number, reply: string): Promise<Inquiry> {
    const [inquiry] = await db
      .update(inquiries)
      .set({ reply, status: "replied" })
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry;
  }

  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
