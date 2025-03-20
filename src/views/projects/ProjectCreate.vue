<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        创建新项目
      </h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        填写表单以创建新的科研项目
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-10">
      <arrow-path-icon class="animate-spin h-10 w-10 text-primary-500" />
    </div>

    <div
      v-else-if="error"
      class="card p-4 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
    >
      {{ error }}
    </div>

    <div v-else class="card p-6">
      <project-form 
        @submit="createProject" 
        @cancel="goBack"
        @file-selected="handleFileSelected" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import { useProjectStore } from "@/store/project";
import ProjectForm from "@/components/projects/ProjectForm.vue";

const router = useRouter();
const projectStore = useProjectStore();
const loading = ref(false);
const error = ref("");
const selectedFile = ref(null);

const handleFileSelected = (file) => {
  selectedFile.value = file;
};

const createProject = async (projectData) => {
  loading.value = true;
  error.value = "";

  try {
    const newProject = await projectStore.createProject(projectData);

    // Upload document if provided
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append("taskDocument", selectedFile.value);
      await projectStore.uploadTaskDocument(newProject.id, formData);
    }

    // Redirect to project details page
    router.push(`/projects/${newProject.id}`);
  } catch (err) {
    console.error("Error creating project:", err);
    error.value = "创建项目失败，请稍后再试";
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push("/projects");
};
</script>
