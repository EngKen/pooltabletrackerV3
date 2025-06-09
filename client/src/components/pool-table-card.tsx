import { formatCurrency, formatDistance } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PoolTable } from "@/lib/types";

interface PoolTableCardProps {
  table: PoolTable;
  onClick: () => void;
}

export default function PoolTableCard({ table, onClick }: PoolTableCardProps) {
  const isActive = table.status === "active";
  
  return (
    <Card 
      className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isActive ? "bg-primary/10" : "bg-muted"
            }`}>
              <span className={`font-semibold ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                {table.deviceId}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{table.name}</h3>
              <p className="text-sm text-muted-foreground">{table.location}</p>
            </div>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(parseFloat(table.balance))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Daily Earnings</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(parseFloat(table.dailyEarnings))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Games Today</p>
            <p className="text-lg font-bold text-foreground">{table.dailyGamesPlayed}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Games</p>
            <p className="text-lg font-bold text-foreground">{table.totalGamesPlayed}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Last updated: {formatDistance(new Date(table.lastUpdated))} ago
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
