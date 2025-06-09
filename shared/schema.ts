import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
});

export const poolTables = pgTable("pool_tables", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  serialNumber: text("serial_number").notNull(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  accountNumber: text("account_number").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  dailyEarnings: decimal("daily_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  dailyGamesPlayed: integer("daily_games_played").notNull().default(0),
  totalGamesPlayed: integer("total_games_played").notNull().default(0),
  status: text("status").notNull().default("active"),
  registrationDate: timestamp("registration_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  deviceId: text("device_id").notNull(),
  accountNumber: text("account_number").notNull(),
  payerName: text("payer_name").notNull(),
  payerPhone: text("payer_phone").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // "payment" or "withdrawal"
  status: text("status").notNull(), // "game_played", "payment_only", "withdrawal"
  transactionDate: timestamp("transaction_date").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  withdrawalId: text("withdrawal_id").notNull().unique(),
  accountNumber: text("account_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("completed"),
  withdrawalDate: timestamp("withdrawal_date").defaultNow().notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  accountNumber: text("account_number").notNull(),
  userEmail: text("user_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phoneNumber: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  ticketId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPoolTableSchema = createInsertSchema(poolTables).omit({
  id: true,
  registrationDate: true,
  lastUpdated: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  transactionDate: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  withdrawalDate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type PoolTable = typeof poolTables.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertPoolTable = z.infer<typeof insertPoolTableSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
