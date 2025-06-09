import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useTransactions, useWithdrawals } from "@/hooks/use-transactions";
import { usePoolTables } from "@/hooks/use-pool-tables";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const { user } = useAuth();

  const { data: poolTables } = usePoolTables(user?.accountNumber || null);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(
    user?.accountNumber || null,
    search,
    selectedTable
  );
  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals(
    user?.accountNumber || null
  );

  const filteredTransactions = transactions?.filter(transaction => {
    if (transactionType === "payments") return transaction.type === "payment";
    if (transactionType === "withdrawals") return transaction.type === "withdrawal";
    if (transactionType === "all" || transactionType === "") return true;
    return true;
  }) || [];

  // Filter by selected table
  const finalFilteredTransactions = filteredTransactions.filter(transaction => {
    if (selectedTable === "all" || selectedTable === "") return true;
    return transaction.deviceId === selectedTable;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "game_played":
        return <Badge className="bg-green-100 text-green-800">Game Played</Badge>;
      case "payment_only":
        return <Badge variant="outline">Payment Only</Badge>;
      case "withdrawal":
        return <Badge className="bg-blue-100 text-blue-800">Withdrawal</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTableName = (deviceId: string) => {
    const table = poolTables?.find(t => t.deviceId === deviceId);
    return table?.name || deviceId;
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Transaction History</h2>
          <p className="text-muted-foreground">View all transactions and withdrawals</p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Phone number or transaction code"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="table-filter">Pool Table</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger id="table-filter">
                    <SelectValue placeholder="All Tables" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tables</SelectItem>
                    {poolTables?.map((table) => (
                      <SelectItem key={table.deviceId} value={table.deviceId}>
                        {table.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="type-filter">Transaction Type</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payments">Game Payments</SelectItem>
                    <SelectItem value="withdrawals">Withdrawals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : finalFilteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Transaction</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Payer Details</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {finalFilteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/50">
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {formatDate(new Date(transaction.transactionDate))}
                            </div>
                            <div className="text-muted-foreground">
                              {formatTime(new Date(transaction.transactionDate))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium text-foreground font-mono">
                              {transaction.transactionId}
                            </div>
                            <div className="text-muted-foreground">
                              {getTableName(transaction.deviceId)}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {transaction.payerName}
                            </div>
                            <div className="text-muted-foreground">
                              {transaction.payerPhone}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className={`text-sm font-bold ${
                            transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"
                          }`}>
                            {transaction.type === "withdrawal" ? "-" : "+"}
                            {formatCurrency(parseFloat(transaction.amount))}
                          </div>
                        </td>
                        <td className="p-3">
                          {getStatusBadge(transaction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawalsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !withdrawals || withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No withdrawals found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Withdrawal</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(withdrawal.withdrawalDate))} at{" "}
                          {formatTime(new Date(withdrawal.withdrawalDate))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        -{formatCurrency(parseFloat(withdrawal.amount))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {withdrawal.withdrawalId}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
