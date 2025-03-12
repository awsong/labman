import { defineStore } from "pinia";
import api from "@/utils/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(username, password) {
      try {
        const response = await api.post("/auth/login", {
          username,
          password,
        });

        const { user, token } = response.data;

        this.user = user;
        this.token = token;

        localStorage.setItem("token", token);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error.response?.data?.error || "登录失败，请检查您的用户名和密码",
        };
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
    },

    async checkAuthStatus() {
      if (this.token) {
        try {
          // Fetch the current user
          const response = await api.get("/auth/user");
          this.user = response.data;

          return true;
        } catch (error) {
          // If the token is invalid, clear the auth state
          this.logout();
          return false;
        }
      }
      return false;
    },
  },
});
