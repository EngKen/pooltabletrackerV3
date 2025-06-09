import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Table, 
  TrendingUp, 
  GamepadIcon,
  Download
} from "lucide-react";
import Layout from "@/components/layout";
import PoolTableCard from "@/components/pool-table-card";
import PoolTableDetailsModal from "@/components/pool-table-details-modal";
import WithdrawModal from "@/components/withdraw-modal";
import { useAuth } from "@/hooks/use-auth";
import { poolTableAPI } from "@/lib/api";
import { formatCurrency, formatDistance } from "@/lib/utils";
import type { DashboardData, PoolTable } from "@/lib/types";

export default function Dashboard() {
  const [selectedTable, setSelectedTable] = useState<PoolTable | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { user } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/users", user?.id, "dashboard"],
    queryFn: () => poolTableAPI.getDashboardData(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !dashboardData) {
    return (
      <Layout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(dashboardData.dashboard.totalBalance),
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-100",
      action: (
        <Button 
          className="w-full mt-4" 
          onClick={() => setShowWithdrawModal(true)}
        >
          <Download className="mr-2 h-4 w-4" />
          Withdraw Funds
        </Button>
      )
    },
    {
      title: "Pool Tables",
      value: `${dashboardData.dashboard.totalTables}`,
      icon: Table,
      color: "text-primary",
      bgColor: "bg-primary/10",
      subtitle: `${dashboardData.dashboard.activeTables} Active`
    },
    {
      title: "Today's Earnings",
      value: formatCurrency(dashboardData.dashboard.dailyEarnings),
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: "+12% from yesterday"
    },
    {
      title: "Games Today",
      value: `${dashboardData.dashboard.dailyGames}`,
      icon: GamepadIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Across all tables"
    }
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      {stat.subtitle && (
                        <p className={`text-sm mt-1 ${stat.color}`}>{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  {stat.action}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pool Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Your Pool Tables</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.poolTables.length === 0 ? (
              <div className="text-center py-8">
                <Table className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pool tables found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.poolTables.map((table) => (
                  <PoolTableCard
                    key={table.id}
                    table={table}
                    onClick={() => setSelectedTable(table)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <GamepadIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{transaction.payerName}</p>
                        <p className="text-sm text-muted-foreground">{transaction.payerPhone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +{formatCurrency(parseFloat(transaction.amount))}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary">
                          {transaction.status === "game_played" ? "Game Played" : "Payment Only"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistance(new Date(transaction.transactionDate))} ago
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PoolTableDetailsModal
        table={selectedTable}
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        totalBalance={dashboardData.dashboard.totalBalance}
        accountNumber={user?.accountNumber || ""}
      />
    </Layout>
  );
}
