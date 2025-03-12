<template>
  <div class="flex flex-col items-center justify-center py-12">
    <div class="text-6xl font-bold text-primary-600 dark:text-primary-400">
      404
    </div>
    <h1 class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
      页面未找到
    </h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">您请求的页面不存在</p>
    <router-link
      to="/"
      class="mt-6 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
    >
      返回首页
    </router-link>
  </div>
</template>
