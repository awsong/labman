<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">控制面板</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        欢迎回来，{{ authStore.currentUser?.name }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <arrow-path-icon class="animate-spin h-10 w-10 text-primary-500" />
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="card bg-white dark:bg-gray-800">
          <div class="flex items-center">
            <div class="p-3 rounded-md bg-primary-100 dark:bg-primary-900/30">
              <folder-icon
                class="h-6 w-6 text-primary-600 dark:text-primary-400"
              />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                总项目数
              </div>
              <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.totalProjects || 0 }}
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-white dark:bg-gray-800">
          <div class="flex items-center">
            <div class="p-3 rounded-md bg-green-100 dark:bg-green-900/30">
              <clock-icon class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                进行中的项目
              </div>
              <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.activeProjects || 0 }}
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-white dark:bg-gray-800">
          <div class="flex items-center">
            <div class="p-3 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
              <flag-icon class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500 dark:text-gray-400">
                即将到期里程碑
              </div>
              <div class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ upcomingMilestones.length }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Projects and Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              最近项目
            </h2>
            <router-link
              to="/projects"
              class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              查看全部
            </router-link>
          </div>

          <div
            v-if="recentProjects.length === 0"
            class="text-gray-500 dark:text-gray-400 text-center py-4"
          >
            暂无项目数据
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="project in recentProjects"
              :key="project.id"
              class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <router-link :to="`/projects/${project.id}`" class="block">
                <div class="flex justify-between">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ project.name }}
                  </h3>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{
                    formatDate(project.startDate)
                  }}</span>
                </div>
                <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ project.organization }} · {{ project.type }}
                </div>
                <div class="mt-2 flex items-center">
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    项目负责人：{{ project.leader }}
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              项目类型分布
            </h2>
            <router-link
              to="/statistics"
              class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              详细统计
            </router-link>
          </div>

          <div
            v-if="
              !stats.projectsByType ||
              Object.keys(stats.projectsByType || {}).length === 0 ||
              !chartRenderable
            "
            class="text-gray-500 dark:text-gray-400 text-center py-4"
          >
            暂无项目类型数据
          </div>
          <div v-else class="h-64 chart-container">
            <!-- 隐藏的占位符元素，用于在重新渲染时替换图表 -->
            <div v-if="chartError" class="h-full flex items-center justify-center">
              <p class="text-gray-500 dark:text-gray-400">加载图表时出错</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Milestones -->
      <div class="mt-6">
        <div class="card">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-medium text-gray-900 dark:text-white">
              即将到期的里程碑
            </h2>
            <router-link
              to="/milestones"
              class="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              查看全部
            </router-link>
          </div>

          <div
            v-if="upcomingMilestones.length === 0"
            class="text-gray-500 dark:text-gray-400 text-center py-4"
          >
            暂无即将到期的里程碑
          </div>

          <div v-else class="overflow-x-auto">
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    里程碑名称
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    项目
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    类型
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    到期日期
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    状态
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="milestone in upcomingMilestones"
                  :key="milestone.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link
                      :to="`/milestones/${milestone.id}`"
                      class="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {{ milestone.title }}
                    </router-link>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link
                      :to="`/projects/${milestone.projectId}`"
                      class="text-gray-900 dark:text-white hover:underline"
                    >
                      {{ getProjectName(milestone.projectId) }}
                    </router-link>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getMilestoneTypeClass(milestone.type)"
                    >
                      {{ milestone.type }}
                    </span>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400"
                  >
                    {{ formatDate(milestone.dueDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getMilestoneStatusClass(milestone.status)"
                    >
                      {{ milestone.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useAuthStore } from "@/store/auth";
import { useProjectStore } from "@/store/project";
import { useMilestoneStore } from "@/store/milestone";
import {
  ArrowPathIcon,
  FolderIcon,
  ClockIcon,
  FlagIcon,
} from "@heroicons/vue/24/outline";

const authStore = useAuthStore();
const projectStore = useProjectStore();
const milestoneStore = useMilestoneStore();

const loading = ref(true);
const chartError = ref(false);
const chartRenderable = ref(false);

const stats = ref({
  totalProjects: 0,
  activeProjects: 0,
  projectsByType: null,
  projectsByYear: null,
  projectsByTeam: null,
});
const upcomingMilestones = ref([]);

// Computed for recent projects (max 3)
const recentProjects = computed(() => {
  return projectStore.projects.slice(0, 3);
});

// Format date function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN");
};

// Get project name by ID
const getProjectName = (projectId) => {
  const project = projectStore.getProjectById(projectId);
  return project ? project.name : "未知项目";
};

// Milestone type style classes
const getMilestoneTypeClass = (type) => {
  switch (type) {
    case "年度评审":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "中期评审":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "结项评审":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Milestone status style classes
const getMilestoneStatusClass = (status) => {
  switch (status) {
    case "未开始":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "进行中":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "已完成":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "已延期":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Load data
onMounted(async () => {
  loading.value = true;

  try {
    // Fetch projects
    await projectStore.fetchProjects();

    // Fetch milestones
    await milestoneStore.fetchMilestones();

    // Filter upcoming milestones (due in the next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    upcomingMilestones.value = milestoneStore.milestones
      .filter((milestone) => {
        const dueDate = new Date(milestone.dueDate);
        return dueDate <= thirtyDaysFromNow && milestone.status !== "已完成";
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5); // Get only the first 5

    // For demo purposes, create some mock statistics
    stats.value = {
      totalProjects: projectStore.projects.length,
      activeProjects: projectStore.projects.filter((p) => {
        const now = new Date();
        const startDate = new Date(p.startDate);
        const endDate = new Date(p.endDate);
        return now >= startDate && now <= endDate;
      }).length,
      projectsByType: projectStore.projectsByType,
      projectsByYear: projectStore.projectsByYear,
      projectsByTeam: projectStore.projectsByTeam,
    };
    
    // 延迟更新图表可渲染状态，避免页面初始化时出错
    setTimeout(() => {
      chartRenderable.value = true;
    }, 1000);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    chartError.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>
