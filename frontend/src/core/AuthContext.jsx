import React, { createContext, useContext, useState, useEffect } from 'react';
import { localAdapter } from './authAdapters/localAdapter';

// ------------------------------------------------------------
// To upgrade to Level 2 (JWT) or Level 3 (OAuth):
//   1. Create a new adapter in authAdapters/ with the same interface
//   2. Replace the import below — that's the ONLY change needed
// ------------------------------------------------------------
const adapter = localAdapter;

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

  const login = async (name) => {
    const player = await adapter.login(name);
    setCurrentPlayer(player);
  };

  const logout = async () => {
    await adapter.logout();
    setCurrentPlayer(null);
  };

  const value = {
    currentPlayer,  // { name, loginAt } | null
    isLoading,      // true while checking session on startup
    login,          // (name: string) => Promise<void>
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
