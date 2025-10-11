import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUserToken, setUserToken as storeUserToken, removeUserToken } from '../lib/storage';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getUserToken();
      if (storedToken) {
        setToken(storedToken);
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  const handleSetToken = async (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      await storeUserToken(newToken);
    } else {
      await removeUserToken();
    }
  };

  const logout = async () => {
    setToken(null);
    await removeUserToken();
  };

  return (
    <AuthContext.Provider value={{ token, setToken: handleSetToken, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
