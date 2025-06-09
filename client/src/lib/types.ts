export interface User {
  id: number;
  name: string;
  accountNumber: string;
  phoneNumber: string;
}

export interface PoolTable {
  id: number;
  deviceId: string;
  serialNumber: string;
  name: string;
  location: string;
  accountNumber: string;
  balance: string;
  dailyEarnings: string;
  dailyGamesPlayed: number;
  totalGamesPlayed: number;
  status: "active" | "inactive";
  registrationDate: string;
  lastUpdated: string;
}

export interface Transaction {
  id: number;
  transactionId: string;
  deviceId: string;
  accountNumber: string;
  payerName: string;
  payerPhone: string;
  amount: string;
  type: "payment" | "withdrawal";
  status: "game_played" | "payment_only" | "withdrawal";
  transactionDate: string;
}

export interface Withdrawal {
  id: number;
  withdrawalId: string;
  accountNumber: string;
  amount: string;
  status: string;
  withdrawalDate: string;
}

export interface DashboardData {
  user: User;
  dashboard: {
    totalBalance: number;
    dailyEarnings: number;
    dailyGames: number;
    totalTables: number;
    activeTables: number;
  };
  poolTables: PoolTable[];
  recentTransactions: Transaction[];
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  withdrawal?: Withdrawal;
  message?: string;
}
