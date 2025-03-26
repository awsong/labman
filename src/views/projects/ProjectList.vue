<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">项目列表</h1>
      <router-link
        to="/projects/create"
        class="btn btn-primary flex items-center"
      >
        <plus-icon class="h-5 w-5 mr-1" />
        新建项目
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            for="search"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            搜索
          </label>
          <input
            id="search"
            type="text"
            class="form-input"
            placeholder="项目名称、负责人或单位"
            v-model="searchQuery"
          />
        </div>

        <div>
          <label
            for="type"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            项目类型
          </label>
          <select id="type" v-model="typeFilter" class="form-input">
            <option value="">全部类型</option>
            <option value="国家级项目">国家级项目</option>
            <option value="省部级项目">省部级项目</option>
            <option value="市级项目">市级项目</option>
            <option value="企业合作项目">企业合作项目</option>
            <option value="横向课题">横向课题</option>
            <option value="院校内部项目">院校内部项目</option>
          </select>
        </div>

        <div>
          <label
            for="year"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            年份
          </label>
          <select id="year" v-model="yearFilter" class="form-input">
            <option value="">全部年份</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="status"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            状态
          </label>
          <select id="status" v-model="statusFilter" class="form-input">
            <option value="">全部状态</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="upcoming">未开始</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Projects List -->
    <div v-if="loading" class="flex justify-center py-10">
      <arrow-path-icon class="animate-spin h-10 w-10 text-primary-500" />
    </div>

    <div
      v-else-if="error"
      class="card p-4 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
    >
      {{ error }}
    </div>

    <div v-else-if="filteredProjects.length === 0" class="card p-8 text-center">
      <folder-open-icon class="h-12 w-12 mx-auto text-gray-400" />
      <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">
        {{
          projectStore.projects.length === 0
            ? "暂无项目数据"
            : "没有符合筛选条件的项目"
        }}
      </h3>
      <p class="mt-1 text-gray-500 dark:text-gray-400">
        {{
          projectStore.projects.length === 0
            ? '点击上方"新建项目"按钮创建您的第一个项目'
            : "尝试调整筛选条件以查看更多项目"
        }}
      </p>
      <div v-if="projectStore.projects.length === 0" class="mt-6">
        <router-link to="/projects/create" class="btn btn-primary">
          新建项目
        </router-link>
      </div>
    </div>

    <div v-else>
      <div class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  class="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 w-[28%]"
                >
                  项目名称
                </th>
                <th
                  scope="col"
                  class="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 w-[10%]"
                >
                  类型
                </th>
                <th
                  scope="col"
                  class="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 w-[18%]"
                >
                  牵头单位
                </th>
                <th
                  scope="col"
                  class="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 w-[10%]"
                >
                  项目负责人
                </th>
                <th
                  scope="col"
                  class="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 w-[20%] whitespace-nowrap"
                >
                  起止日期
                </th>
                <th
                  scope="col"
                  class="sticky top-0 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 w-[8%] whitespace-nowrap"
                >
                  状态
                </th>
                <th
                  scope="col"
                  class="sticky top-0 px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800 w-[6%]"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <tr
                v-for="project in filteredProjects"
                :key="project.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td class="px-6 py-4">
                  <router-link
                    :to="`/projects/${project.id}`"
                    class="text-primary-600 dark:text-primary-400 hover:underline font-medium truncate block"
                  >
                    {{ project.name }}
                  </router-link>
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getProjectTypeClass(project.type)"
                  >
                    {{ project.type }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="truncate block text-gray-600 dark:text-gray-300">
                    {{ project.organization }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                  {{ project.leader }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                  {{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}
                </td>
                <td class="px-4 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getProjectStatusClass(getProjectStatus(project))"
                  >
                    {{ getProjectStatusText(project) }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <router-link
                    :to="`/projects/${project.id}`"
                    class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                  >
                    查看
                  </router-link>
                  <router-link
                    :to="`/projects/${project.id}/edit`"
                    class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                  >
                    编辑
                  </router-link>
                  <button
                    @click="confirmDelete(project)"
                    class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 overflow-y-auto z-50">
      <div
        class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center"
        @click="showDeleteModal = false"
      >
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            class="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"
          ></div>
        </div>

        <div
          class="relative inline-block bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full p-6"
          @click.stop
        >
          <div>
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900"
            >
              <exclamation-triangle-icon
                class="h-6 w-6 text-red-600 dark:text-red-400"
              />
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3
                class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
              >
                删除项目
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  您确定要删除项目
                  <span class="font-medium">{{ projectToDelete?.name }}</span>
                  吗？此操作无法撤销，项目的所有数据都将被永久删除。
                </p>
              </div>
            </div>
          </div>
          <div
            class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense"
          >
            <button
              type="button"
              class="btn btn-outline w-full sm:col-start-1"
              @click="showDeleteModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="btn bg-red-600 hover:bg-red-700 text-white w-full sm:col-start-2"
              @click="deleteProject"
              :disabled="deleting"
            >
              <arrow-path-icon v-if="deleting" class="animate-spin h-5 w-5 mr-2" />
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProjectStore } from "@/store/project";
import { useRouter } from "vue-router";
import {
  ArrowPathIcon,
  PlusIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import { formatDate } from "@/utils/date";

const projectStore = useProjectStore();
const router = useRouter();

const searchQuery = ref("");
const typeFilter = ref("");
const yearFilter = ref("");
const statusFilter = ref("");
const loading = ref(true);
const error = ref("");
const showDeleteModal = ref(false);
const projectToDelete = ref(null);
const deleting = ref(false);

// Computed properties
const availableYears = computed(() => {
  const years = new Set();
  projectStore.projects.forEach((project) => {
    years.add(new Date(project.startDate).getFullYear());
    years.add(new Date(project.endDate).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
});

const filteredProjects = computed(() => {
  if (!projectStore.projects) return [];

  return projectStore.projects.filter((project) => {
    // Search query filter
    const searchLower = searchQuery.value.toLowerCase();
    const matchesSearch =
      !searchQuery.value ||
      project.name.toLowerCase().includes(searchLower) ||
      project.leader.toLowerCase().includes(searchLower) ||
      project.organization.toLowerCase().includes(searchLower);

    // Type filter
    const matchesType = !typeFilter.value || project.type === typeFilter.value;

    // Year filter
    const projectYear = new Date(project.startDate).getFullYear();
    const matchesYear = !yearFilter.value || projectYear === parseInt(yearFilter.value);

    // Status filter
    const projectStatus = getProjectStatus(project);
    const matchesStatus =
      !statusFilter.value || projectStatus === statusFilter.value;

    return matchesSearch && matchesType && matchesYear && matchesStatus;
  });
});

// Helper functions
const getProjectStatus = (project) => {
  const now = new Date();
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);

  if (now < startDate) return "upcoming";
  if (now > endDate) return "completed";
  return "active";
};

const getProjectStatusText = (project) => {
  const status = getProjectStatus(project);
  if (status === "upcoming") return "未开始";
  if (status === "completed") return "已完成";
  return "进行中";
};

const getProjectStatusClass = (status) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "completed":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getProjectTypeClass = (type) => {
  switch (type) {
    case "国家级项目":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "省部级项目":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "市级项目":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "企业合作项目":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "横向课题":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    case "院校内部项目":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Delete project logic
const confirmDelete = (project) => {
  projectToDelete.value = project;
  showDeleteModal.value = true;
};

const deleteProject = async () => {
  if (!projectToDelete.value) return;

  deleting.value = true;

  try {
    await projectStore.deleteProject(projectToDelete.value.id);
    showDeleteModal.value = false;
  } catch (err) {
    error.value = "删除项目失败，请稍后再试";
    console.error(err);
  } finally {
    deleting.value = false;
    projectToDelete.value = null;
  }
};

// Load projects on mount
onMounted(async () => {
  loading.value = true;
  try {
    await projectStore.fetchProjects();
  } catch (err) {
    error.value = "获取项目列表失败，请稍后再试";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
