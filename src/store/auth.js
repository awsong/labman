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
        console.log("登录中...");
        const response = await api.post("/auth/login", {
          username,
          password,
        });

        const { user, token } = response.data;

        // 确保主题设置属性存在并且格式正确
        this.user = this.normalizeUserThemeSettings(user);
        this.token = token;

        localStorage.setItem("token", token);

        console.log("登录成功，用户数据:", this.user);
        return { success: true };
      } catch (error) {
        console.error("登录失败:", error);
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
          console.log("检查认证状态...");
          // Fetch the current user
          const response = await api.get("/auth/user");

          // 确保主题设置属性存在并且格式正确
          this.user = this.normalizeUserThemeSettings(response.data);

          console.log("用户认证有效，用户数据:", this.user);
          return true;
        } catch (error) {
          console.error("检查认证状态失败:", error);
          // If the token is invalid, clear the auth state
          this.logout();
          return false;
        }
      }
      return false;
    },

    // 确保用户主题设置属性格式正确
    normalizeUserThemeSettings(user) {
      if (!user) return null;

      // 确保theme属性存在并且是字符串
      if (user.theme === null || user.theme === undefined) {
        user.theme = "";
      }

      // 确保darkMode属性是布尔值
      if (typeof user.darkMode !== "boolean") {
        // 数据库可能将布尔值存储为0/1或字符串
        if (
          user.darkMode === 1 ||
          user.darkMode === "1" ||
          user.darkMode === "true"
        ) {
          user.darkMode = true;
        } else {
          user.darkMode = false;
        }
      }

      console.log("标准化后的用户主题设置:", {
        theme: user.theme,
        darkMode: user.darkMode,
      });
      return user;
    },

    async updateUserProfile(name) {
      if (!this.user) return { success: false, error: "用户未登录" };

      try {
        console.log("更新用户资料...");
        // 调用更新用户资料的API端点
        const response = await api.put("/auth/profile", {
          name,
          userId: this.user.id,
        });

        // 如果API调用成功，更新本地用户数据
        if (response.data.success) {
          this.user = this.normalizeUserThemeSettings(response.data.user);
          console.log("用户资料更新成功:", this.user);
        }

        return {
          success: true,
          message: response.data.message,
        };
      } catch (error) {
        console.error("更新用户资料失败:", error);
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
