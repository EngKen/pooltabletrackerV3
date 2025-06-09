import { useState, useEffect } from "react";
import { poolTableAPI } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  });

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false
        });
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (accountId: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await poolTableAPI.login(accountId, password);
      
      if (response.success && response.token && response.user) {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user_data", JSON.stringify(response.user));
        
        setAuthState({
          isAuthenticated: true,
          user: response.user,
          token: response.token,
          isLoading: false
        });
        
        return { success: true };
      } else {
        return { success: false, message: response.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error occurred" };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false
    });
  };

  return {
    ...authState,
    login,
    logout
  };
}
