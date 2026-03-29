import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiAdapter } from './authAdapters/apiAdapter';

const adapter = apiAdapter;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // prevent flash of login screen

  // On mount: restore existing session (localStorage / JWT validation)
  useEffect(() => {
    const session = adapter.loadSession();
    if (session) {
      setCurrentPlayer(session);
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const player = await adapter.login(username, password);
    setCurrentPlayer(player);
  };
  
  const register = async (username, email, password) => {
    const player = await adapter.register(username, email, password);
    setCurrentPlayer(player);
  };

  const logout = async () => {
    await adapter.logout();
    setCurrentPlayer(null);
  };

  const value = {
    currentPlayer,  // { id, username, email } | null
    isLoading,      // true while checking session on startup
    login,          // (email, password) => Promise<void>
    register,       // (username, email, password) => Promise<void>
    logout,         // () => Promise<void>
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
