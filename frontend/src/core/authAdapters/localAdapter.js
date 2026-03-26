/**
 * localAdapter.js — Level 1 Auth Adapter
 *
 * HOW TO UPGRADE TO LEVEL 2 (JWT):
 *   1. Create jwtAdapter.js with the same interface: { login, logout, loadSession }
 *   2. Change the import in AuthContext.jsx from localAdapter → jwtAdapter
 *   3. That's it. Nothing else changes.
 *
 * Interface contract (must be preserved in all future adapters):
 *   login(name: string)  → Promise<Player>
 *   logout()             → Promise<void>
 *   loadSession()        → Player | null
 *
 * Player shape: { name: string, loginAt: number }
 */

const STORAGE_KEY = 'chemma_player';

export const localAdapter = {
  /**
   * Level 1: Simply store player name in localStorage.
   * Level 2 upgrade: Replace with POST /api/auth/login + store JWT.
   */
  login: async (name) => {
    const player = {
      name: name.trim(),
      loginAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    return player;
  },

  /**
   * Clear the local session.
   * Level 2 upgrade: Also call POST /api/auth/logout to invalidate JWT.
   */
  logout: async () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Called on app startup to restore an existing session.
   * Level 2 upgrade: Validate JWT with GET /api/auth/me instead.
   */
  loadSession: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
};
