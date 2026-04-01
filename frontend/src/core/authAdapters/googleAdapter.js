const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const googleAdapter = {
  login: async (credential) => {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
        throw new Error("Failed to authenticate with Google");
    }

    const data = await response.json();
    localStorage.setItem("game_token", data.access_token);
    return data.user;
  },

  loadSession: async () => {
    const token = localStorage.getItem("game_token");
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            localStorage.removeItem("game_token");
            return null;
        }

        const user = await response.json();
        return user;
    } catch (e) {
        return null;
    }
  },

  logout: async () => {
    localStorage.removeItem("game_token");
  },
};
