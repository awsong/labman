import { defineStore } from "pinia";

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
    setTheme(themeId) {
      this.currentTheme = themeId;
      localStorage.setItem("theme", themeId);
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode;

      if (this.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      localStorage.setItem("darkMode", this.darkMode);
    },

    loadTheme() {
      // Load saved theme
      if (this.currentTheme) {
        this.setTheme(this.currentTheme);
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
    },
  },
});
