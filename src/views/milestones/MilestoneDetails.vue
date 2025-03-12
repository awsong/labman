<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        里程碑详情
      </h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">查看里程碑详细信息</p>
    </div>

    <div class="card p-8">
      <p class="text-center text-gray-600 dark:text-gray-400">
        此功能正在开发中...
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
// In a real implementation, would fetch the milestone with ID from route.params.id
console.log("Milestone ID:", route.params.id);
</script>
