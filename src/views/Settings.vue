<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">系统设置</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        管理您的账户和应用设置
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Theme Settings -->
      <div class="card col-span-1">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          主题设置
        </h2>
        <div class="mb-4">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            选择主题
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="theme in themeStore.availableThemes"
              :key="theme.id"
              class="px-3 py-2 border rounded-md text-sm font-medium"
              :class="[
                themeStore.currentTheme === theme.id
                  ? 'border-primary-500 text-primary-700 dark:border-primary-400 dark:text-primary-300'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
              @click="themeStore.setTheme(theme.id)"
            >
              {{ theme.name }}
            </button>
          </div>
        </div>

        <div class="flex items-center">
          <switch-component
            :model-value="themeStore.darkMode"
            @update:model-value="themeStore.toggleDarkMode"
            class="mr-3"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">深色模式</span>
        </div>
      </div>

      <!-- User Account Settings -->
      <div class="card col-span-1 md:col-span-2">
        <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          账户设置
        </h2>

        <div class="mb-4">
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            用户名
          </label>
          <input
            id="username"
            type="text"
            class="form-input"
            disabled
            :value="authStore.currentUser?.username"
          />
        </div>

        <div class="mb-4">
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            姓名
          </label>
          <input id="name" type="text" class="form-input" v-model="name" />
        </div>

        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            更改密码
          </h3>

          <div class="mb-3">
            <label
              for="current-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              当前密码
            </label>
            <input
              id="current-password"
              type="password"
              class="form-input"
              placeholder="输入当前密码"
              v-model="currentPassword"
            />
          </div>

          <div class="mb-3">
            <label
              for="new-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              新密码
            </label>
            <input
              id="new-password"
              type="password"
              class="form-input"
              placeholder="输入新密码"
              v-model="newPassword"
            />
          </div>

          <div class="mb-3">
            <label
              for="confirm-password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              确认新密码
            </label>
            <input
              id="confirm-password"
              type="password"
              class="form-input"
              placeholder="再次输入新密码"
              v-model="confirmPassword"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="button"
            class="btn btn-primary"
            @click="saveSettings"
            :disabled="loading"
          >
            <arrow-path-icon v-if="loading" class="animate-spin h-5 w-5 mr-2" />
            保存设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import SwitchComponent from "@/components/ui/SwitchComponent.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();

const name = ref(authStore.currentUser?.name || "");
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);

// This is a mock function since we don't have actual API for changing user details
const saveSettings = () => {
  loading.value = true;

  // Simulate API call
  setTimeout(() => {
    // Reset password fields
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";

    loading.value = false;

    // Show success message (in a real app)
    alert("设置已保存！（演示功能，实际未保存）");
  }, 1000);
};
</script>
