
import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workEntries = pgTable("work_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  eventName: text("event_name").notNull(),
  eventLocation: text("event_location").notNull(),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  breakDuration: numeric("break_duration").notNull(),
  hourlyRate: numeric("hourly_rate").notNull(),
  totalHours: numeric("total_hours").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  signature: text("signature").notNull(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const insertWorkEntrySchema = createInsertSchema(workEntries).extend({
  date: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  breakDuration: z.coerce.number().min(0),
  hourlyRate: z.coerce.number().positive(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type InsertWorkEntry = z.infer<typeof insertWorkEntrySchema>;
export type WorkEntry = typeof workEntries.$inferSelect;
export type User = typeof users.$inferSelect;
