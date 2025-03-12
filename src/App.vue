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
import { onMounted } from "vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import ThemeSelector from "@/components/layout/ThemeSelector.vue";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

const authStore = useAuthStore();
const themeStore = useThemeStore();

onMounted(() => {
  // Check if user is already logged in from stored session
  authStore.checkAuthStatus();

  // Load saved theme preference
  themeStore.loadTheme();

  // Set dark mode based on user preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.classList.add("dark");
  }
});
</script>
