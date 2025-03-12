<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-primary-600 dark:text-primary-400">
          LabMan
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-300">科研项目管理系统</p>
      </div>

      <div class="card">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
            系统登录
          </h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            请输入您的账号和密码
          </p>
        </div>

        <div
          v-if="error"
          class="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        >
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label
              for="username"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >用户名</label
            >
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="form-input"
              placeholder="请输入用户名"
            />
          </div>

          <div class="mb-6">
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >密码</label
            >
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="form-input"
              placeholder="请输入密码"
            />
          </div>

          <div class="flex items-center mb-4">
            <input
              id="remember"
              v-model="remember"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              for="remember"
              class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              记住账号
            </label>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full flex justify-center"
          >
            <arrow-path-icon v-if="loading" class="animate-spin h-5 w-5 mr-2" />
            登录
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const remember = ref(false);
const loading = ref(false);
const error = ref("");

// For demo purposes, prefill with admin credentials
username.value = "admin";
password.value = "password";

const handleLogin = async () => {
  error.value = "";
  loading.value = true;

  try {
    const result = await authStore.login(username.value, password.value);

    if (result.success) {
      router.push("/dashboard");
    } else {
      error.value = result.error || "登录失败，请检查您的用户名和密码";
    }
  } catch (err) {
    error.value = "登录时发生错误，请稍后再试";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>
