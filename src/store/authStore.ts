import { create } from "zustand";
import { apiClient } from "../services/apiClient";

interface User {
  username: string;
  avatarUrl: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      set({ user: null, isAuthenticated: false });
      window.location.href = "/";
    }
  }
}));
