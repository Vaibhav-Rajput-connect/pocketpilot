"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { clearTokens, getAccessToken, isAuthenticated, setTokens } from "@/lib/auth";
import type { LoginFormData, SignupFormData } from "@/lib/validators";

interface User {
  id: string;
  full_name: string;
  email: string;
  monthly_income: number | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const response = await apiClient.get<User>("/users/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      clearTokens();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (getAccessToken()) {
      await fetchUser();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (getAccessToken()) {
        await fetchUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Protected route checking
  useEffect(() => {
    if (isLoading) return;

    const isPublicPath = pathname === "/" || pathname === "/login" || pathname === "/signup";
    
    if (!isAuthenticated() && !isPublicPath) {
      router.replace("/login");
    } else if (isAuthenticated() && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/login", data);
      setTokens(response.data);
      await fetchUser();
      router.push("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Remove confirm_password as backend doesn't expect it
      const { confirm_password, ...signupData } = data;
      const response = await apiClient.post("/auth/signup", signupData);
      setTokens(response.data);
      await fetchUser();
      router.push("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export type { User };
