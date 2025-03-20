<template>
  <form @submit.prevent="submitForm">
    <div class="card mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        基本信息
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            项目名称 <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="form-input"
            placeholder="请输入项目名称"
          />
        </div>

        <div>
          <label
            for="type"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            项目类型 <span class="text-red-500">*</span>
          </label>
          <select id="type" v-model="form.type" required class="form-input">
            <option value="" disabled>请选择项目类型</option>
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
            for="organizationId"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            牵头单位 <span class="text-red-500">*</span>
          </label>
          <select
            id="organizationId"
            v-model="form.organizationId"
            required
            class="form-input"
          >
            <option value="" disabled>请选择牵头单位</option>
            <option
              v-for="org in organizations"
              :key="org.id"
              :value="org.id"
            >
              {{ org.name }} ({{ org.type }})
            </option>
          </select>
        </div>

        <div>
          <label
            for="leader"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            项目负责人 <span class="text-red-500">*</span>
          </label>
          <input
            id="leader"
            v-model="form.leader"
            type="text"
            required
            class="form-input"
            placeholder="请输入项目负责人姓名"
          />
        </div>

        <div>
          <label
            for="contact"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            联系人
          </label>
          <input
            id="contact"
            v-model="form.contact"
            type="text"
            class="form-input"
            placeholder="请输入联系人姓名"
          />
        </div>

        <div>
          <label
            for="budget"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            经费预算 (元)
          </label>
          <input
            id="budget"
            v-model.number="form.budget"
            type="number"
            min="0"
            step="0.01"
            class="form-input"
            placeholder="请输入项目经费预算"
          />
        </div>

        <div>
          <label
            for="startDate"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            开始日期 <span class="text-red-500">*</span>
          </label>
          <input
            id="startDate"
            v-model="form.startDate"
            type="date"
            required
            class="form-input"
          />
        </div>

        <div>
          <label
            for="endDate"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            结束日期 <span class="text-red-500">*</span>
          </label>
          <input
            id="endDate"
            v-model="form.endDate"
            type="date"
            required
            class="form-input"
          />
        </div>
      </div>
    </div>

    <div class="card mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        团队与合作信息
      </h3>

      <div class="mb-4">
        <label
          for="teamAllocation"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          成员分工
        </label>
        <textarea
          id="teamAllocation"
          v-model="form.teamAllocation"
          rows="3"
          class="form-input"
          placeholder="请详细描述项目团队成员及其分工"
        ></textarea>
      </div>

      <div>
        <label
          for="collaborators"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          合作单位与合作人员
        </label>
        <textarea
          id="collaborators"
          v-model="form.collaborators"
          rows="3"
          class="form-input"
          placeholder="请详细描述合作单位和相关合作人员信息"
        ></textarea>
      </div>
    </div>

    <div class="card mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        研究内容与考核指标
      </h3>

      <div class="mb-4">
        <label
          for="summary"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          研究内容摘要
        </label>
        <textarea
          id="summary"
          v-model="form.summary"
          rows="4"
          class="form-input"
          placeholder="请概述项目的主要研究内容和目标"
        ></textarea>
      </div>

      <div>
        <label
          for="kpis"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          考核指标
        </label>
        <textarea
          id="kpis"
          v-model="form.kpis"
          rows="4"
          class="form-input"
          placeholder="请列出项目关键考核指标与目标值"
        ></textarea>
      </div>
    </div>

    <div class="card mb-6" v-if="!initialData?.id">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        项目任务书
      </h3>

      <div>
        <div
          class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-700"
        >
          <div class="space-y-1 text-center">
            <document-text-icon class="mx-auto h-12 w-12 text-gray-400" />
            <div class="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                for="taskDocument"
                class="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                <span>上传任务书</span>
                <input
                  id="taskDocument"
                  type="file"
                  class="sr-only"
                  @change="handleFileChange"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
              </label>
              <p class="pl-1">或拖拽文件至此处</p>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              支持 PDF, Word, Excel 等格式文件
            </p>
          </div>
        </div>
        <div
          v-if="selectedFile"
          class="mt-2 text-sm text-gray-600 dark:text-gray-400"
        >
          已选择文件: {{ selectedFile.name }}
        </div>
      </div>
    </div>

    <div v-if="initialData?.id && initialData?.taskDocument" class="card mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        项目任务书
      </h3>

      <div class="flex items-center">
        <document-text-icon class="h-8 w-8 text-gray-400 mr-2" />
        <div>
          <div class="text-sm font-medium text-gray-900 dark:text-white">
            项目任务书
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            <a
              :href="initialData.taskDocument"
              target="_blank"
              class="text-primary-600 dark:text-primary-400 hover:underline"
              >点击查看任务书</a
            >
          </div>
        </div>
      </div>

      <div class="mt-4">
        <div
          class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md dark:border-gray-700"
        >
          <div class="space-y-1 text-center">
            <document-arrow-up-icon class="mx-auto h-12 w-12 text-gray-400" />
            <div class="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                for="newTaskDocument"
                class="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                <span>更新任务书</span>
                <input
                  id="newTaskDocument"
                  type="file"
                  class="sr-only"
                  @change="handleFileChange"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                />
              </label>
              <p class="pl-1">或拖拽文件至此处</p>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              支持 PDF, Word, Excel 等格式文件
            </p>
          </div>
        </div>
        <div
          v-if="selectedFile"
          class="mt-2 text-sm text-gray-600 dark:text-gray-400"
        >
          已选择新文件: {{ selectedFile.name }}
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-3">
      <button type="button" class="btn btn-outline" @click="$emit('cancel')">
        取消
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <arrow-path-icon v-if="loading" class="animate-spin h-5 w-5 mr-2" />
        {{ initialData?.id ? "保存项目" : "创建项目" }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import {
  DocumentTextIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: "",
      type: "",
      organization: "",
      leader: "",
      contact: "",
      teamAllocation: "",
      collaborators: "",
      startDate: "",
      endDate: "",
      summary: "",
      kpis: "",
      budget: null,
      taskDocument: null,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "cancel", "file-selected"]);

const organizations = ref([]);
const form = ref({
  name: "",
  type: "",
  organizationId: "",
  leader: "",
  contact: "",
  teamAllocation: "",
  collaborators: "",
  startDate: "",
  endDate: "",
  summary: "",
  kpis: "",
  budget: null,
  ...props.initialData
});

// Track the selected file
const selectedFile = ref(null);

// 获取组织列表
const fetchOrganizations = async () => {
  try {
    const response = await fetch('/api/organizations');
    const data = await response.json();
    organizations.value = data;
    
    // 如果是编辑模式，需要将 organization 转换为 organizationId
    if (props.initialData?.organization) {
      const org = organizations.value.find(o => o.name === props.initialData.organization);
      if (org) {
        form.value.organizationId = org.id;
      }
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
  }
};

onMounted(() => {
  fetchOrganizations();
});

// Watch for changes in initialData and update the form
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      Object.keys(form.value).forEach((key) => {
        if (key !== 'organizationId') {
          form.value[key] = newData[key] !== undefined ? newData[key] : form.value[key];
        }
      });
      
      if (newData.organization && organizations.value.length > 0) {
        const org = organizations.value.find(o => o.name === newData.organization);
        if (org) {
          form.value.organizationId = org.id;
        }
      }
    }
  },
  { immediate: true, deep: true }
);

// Watch for changes in organizations and update the form
watch(organizations, (newOrgs) => {
  if (newOrgs.length > 0 && props.initialData?.organization) {
    const org = newOrgs.find(o => o.name === props.initialData.organization);
    if (org) {
      form.value.organizationId = org.id;
    }
  }
});

// Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    emit("file-selected", file);
  }
};

// Submit the form
const submitForm = () => {
  // 在提交表单时，找到对应的组织信息
  const organization = organizations.value.find(o => o.id === form.value.organizationId);
  const submitData = {
    ...form.value,
    organization: organization?.name // 为了保持与现有API的兼容性
  };

  // 移除 organizationId，因为后端 API 不需要这个字段
  delete submitData.organizationId;

  emit("submit", submitData);
};
</script>
