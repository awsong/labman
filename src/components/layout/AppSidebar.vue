<template>
  <aside
    class="w-64 bg-gray-50 dark:bg-gray-800 dark:border-r dark:border-gray-700"
  >
    <div class="h-full px-3 py-4">
      <nav class="space-y-1">
        <router-link
          to="/dashboard"
          class="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          :class="{
            'bg-primary-50 text-primary-700 dark:bg-gray-700':
              isActive('/dashboard'),
          }"
        >
          <home-icon class="h-5 w-5 mr-2" />
          <span>首页</span>
        </router-link>

        <div class="pt-4">
          <div
            class="mb-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
          >
            项目管理
          </div>

          <router-link
            to="/projects"
            class="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="{
              'bg-primary-50 text-primary-700 dark:bg-gray-700':
                isActive('/projects'),
            }"
          >
            <folder-icon class="h-5 w-5 mr-2" />
            <span>项目列表</span>
          </router-link>

          <router-link
            to="/milestones"
            class="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="{
              'bg-primary-50 text-primary-700 dark:bg-gray-700':
                isActive('/milestones'),
            }"
          >
            <flag-icon class="h-5 w-5 mr-2" />
            <span>里程碑管理</span>
          </router-link>

          <router-link
            to="/progress"
            class="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="{
              'bg-primary-50 text-primary-700 dark:bg-gray-700':
                isActive('/progress'),
            }"
          >
            <chart-bar-icon class="h-5 w-5 mr-2" />
            <span>进度管理</span>
          </router-link>
        </div>

        <div class="pt-4">
          <div
            class="mb-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
          >
            数据分析
          </div>

          <router-link
            to="/statistics"
            class="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="{
              'bg-primary-50 text-primary-700 dark:bg-gray-700':
                isActive('/statistics'),
            }"
          >
            <chart-pie-icon class="h-5 w-5 mr-2" />
            <span>统计数据</span>
          </router-link>
        </div>

        <div class="pt-4">
          <div
            class="mb-2 px-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
          >
            设置
          </div>

          <router-link
            to="/settings"
            class="flex items-center rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            :class="{
              'bg-primary-50 text-primary-700 dark:bg-gray-700':
                isActive('/settings'),
            }"
          >
            <cog-icon class="h-5 w-5 mr-2" />
            <span>系统设置</span>
          </router-link>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  HomeIcon,
  FolderIcon,
  FlagIcon,
  ChartBarIcon,
  ChartPieIcon,
  CogIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();

const isActive = (path) => {
  return route.path.startsWith(path);
};
</script>
