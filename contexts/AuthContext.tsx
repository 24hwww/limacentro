import React, { createContext, useContext } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface AuthContextType {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  } | null;
  token: null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();

  const login = async (email: string, password: string) => {
    void email;
    void password;
    await signIn('google', { callbackUrl: '/' });
  };

  const register = async (email: string, password: string, name: string) => {
    void email;
    void password;
    void name;
    await signIn('google', { callbackUrl: '/' });
  };

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const value: AuthContextType = {
    user: session?.user || null,
    token: null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
