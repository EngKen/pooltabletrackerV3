import { formatCurrency, formatDate, formatDistance } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PoolTable } from "@/lib/types";

interface PoolTableDetailsModalProps {
  table: PoolTable | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PoolTableDetailsModal({ 
  table, 
  isOpen, 
  onClose 
}: PoolTableDetailsModalProps) {
  if (!table) return null;

  const isActive = table.status === "active";
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{table.name} Details</DialogTitle>
          <p className="sr-only">View detailed information about this pool table including performance metrics, location, and status</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serial Number:</span>
                <span className="font-medium font-mono">{table.serialNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{table.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Date:</span>
                <span className="font-medium">{formatDate(new Date(table.registrationDate))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {formatDistance(new Date(table.lastUpdated))} ago
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(parseFloat(table.balance))}
                  </p>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{table.dailyGamesPlayed}</p>
                  <p className="text-sm text-muted-foreground">Games Today</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(parseFloat(table.dailyEarnings))}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Earnings</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{table.totalGamesPlayed}</p>
                  <p className="text-sm text-muted-foreground">Total Games</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analytics */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg p-6 text-primary-foreground">
              <h3 className="font-semibold mb-4">Performance Analytics</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {table.totalGamesPlayed > 0 
                      ? Math.round((table.dailyGamesPlayed / 8) * 100) 
                      : 0}%
                  </p>
                  <p className="text-sm opacity-90">Daily Utilization</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {table.dailyGamesPlayed > 0 
                      ? formatCurrency(parseFloat(table.dailyEarnings) / table.dailyGamesPlayed)
                      : formatCurrency(0)
                    }
                  </p>
                  <p className="text-sm opacity-90">Avg. per Game</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {table.totalGamesPlayed > 0 
                      ? Math.round(table.totalGamesPlayed / 30)
                      : 0}
                  </p>
                  <p className="text-sm opacity-90">Monthly Avg Games</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            View Transactions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
