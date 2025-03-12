import { defineStore } from "pinia";
import api from "@/utils/api";
import { useAuthStore } from "@/store/auth";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    currentTheme: localStorage.getItem("theme") || "",
    darkMode: localStorage.getItem("darkMode") === "true" || false,
    availableThemes: [
      { id: "", name: "默认蓝色" },
      { id: "theme-green", name: "绿色主题" },
      { id: "theme-purple", name: "紫色主题" },
      { id: "theme-orange", name: "橙色主题" },
      { id: "theme-red", name: "红色主题" },
    ],
  }),

  actions: {
    async setTheme(themeId) {
      // 更新本地状态
      this.currentTheme = themeId;

      // 保存到localStorage
      localStorage.setItem("theme", themeId);

      // 如果用户已登录，还保存到数据库
      await this.saveThemeSettingsToDatabase();
    },

    async toggleDarkMode() {
      // 更新本地状态
      this.darkMode = !this.darkMode;

      // 更新DOM
      if (this.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // 保存到localStorage
      localStorage.setItem("darkMode", this.darkMode);

      // 如果用户已登录，还保存到数据库
      await this.saveThemeSettingsToDatabase();
    },

    async saveThemeSettingsToDatabase() {
      const authStore = useAuthStore();

      // 只有在用户登录的情况下，才保存到数据库
      if (authStore.isLoggedIn && authStore.currentUser) {
        try {
          const response = await api.put("/auth/theme-settings", {
            theme: this.currentTheme,
            darkMode: this.darkMode,
            userId: authStore.currentUser.id,
          });

          console.log("主题设置已保存到数据库:", response.data);
          return response;
        } catch (error) {
          console.error("保存主题设置到数据库时出错:", error);
          throw error;
        }
      }
    },

    loadTheme() {
      const authStore = useAuthStore();

      console.log("加载主题设置，用户登录状态:", authStore.isLoggedIn);
      console.log("当前用户:", authStore.currentUser);

      // 如果用户已登录，且用户的主题设置存在，优先使用数据库的设置
      if (authStore.isLoggedIn && authStore.currentUser) {
        // 从数据库加载主题
        console.log("从数据库加载主题设置:", authStore.currentUser.theme);
        if (authStore.currentUser.theme !== undefined) {
          this.currentTheme = authStore.currentUser.theme;
          localStorage.setItem("theme", this.currentTheme);
        }

        // 从数据库加载深色模式设置
        if (authStore.currentUser.darkMode !== undefined) {
          this.darkMode = authStore.currentUser.darkMode;
          localStorage.setItem("darkMode", this.darkMode);

          if (this.darkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } else {
        // 否则加载localStorage中的设置
        console.log("从localStorage加载主题设置");
        // Load saved theme and apply it (only if it's not default)
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          this.currentTheme = savedTheme;
          console.log("已从localStorage加载主题:", this.currentTheme);
        }

        // Load dark mode preference
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedDarkMode !== null) {
          this.darkMode = savedDarkMode === "true";

          if (this.darkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    },
  },
});
