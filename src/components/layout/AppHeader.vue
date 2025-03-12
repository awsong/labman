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

            <div class="relative ml-3" ref="userMenuContainer">
              <button
                type="button"
                class="flex items-center rounded-full bg-white dark:bg-gray-800 focus:outline-none"
                @click.stop="toggleUserMenu"
                ref="userMenuButton"
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
          </div>
        </div>
      </div>
    </div>
  </header>

  <teleport to="body">
    <div
      v-if="showUserMenu && buttonPosition"
      class="fixed z-50 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 animate-dropdown"
      :style="{
        top: `${buttonPosition.top + buttonPosition.height}px`,
        left: `${buttonPosition.left}px`,
      }"
      @click.stop
    >
      <a
        href="#"
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
        @click.stop.prevent="logout"
      >
        退出登录
      </a>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { SunIcon, MoonIcon, ChevronDownIcon } from "@heroicons/vue/24/outline";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const showUserMenu = ref(false);
const userMenuButton = ref(null);
const buttonPosition = ref(null);

const toggleUserMenu = async () => {
  showUserMenu.value = !showUserMenu.value;
  
  if (showUserMenu.value && userMenuButton.value) {
    await nextTick();
    const rect = userMenuButton.value.getBoundingClientRect();
    buttonPosition.value = {
      top: rect.top,
      left: rect.left,
      height: rect.height,
      width: rect.width
    };
  }
};

const toggleDarkMode = () => {
  themeStore.toggleDarkMode();
};

const logout = () => {
  authStore.logout();
  showUserMenu.value = false;
  router.push("/login");
};

const handleGlobalClick = (event) => {
  if (
    showUserMenu.value && 
    userMenuButton.value && 
    !userMenuButton.value.contains(event.target) &&
    !(event.target.closest('.fixed.z-50'))
  ) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", handleGlobalClick);
  
  router.beforeEach((to, from, next) => {
    showUserMenu.value = false;
    next();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("click", handleGlobalClick);
});
</script>

<style scoped>
.animate-dropdown {
  animation: dropIn 0.2s ease-out forwards;
}

@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
