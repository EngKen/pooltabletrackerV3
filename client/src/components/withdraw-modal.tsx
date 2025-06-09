import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { poolTableAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalBalance: number;
  accountNumber: string;
}

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  totalBalance, 
  accountNumber 
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: (withdrawAmount: number) => 
      poolTableAPI.createWithdrawal(accountNumber, withdrawAmount),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Withdrawal Successful",
          description: `${formatCurrency(parseFloat(amount))} has been withdrawn from your account.`,
        });
        
        // Invalidate and refetch relevant queries
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
        queryClient.invalidateQueries({ queryKey: ["/api/pool-tables"] });
        queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
        
        setAmount("");
        onClose();
      } else {
        toast({
          title: "Withdrawal Failed",
          description: data.message || "An error occurred during withdrawal.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: "A network error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawAmount = parseFloat(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (withdrawAmount < 100) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum withdrawal amount is KSh 100.",
        variant: "destructive",
      });
      return;
    }
    
    if (withdrawAmount > totalBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance.",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate(withdrawAmount);
  };

  const handleClose = () => {
    if (!withdrawMutation.isPending) {
      setAmount("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <p className="sr-only">Withdraw funds from your pool table earnings balance</p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Available Balance:</span>
              <span className="text-xl font-bold text-foreground">
                {formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="withdrawAmount">Withdrawal Amount (KSh)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="100"
                max={totalBalance}
                step="0.01"
                disabled={withdrawMutation.isPending}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum withdrawal: KSh 100
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={handleClose}
                disabled={withdrawMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
