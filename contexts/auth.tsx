import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'admin' | 'manager';

interface User {
  id: string;
  username: string;
  role: UserRole;
}

interface AuthValue {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

const AUTH_KEY = '@uniform-manager/auth-v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_KEY).then((stored) => {
      if (stored) setUser(JSON.parse(stored));
      setIsLoading(false);
    });
  }, []);

  async function login(username: string, password: string): Promise<boolean> {
    // Mock authentication
    if (username === 'admin' && password === 'admin123') {
      const newUser: User = { id: '1', username: 'admin', role: 'admin' };
      setUser(newUser);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      return true;
    }
    if (username === 'manager' && password === 'manager123') {
      const newUser: User = { id: '2', username: 'manager', role: 'manager' };
      setUser(newUser);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      return true;
    }
    return false;
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
