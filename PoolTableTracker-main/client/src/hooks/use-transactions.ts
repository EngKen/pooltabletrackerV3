import { useQuery } from "@tanstack/react-query";
import { poolTableAPI } from "@/lib/api";
import type { Transaction, Withdrawal } from "@/lib/types";

export function useTransactions(accountNumber: string | null, search?: string, tableId?: string) {
  return useQuery<Transaction[]>({
    queryKey: ["/api/transactions", accountNumber, search, tableId],
    queryFn: () => poolTableAPI.getTransactions(accountNumber!, search, tableId),
    enabled: !!accountNumber,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useWithdrawals(accountNumber: string | null) {
  return useQuery<Withdrawal[]>({
    queryKey: ["/api/withdrawals", accountNumber],
    queryFn: () => poolTableAPI.getWithdrawals(accountNumber!),
    enabled: !!accountNumber,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
