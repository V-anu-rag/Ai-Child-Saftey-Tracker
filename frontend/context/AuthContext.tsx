"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "parent" | "child";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem("safetrack_token");
      const storedUser = localStorage.getItem("safetrack_user");
      if (stored && storedUser) {
        setToken(stored);
        setUser(JSON.parse(storedUser));
        try {
          const res = await authAPI.getMe() as any;
          setUser(res.user);
          localStorage.setItem("safetrack_user", JSON.stringify(res.user));
        } catch {
          // Token invalid
          logout();
        }
      }
      setIsLoading(false);
    };
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login(email, password) as any;
    localStorage.setItem("safetrack_token", res.token);
    localStorage.setItem("safetrack_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    router.push("/dashboard");
  }, [router]);

  const signup = useCallback(
    async (name: string, email: string, password: string, role: string) => {
      const res = await authAPI.signup(name, email, password, role) as any;
      localStorage.setItem("safetrack_token", res.token);
      localStorage.setItem("safetrack_user", JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("safetrack_token");
    localStorage.removeItem("safetrack_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
