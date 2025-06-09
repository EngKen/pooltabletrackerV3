import { poolTables, transactions, withdrawals, users, supportTickets, type User, type InsertUser, type PoolTable, type Transaction, type Withdrawal, type SupportTicket, type InsertSupportTicket } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPoolTablesByAccount(accountNumber: string): Promise<PoolTable[]>;
  getTransactionsByAccount(accountNumber: string): Promise<Transaction[]>;
  getWithdrawalsByAccount(accountNumber: string): Promise<Withdrawal[]>;
  createWithdrawal(withdrawal: { accountNumber: string; amount: number; password: string }): Promise<Withdrawal>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  validateUserPassword(username: string, password: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private poolTables: Map<string, PoolTable>;
  private transactions: Map<string, Transaction>;
  private withdrawals: Map<string, Withdrawal>;
  private supportTickets: Map<string, SupportTicket>;
  private currentUserId: number;
  private currentDeviceId: number;
  private currentTicketId: number;

  constructor() {
    this.users = new Map();
    this.poolTables = new Map();
    this.transactions = new Map();
    this.withdrawals = new Map();
    this.supportTickets = new Map();
    this.currentUserId = 1;
    this.currentDeviceId = 1;
    this.currentTicketId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample user
    const sampleUser: User = {
      id: 1,
      username: "ACC001",
      password: "password123",
      name: "Joseph Kiprotich",
      email: "joseph@kentronicssolutions.com",
      phoneNumber: "+254700123456"
    };
    this.users.set(1, sampleUser);

    // Sample pool tables
    const poolTable1: PoolTable = {
      id: 1,
      deviceId: "PT001",
      serialNumber: "KT2024001",
      name: "Pool Table Alpha",
      location: "Downtown Sports Bar",
      accountNumber: "ACC001",
      balance: "12500.00",
      dailyEarnings: "800.00",
      dailyGamesPlayed: 8,
      totalGamesPlayed: 245,
      status: "active",
      registrationDate: new Date("2024-12-15"),
      lastUpdated: new Date()
    };

    const poolTable2: PoolTable = {
      id: 2,
      deviceId: "PT002",
      serialNumber: "KT2024002", 
      name: "Pool Table Beta",
      location: "Westside Recreation Center",
      accountNumber: "ACC001",
      balance: "8750.00",
      dailyEarnings: "500.00",
      dailyGamesPlayed: 5,
      totalGamesPlayed: 182,
      status: "active",
      registrationDate: new Date("2024-12-20"),
      lastUpdated: new Date()
    };

    this.poolTables.set("PT001", poolTable1);
    this.poolTables.set("PT002", poolTable2);

    // Sample transactions
    const transaction1: Transaction = {
      id: 1,
      transactionId: "TXN001234",
      deviceId: "PT001",
      accountNumber: "ACC001",
      payerName: "John Kiprotich",
      payerPhone: "+254700123456",
      amount: "100.00",
      type: "payment",
      status: "game_played",
      transactionDate: new Date()
    };

    const transaction2: Transaction = {
      id: 2,
      transactionId: "TXN001235",
      deviceId: "PT002",
      accountNumber: "ACC001",
      payerName: "Mary Wanjiku",
      payerPhone: "+254722987654",
      amount: "100.00",
      type: "payment",
      status: "game_played",
      transactionDate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    };

    this.transactions.set("TXN001234", transaction1);
    this.transactions.set("TXN001235", transaction2);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      phoneNumber: insertUser.phoneNumber || null
    };
    this.users.set(id, user);
    return user;
  }

  async getPoolTablesByAccount(accountNumber: string): Promise<PoolTable[]> {
    return Array.from(this.poolTables.values()).filter(
      (table) => table.accountNumber === accountNumber
    );
  }

  async getTransactionsByAccount(accountNumber: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.accountNumber === accountNumber)
      .sort((a, b) => {
        const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
        const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async getWithdrawalsByAccount(accountNumber: string): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
      .filter((withdrawal) => withdrawal.accountNumber === accountNumber)
      .sort((a, b) => {
        const dateA = a.withdrawalDate ? new Date(a.withdrawalDate).getTime() : 0;
        const dateB = b.withdrawalDate ? new Date(b.withdrawalDate).getTime() : 0;
        return dateB - dateA;
      });
  }

  async validateUserPassword(username: string, password: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return user ? user.password === password : false;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const ticketId = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newTicket: SupportTicket = {
      id: this.currentTicketId++,
      ticketId,
      accountNumber: ticket.accountNumber,
      userEmail: ticket.userEmail,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status || "open",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.supportTickets.set(ticketId, newTicket);
    return newTicket;
  }

  async createWithdrawal(withdrawal: { accountNumber: string; amount: number; password: string }): Promise<Withdrawal> {
    // Validate password first
    const isValidPassword = await this.validateUserPassword(withdrawal.accountNumber, withdrawal.password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    const withdrawalId = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newWithdrawal: Withdrawal = {
      id: this.withdrawals.size + 1,
      withdrawalId,
      accountNumber: withdrawal.accountNumber,
      amount: withdrawal.amount.toString(),
      status: "completed",
      withdrawalDate: new Date()
    };
    
    this.withdrawals.set(withdrawalId, newWithdrawal);
    
    // Update pool table balances - deduct proportionally
    const tables = await this.getPoolTablesByAccount(withdrawal.accountNumber);
    const totalBalance = tables.reduce((sum, table) => sum + parseFloat(table.balance), 0);
    
    if (totalBalance >= withdrawal.amount) {
      let remainingAmount = withdrawal.amount;
      
      for (const table of tables) {
        const tableBalance = parseFloat(table.balance);
        if (remainingAmount <= 0 || tableBalance <= 0) continue;
        
        const deductionFromTable = Math.min(tableBalance, remainingAmount);
        const newBalance = tableBalance - deductionFromTable;
        
        const updatedTable = { ...table, balance: newBalance.toFixed(2), lastUpdated: new Date() };
        this.poolTables.set(table.deviceId, updatedTable);
        
        remainingAmount -= deductionFromTable;
      }
    }
    
    return newWithdrawal;
  }
}

export const storage = new MemStorage();
