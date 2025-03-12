<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">编辑项目</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        修改以下表单中的项目信息
      </p>
    </div>

    <div v-if="loading && !project" class="flex justify-center py-10">
      <arrow-path-icon class="animate-spin h-10 w-10 text-primary-500" />
    </div>

    <div
      v-else-if="error && !project"
      class="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
    >
      {{ error }}
      <div class="mt-2">
        <button
          @click="goBack"
          class="text-primary-600 dark:text-primary-400 hover:underline"
        >
          返回项目列表
        </button>
      </div>
    </div>

    <div v-else>
      <div
        v-if="saveError"
        class="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      >
        {{ saveError }}
      </div>

      <project-form
        v-if="project"
        :initial-data="project"
        :loading="saving"
        @submit="updateProject"
        @cancel="goBack"
        @file-selected="handleFileSelected"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useProjectStore } from "@/store/project";
import ProjectForm from "@/components/projects/ProjectForm.vue";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

const project = ref(null);
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const saveError = ref("");
const selectedFile = ref(null);

const handleFileSelected = (file) => {
  selectedFile.value = file;
};

onMounted(async () => {
  const projectId = route.params.id;
  if (!projectId) {
    error.value = "项目ID无效";
    loading.value = false;
    return;
  }

  try {
    const fetchedProject = await projectStore.fetchProjectById(projectId);
    if (fetchedProject) {
      project.value = fetchedProject;
    } else {
      error.value = "未找到项目";
    }
  } catch (err) {
    error.value = "加载项目时发生错误，请稍后再试";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const updateProject = async (projectData) => {
  saving.value = true;
  saveError.value = "";

  try {
    // Update the project
    const updatedProject = await projectStore.updateProject(
      route.params.id,
      projectData
    );

    if (!updatedProject) {
      throw new Error("更新项目失败");
    }

    // If a file was selected, upload it
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append("taskDocument", selectedFile.value);

      await projectStore.uploadTaskDocument(updatedProject.id, formData);
    }

    // Navigate to the project details page
    router.push(`/projects/${updatedProject.id}`);
  } catch (err) {
    saveError.value = err.message || "更新项目时发生错误，请稍后再试";
    console.error(err);
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  router.push(`/projects/${route.params.id}`);
};
</script>
