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
          <select
            id="leader"
            v-model="form.leader"
            required
            class="form-input"
            :disabled="!form.organizationId"
          >
            <option value="" disabled>请选择项目负责人</option>
            <option
              v-for="user in leadOrgUsers"
              :key="user.id"
              :value="user.name"
            >
              {{ user.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="contact"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            联系人
          </label>
          <select
            id="contact"
            v-model="form.contact"
            class="form-input"
            :disabled="!form.organizationId"
          >
            <option value="" disabled>请选择联系人</option>
            <option
              v-for="user in leadOrgUsers"
              :key="user.id"
              :value="user.name"
            >
              {{ user.name }}
            </option>
          </select>
        </div>

        <div>
          <label
            for="budget"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            经费预算 (万元)
          </label>
          <div class="form-input bg-gray-100 dark:bg-gray-700">
            {{ totalFunding.total }}
          </div>
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
        参与单位及经费
      </h3>

      <div class="space-y-4">
        <div v-for="(org, index) in form.organizations" :key="index" class="border p-4 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-base font-medium">
              {{ index === 0 ? '牵头单位' : `参与单位 ${index}` }}
            </h4>
            <button
              v-if="index !== 0"
              type="button"
              class="text-red-600 hover:text-red-800"
              @click="removeOrganization(index)"
            >
              删除
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                单位名称 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="org.organizationId"
                required
                class="form-input"
                :disabled="index === 0"
              >
                <option value="" disabled>请选择单位</option>
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                自筹经费 (万元) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="org.selfFunding"
                type="text"
                required
                class="form-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                @input="handleFundingInput(index, 'selfFunding', $event.target.value)"
                @blur="formatFunding(index, 'selfFunding')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                拨款经费 (万元) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="org.allocation"
                type="text"
                required
                class="form-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                @input="handleFundingInput(index, 'allocation', $event.target.value)"
                @blur="formatFunding(index, 'allocation')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                总经费 (万元)
              </label>
              <div class="form-input bg-gray-100 dark:bg-gray-700">
                {{ (parseFloat(org.selfFunding || 0) + parseFloat(org.allocation || 0)).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-outline w-full"
          @click="addOrganization"
        >
          添加参与单位
        </button>

        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 class="text-base font-medium mb-2">项目总经费</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                总自筹经费 (万元)
              </label>
              <div class="form-input bg-gray-100 dark:bg-gray-700">
                {{ totalFunding.selfFunding }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                总拨款经费 (万元)
              </label>
              <div class="form-input bg-gray-100 dark:bg-gray-700">
                {{ totalFunding.allocation }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                项目总经费 (万元)
              </label>
              <div class="form-input bg-gray-100 dark:bg-gray-700">
                {{ totalFunding.total }}
              </div>
            </div>
          </div>
        </div>
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
import { ref, reactive, watch, onMounted, computed } from "vue";
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
      organizations: [],
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit", "cancel", "file-selected"]);

const organizations = ref([]);
const selectedOrganizations = ref([]);
const leadOrgUsers = ref([]);
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
  organizations: [],
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
    
    // 如果是编辑模式，需要设置已选择的组织
    if (props.initialData?.organizations) {
      selectedOrganizations.value = JSON.parse(props.initialData.organizations);
      form.value.organizations = selectedOrganizations.value;
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
  }
};

// 获取牵头单位的人员列表
const fetchLeadOrgUsers = async (organizationId) => {
  if (!organizationId) {
    leadOrgUsers.value = [];
    form.value.leader = "";
    form.value.contact = "";
    return;
  }

  try {
    const response = await fetch(`/api/organizations/${organizationId}/users`);
    const data = await response.json();
    leadOrgUsers.value = data;
    
    // 如果当前选择的负责人或联系人不在新的人员列表中，清空选择
    if (form.value.leader && !leadOrgUsers.value.some(user => user.name === form.value.leader)) {
      form.value.leader = "";
    }
    if (form.value.contact && !leadOrgUsers.value.some(user => user.name === form.value.contact)) {
      form.value.contact = "";
    }
  } catch (error) {
    console.error('Error fetching organization users:', error);
    leadOrgUsers.value = [];
  }
};

onMounted(async () => {
  await fetchOrganizations();
  
  // 如果是编辑模式，需要获取牵头单位的用户列表
  if (props.initialData?.organizationId) {
    await fetchLeadOrgUsers(props.initialData.organizationId);
  }
});

// 计算总经费
const totalFunding = computed(() => {
  const orgs = form.value.organizations;
  return {
    selfFunding: orgs.reduce((sum, org) => sum + (parseFloat(org.selfFunding) || 0), 0).toFixed(2),
    allocation: orgs.reduce((sum, org) => sum + (parseFloat(org.allocation) || 0), 0).toFixed(2),
    total: orgs.reduce((sum, org) => sum + (parseFloat(org.selfFunding) || 0) + (parseFloat(org.allocation) || 0), 0).toFixed(2)
  };
});

// 添加参与单位
const addOrganization = () => {
  form.value.organizations.push({
    organizationId: "",
    selfFunding: "0.00",
    allocation: "0.00"
  });
};

// 移除参与单位
const removeOrganization = (index) => {
  form.value.organizations.splice(index, 1);
};

// 处理经费输入
const handleFundingInput = (index, field, value) => {
  // 允许空值
  if (!value) {
    form.value.organizations[index][field] = "";
    return;
  }

  // 只允许数字和小数点
  const cleanValue = value.replace(/[^\d.]/g, "");
  
  // 确保只有一个小数点
  const parts = cleanValue.split(".");
  if (parts.length > 2) {
    form.value.organizations[index][field] = parts[0] + "." + parts.slice(1).join("");
  } else {
    form.value.organizations[index][field] = cleanValue;
  }
};

// 格式化经费
const formatFunding = (index, field) => {
  const value = form.value.organizations[index][field];
  
  // 如果是空值，设置为 0.00
  if (!value) {
    form.value.organizations[index][field] = "0.00";
    return;
  }

  // 转换为数字并格式化
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0) {
    form.value.organizations[index][field] = "0.00";
  } else {
    form.value.organizations[index][field] = numValue.toFixed(2);
  }
};

// Watch for changes in initialData and update the form
watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.keys(form.value).forEach((key) => {
      if (key !== 'organizations') {
        form.value[key] = newData[key] !== undefined ? newData[key] : form.value[key];
      }
    });
    
    // 只在有 organizations 数据时进行解析
    if (newData.organizations && typeof newData.organizations === 'string') {
      form.value.organizations = JSON.parse(newData.organizations);
    } else if (!form.value.organizations.length) {
      // 如果没有组织数据，初始化一个空的牵头单位
      form.value.organizations = [{
        organizationId: "",
        selfFunding: "0.00",
        allocation: "0.00"
      }];
    }

    // 如果有牵头单位，获取其用户列表
    if (newData.organizationId) {
      fetchLeadOrgUsers(newData.organizationId);
    }
  }
}, { immediate: true });

// 监听牵头单位的变化
watch(() => form.value.organizationId, async (newOrgId) => {
  if (newOrgId && form.value.organizations.length > 0) {
    // 更新参与单位及经费中的牵头单位
    form.value.organizations[0].organizationId = newOrgId;
    // 获取牵头单位的人员列表
    await fetchLeadOrgUsers(newOrgId);
  } else {
    // 如果没有选择牵头单位，清空人员列表和选择
    leadOrgUsers.value = [];
    form.value.leader = "";
    form.value.contact = "";
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
  // 验证所有组织的经费信息
  if (!form.value.organizations.length) {
    alert('请至少添加一个参与单位');
    return;
  }

  for (const org of form.value.organizations) {
    if (!org.organizationId) {
      alert('请选择所有参与单位');
      return;
    }
    if (parseFloat(org.selfFunding) < 0 || parseFloat(org.allocation) < 0) {
      alert('经费不能为负数');
      return;
    }
  }

  emit("submit", form.value);
};
</script>
