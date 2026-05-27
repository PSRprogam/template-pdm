import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('@fin:user');
      if (stored) setUser(JSON.parse(stored) as User);
      setLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: u, token } = await api.login(email, password);
    await AsyncStorage.setItem('@fin:user',  JSON.stringify(u));
    await AsyncStorage.setItem('@fin:token', token);
    setUser(u);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['@fin:user', '@fin:token']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
