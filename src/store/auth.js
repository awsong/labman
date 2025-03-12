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

    async updateUserProfile(name) {
      if (!this.user) return { success: false, error: "用户未登录" };

      try {
        // 调用更新用户资料的API端点
        const response = await api.put("/auth/profile", {
          name,
          userId: this.user.id,
        });

        // 如果API调用成功，更新本地用户数据
        if (response.data.success) {
          this.user = response.data.user;
        }

        return {
          success: true,
          message: response.data.message,
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || "更新用户资料失败",
        };
      }
    },

    async changePassword(currentPassword, newPassword) {
      if (!this.user) return { success: false, error: "用户未登录" };

      try {
        // 调用更改密码的API端点
        const response = await api.put("/auth/password", {
          currentPassword,
          newPassword,
          userId: this.user.id,
        });

        return {
          success: true,
          message: response.data.message,
        };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || "更改密码失败",
        };
      }
    },
  },
});
