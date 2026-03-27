import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiAdapter = {
  // Check if session exists in storage
  loadSession: () => {
    const token = localStorage.getItem('access_token');
    const userJson = localStorage.getItem('user_profile');
    
    if (token && userJson) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_profile');
          return null;
        }
        return JSON.parse(userJson);
      } catch (e) {
        return null; // Invalid token
      }
    }
    return null;
  },

  // Login handler
  login: async (username_or_email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username_or_email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Invalid credentials");
      }

      const data = await response.json();
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_profile', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  },
  
  // Register handler
  register: async (username, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Registration failed");
      }

      const data = await response.json();
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_profile', JSON.stringify(data.user));
      
      return data.user;
    } catch (error) {
      console.error("Registration Error:", error);
      throw error;
    }
  },

  // Logout handler
  logout: async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    return Promise.resolve();
  }
};
