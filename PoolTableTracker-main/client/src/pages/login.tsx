import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import logoPath from "@assets/LOGO_ui_1749385809688.png";

export default function Login() {
  const [accountId, setAccountId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(accountId, password);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to your pool table dashboard.",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoPath} alt="Kentronics Solutions" className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <p className="text-muted-foreground">Sign in to manage your pool tables</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your account ID"
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-3">
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Need help? Contact us at
              </p>
              <a 
                href="mailto:support@kentronicssolutions.com" 
                className="text-xs text-primary hover:underline"
              >
                support@kentronicssolutions.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
