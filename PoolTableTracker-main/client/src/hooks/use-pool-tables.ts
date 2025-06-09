import { useQuery } from "@tanstack/react-query";
import { poolTableAPI } from "@/lib/api";
import type { PoolTable } from "@/lib/types";

export function usePoolTables(accountNumber: string | null) {
  return useQuery<PoolTable[]>({
    queryKey: ["/api/pool-tables", accountNumber],
    queryFn: () => poolTableAPI.getPoolTables(accountNumber!),
    enabled: !!accountNumber,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
