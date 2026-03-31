import {
  clearSession,
  loadStoredSession,
  loginUser,
  registerUser,
} from '../../api/client';

export const apiAdapter = {
  // Check if session exists in storage
  loadSession: () => {
    return loadStoredSession();
  },

  // Login handler
  login: async (username_or_email, password) => {
    try {
      const data = await loginUser(username_or_email, password);
      return data.user;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },
  
  // Register handler
  register: async (username, email, password) => {
    try {
      const data = await registerUser(username, email, password);
      return data.user;
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  },

  // Logout handler
  logout: async () => {
    clearSession();
    return Promise.resolve();
  }
};
