<template>
  <div class="min-h-screen flex flex-col" :class="themeStore.currentTheme">
    <app-header />
    <div class="flex-1 flex">
      <app-sidebar v-if="authStore.isLoggedIn" />
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
    <theme-selector class="fixed bottom-4 right-4" />
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import ThemeSelector from "@/components/layout/ThemeSelector.vue";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(async () => {
  console.log("App.vue - onMounted");
  // Check if user is already logged in from stored session
  const isLoggedIn = await authStore.checkAuthStatus();
  console.log("用户登录状态:", isLoggedIn);

  // 初始加载主题设置
  loadThemeSettings();

  // Set dark mode based on user preference if not already set
  if (
    !localStorage.getItem("darkMode") &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
  }
});

// 监听用户登录状态，当状态变化时重新加载主题设置
watch(() => authStore.isLoggedIn, (newIsLoggedIn) => {
  console.log("用户登录状态变更:", newIsLoggedIn);
  if (newIsLoggedIn) {
    // 用户登录后，加载数据库中的主题设置
    loadThemeSettings();
  }
});

// 专门的函数用于加载主题设置
function loadThemeSettings() {
  console.log("App.vue - 加载主题设置");
  themeStore.loadTheme();
  console.log("当前主题:", themeStore.currentTheme);
}
</script>
