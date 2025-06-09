import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const LoginSchema = z.object({
  accountId: z.string(),
  password: z.string()
});

const WithdrawSchema = z.object({
  accountNumber: z.string(),
  amount: z.number().min(100),
  password: z.string()
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { accountId, password } = LoginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(accountId);
      if (!user || user.password !== password) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }

      // Generate a simple token (in production, use proper JWT)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
      
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: `Account Holder ${user.username}`,
          accountNumber: user.username,
          phoneNumber: "+254700000000"
        }
      });
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid request data" 
      });
    }
  });

  // Get user dashboard data
  app.get("/api/users/:id/dashboard", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const poolTables = await storage.getPoolTablesByAccount(user.username);
      const transactions = await storage.getTransactionsByAccount(user.username);
      const withdrawals = await storage.getWithdrawalsByAccount(user.username);

      const totalBalance = poolTables.reduce((sum, table) => sum + parseFloat(table.balance), 0);
      const dailyEarnings = poolTables.reduce((sum, table) => sum + parseFloat(table.dailyEarnings), 0);
      const dailyGames = poolTables.reduce((sum, table) => sum + table.dailyGamesPlayed, 0);
      const activeTables = poolTables.filter(table => table.status === "active").length;

      return res.json({
        user: {
          id: user.id,
          name: `Account Holder ${user.username}`,
          accountNumber: user.username,
          phoneNumber: "+254700000000"
        },
        dashboard: {
          totalBalance,
          dailyEarnings,
          dailyGames,
          totalTables: poolTables.length,
          activeTables
        },
        poolTables,
        recentTransactions: transactions.slice(0, 10)
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get pool tables
  app.get("/api/pool-tables", async (req, res) => {
    try {
      const accountNumber = req.query.account as string;
      if (!accountNumber) {
        return res.status(400).json({ message: "Account number required" });
      }

      const poolTables = await storage.getPoolTablesByAccount(accountNumber);
      return res.json(poolTables);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const accountNumber = req.query.account as string;
      const search = req.query.search as string;
      const tableId = req.query.table as string;
      
      if (!accountNumber) {
        return res.status(400).json({ message: "Account number required" });
      }

      let transactions = await storage.getTransactionsByAccount(accountNumber);
      
      // Apply filters
      if (search) {
        transactions = transactions.filter(t => 
          t.payerPhone.includes(search) || 
          t.transactionId.toLowerCase().includes(search.toLowerCase()) ||
          t.payerName.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (tableId) {
        transactions = transactions.filter(t => t.deviceId === tableId);
      }

      return res.json(transactions);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get withdrawals
  app.get("/api/withdrawals", async (req, res) => {
    try {
      const accountNumber = req.query.account as string;
      if (!accountNumber) {
        return res.status(400).json({ message: "Account number required" });
      }

      const withdrawals = await storage.getWithdrawalsByAccount(accountNumber);
      return res.json(withdrawals);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create withdrawal
  app.post("/api/withdrawals", async (req, res) => {
    try {
      const { accountNumber, amount, password } = WithdrawSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUserByUsername(accountNumber);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Account not found" 
        });
      }

      // Check balance
      const poolTables = await storage.getPoolTablesByAccount(accountNumber);
      const totalBalance = poolTables.reduce((sum, table) => sum + parseFloat(table.balance), 0);
      
      if (totalBalance < amount) {
        return res.status(400).json({ 
          success: false, 
          message: "Insufficient balance" 
        });
      }

      const withdrawal = await storage.createWithdrawal({ accountNumber, amount, password });
      
      return res.json({
        success: true,
        withdrawal,
        message: "Withdrawal processed successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid withdrawal data" 
        });
      }
      if (error.message === "Invalid password") {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid password. Please check your credentials." 
        });
      }
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
