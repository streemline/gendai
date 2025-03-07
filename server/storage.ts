
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { workEntries, users, type InsertWorkEntry, type InsertUser, type LoginUser } from "@shared/schema";
import { and, eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres");
export const db = drizzle(client);

export const storage = {
  async createUser(data: InsertUser) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [user] = await db.insert(users).values({
      email: data.email,
      passwordHash,
      name: data.name,
    }).returning();
    return user;
  },

  async loginUser(data: LoginUser) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });
    
    if (!user) return null;
    
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) return null;
    
    return user;
  },

  async getWorkEntries(userId: number) {
    return await db.select().from(workEntries).where(eq(workEntries.userId, userId));
  },

  async createWorkEntry(userId: number, data: InsertWorkEntry) {
    const [entry] = await db.insert(workEntries).values({
      ...data,
      userId,
    }).returning();
    return entry;
  },
};
