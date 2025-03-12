<template>
  <header
    class="bg-white shadow dark:bg-gray-800 dark:border-b dark:border-gray-700"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img
              class="h-8 w-auto"
              src="@/assets/images/logo.svg"
              alt="LabMan Logo"
            />
          </div>
          <div
            class="ml-4 text-xl font-bold text-primary-700 dark:text-primary-400"
          >
            LabMan
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400"
              >科研项目管理系统</span
            >
          </div>
        </div>
        <div class="flex items-center">
          <div v-if="authStore.isLoggedIn" class="ml-4 flex items-center">
            <button
              type="button"
              class="flex items-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              @click="toggleDarkMode"
            >
              <sun-icon
                v-if="themeStore.darkMode"
                class="h-5 w-5"
                aria-hidden="true"
              />
              <moon-icon v-else class="h-5 w-5" aria-hidden="true" />
            </button>

            <div class="relative ml-3">
              <div>
                <button
                  type="button"
                  class="flex items-center rounded-full bg-white dark:bg-gray-800 focus:outline-none"
                  @click="toggleUserMenu"
                >
                  <img
                    class="h-8 w-8 rounded-full"
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                    alt="User avatar"
                  />
                  <span
                    class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >{{ authStore.currentUser?.name }}</span
                  >
                  <chevron-down-icon
                    class="ml-1 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700"
              >
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                  @click.prevent="logout"
                >
                  退出登录
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { SunIcon, MoonIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const toggleDarkMode = () => {
  themeStore.toggleDarkMode();
};

const logout = () => {
  authStore.logout();
  showUserMenu.value = false;
  router.push("/login");
};

// Close menu when clicking outside
const closeMenu = (e) => {
  if (showUserMenu.value) {
    showUserMenu.value = false;
  }
};

// Add event listener to close menu when clicking outside
document.addEventListener("click", closeMenu);
</script>
