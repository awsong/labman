<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center justify-center rounded-full bg-white p-2 shadow-md dark:bg-gray-700"
      :class="{ 'ring-2 ring-primary-500': isOpen }"
    >
      <swatch-icon class="h-5 w-5 text-gray-600 dark:text-gray-200" />
    </button>

    <div
      v-if="isOpen"
      class="absolute bottom-full right-0 mb-2 w-48 rounded-md bg-white p-2 shadow-lg dark:bg-gray-800"
    >
      <div
        class="mb-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        选择主题
      </div>
      <div class="space-y-1">
        <button
          v-for="theme in themeStore.availableThemes"
          :key="theme.id"
          @click="selectTheme(theme.id)"
          class="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          :class="{
            'bg-gray-100 dark:bg-gray-700':
              themeStore.currentTheme === theme.id,
          }"
        >
          <div
            class="mr-2 h-4 w-4 rounded-full"
            :class="getThemeColorClass(theme.id)"
          ></div>
          {{ theme.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { SwatchIcon } from "@heroicons/vue/24/outline";
import { useThemeStore } from "@/store/theme";

const themeStore = useThemeStore();
const isOpen = ref(false);

const selectTheme = (themeId) => {
  themeStore.setTheme(themeId);
  isOpen.value = false;
};

const getThemeColorClass = (themeId) => {
  switch (themeId) {
    case "":
      return "bg-blue-500";
    case "theme-green":
      return "bg-green-500";
    case "theme-purple":
      return "bg-purple-500";
    case "theme-orange":
      return "bg-orange-500";
    case "theme-red":
      return "bg-red-500";
    default:
      return "bg-blue-500";
  }
};

// Close when clicking outside
const handleClickOutside = (event) => {
  if (isOpen.value) {
    isOpen.value = false;
  }
};

document.addEventListener("click", handleClickOutside);
</script>
