import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { authAPI } from "../api/client";

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
  unauthRole: "parent" | "child" | null;
  setUnauthRole: (role: "parent" | "child" | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<void>;
  updateUser: (data: Record<string, string>) => Promise<void>;
  completePairing: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [unauthRole, setUnauthRole] = useState<"parent" | "child" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRole = (await SecureStore.getItemAsync(
          "unauthRole",
        )) as any;
        if (storedRole) setUnauthRole(storedRole);

        const storedToken = await SecureStore.getItemAsync("authToken");
        const storedUser = await SecureStore.getItemAsync("authUser");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Validate token with server
          const res = (await authAPI.getMe()) as any;
          setUser(res.user);
        }
      } catch {
        // Token expired or invalid — clear storage
        await SecureStore.deleteItemAsync("authToken");
        await SecureStore.deleteItemAsync("authUser");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = (await authAPI.login(email, password)) as any;
    await SecureStore.setItemAsync("authToken", res.token);
    await SecureStore.setItemAsync("authUser", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string, role: string) => {
      const res = (await authAPI.signup(name, email, password, role)) as any;
      await SecureStore.setItemAsync("authToken", res.token);
      await SecureStore.setItemAsync("authUser", JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    },
    [],
  );

  const updateUser = useCallback(
    async (data: Record<string, string>) => {
      const res = (await authAPI.updateMe(data)) as any;
      const updatedUser = { ...user, ...res.user } as User;
      await SecureStore.setItemAsync("authUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
    },
    [user],
  );

  const completePairing = useCallback(
    async (newUser: User, newToken: string) => {
      await SecureStore.setItemAsync("authToken", newToken);
      await SecureStore.setItemAsync("authUser", JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("authUser");
    await SecureStore.deleteItemAsync("tracking_child_id");
    setToken(null);
    setUser(null);
  }, []);

  const handleSetUnauthRole = useCallback(
    async (role: "parent" | "child" | null) => {
      if (role) {
        await SecureStore.setItemAsync("unauthRole", role);
      } else {
        await SecureStore.deleteItemAsync("unauthRole");
      }
      setUnauthRole(role);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        unauthRole,
        setUnauthRole: handleSetUnauthRole,
        login,
        signup,
        updateUser,
        completePairing,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
      unauthRole: null,
      setUnauthRole: () => {},
      login: async () => {},
      signup: async () => {},
      updateUser: async () => {},
      completePairing: async () => {},
      logout: async () => {},
    };
  }
  return ctx;
};
