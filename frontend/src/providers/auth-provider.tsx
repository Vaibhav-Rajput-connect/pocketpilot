"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient, getErrorMessage } from "@/lib/api-client";
import { clearTokens } from "@/lib/auth";
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
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isRedirecting = React.useRef(false);

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  const fetchUser = React.useCallback(async () => {
    try {
      const response = await apiClient.get<User>("/users/me");
      setUser(response.data);
      return true;
    } catch (error) {
      setUser(null);
      return false;
    }
  }, []);

  const refreshUser = React.useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const initAuth = async () => {
      if (!isPublicPath) {
        await fetchUser();
      }
      setIsLoading(false);
      setIsInitialized(true);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for auth failure events from the API client interceptor
  useEffect(() => {
    const handleAuthFailure = () => {
      setUser(null);
      if (!isPublicPath && !isRedirecting.current) {
        isRedirecting.current = true;
        router.replace("/login");
        setTimeout(() => { isRedirecting.current = false; }, 1000);
      }
    };

    window.addEventListener("pocketpilot:auth-failure", handleAuthFailure);
    return () => window.removeEventListener("pocketpilot:auth-failure", handleAuthFailure);
  }, [isPublicPath, router]);

  // Protected route checking
  useEffect(() => {
    if (!isInitialized || isLoading || isRedirecting.current) return;

    if (!user && !isPublicPath) {
      isRedirecting.current = true;
      router.replace("/login");
      setTimeout(() => { isRedirecting.current = false; }, 1000);
    } else if (user && (pathname === "/login" || pathname === "/signup")) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, isInitialized, pathname, isPublicPath, router]);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/login", data);
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
      await apiClient.post("/auth/signup", signupData);
      await fetchUser();
      router.push("/dashboard");
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (e) {
      // Ignore errors on logout
    }
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
