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
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          预期成果汇总
        </label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">软件</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.software }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">硬件</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.hardware }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">论文</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.papers }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">专利</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.patents }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">软件著作权</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.copyrights }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">标准</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.standards }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">技术报告</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.reports }}
            </div>
          </div>
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">应用示范证明</div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ totalExpectedOutcomes.demonstrations }}
            </div>
          </div>
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
                @change="handleOrgChange(index)"
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

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              研究内容与摘要
            </label>
            <textarea
              v-model="org.researchSummary"
              rows="3"
              class="form-input w-full"
              :placeholder="index === 0 ? '请描述牵头单位的主要研究内容和任务' : '请描述该参与单位的主要研究内容和任务'"
            ></textarea>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              预期成果
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">软件</label>
                <input
                  v-model="org.expectedOutcomes.software"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">硬件</label>
                <input
                  v-model="org.expectedOutcomes.hardware"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">论文</label>
                <input
                  v-model="org.expectedOutcomes.papers"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">专利</label>
                <input
                  v-model="org.expectedOutcomes.patents"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">软件著作权</label>
                <input
                  v-model="org.expectedOutcomes.copyrights"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">标准</label>
                <input
                  v-model="org.expectedOutcomes.standards"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">技术报告</label>
                <input
                  v-model="org.expectedOutcomes.reports"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">应用示范证明</label>
                <input
                  v-model="org.expectedOutcomes.demonstrations"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                负责人 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="org.leader"
                required
                class="form-input"
                :disabled="index === 0"
              >
                <option value="" disabled>请选择负责人</option>
                <option
                  v-for="user in index === 0 ? leadOrgUsers : (orgUsers[org.organizationId] || [])"
                  :key="user.id"
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                联系人 <span class="text-red-500">*</span>
              </label>
              <select
                v-model="org.contact"
                required
                class="form-input"
                :disabled="index === 0"
              >
                <option value="" disabled>请选择联系人</option>
                <option
                  v-for="user in index === 0 ? leadOrgUsers : (orgUsers[org.organizationId] || [])"
                  :key="user.id"
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                参与人
              </label>
              <div class="space-y-2">
                <!-- 人员选择 -->
                <select
                  class="form-input w-full"
                  :disabled="!org.organizationId"
                  v-model="selectedParticipants[index]"
                  @change="addParticipant(index)"
                >
                  <option value="" disabled>选择参与人</option>
                  <option
                    v-for="user in index === 0 ? leadOrgUsers : (orgUsers[org.organizationId] || [])"
                    :key="user.id"
                    :value="user.name"
                    :disabled="org.participants.includes(user.name)"
                  >
                    {{ user.name }}
                  </option>
                </select>

                <!-- 参与人列表 -->
                <div v-if="org.participants.length > 0" class="flex flex-wrap gap-2">
                  <div v-for="participant in org.participants" :key="participant" 
                    class="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {{ participant }}
                    <button type="button" @click="removeParticipant(index, participant)"
                      class="ml-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200">
                      ×
                    </button>
                  </div>
                </div>
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
import { ElMessage } from "element-plus";

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
const orgUsers = ref({});
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
      try {
        selectedOrganizations.value = typeof props.initialData.organizations === 'string' 
          ? JSON.parse(props.initialData.organizations)
          : props.initialData.organizations;
        
        // 确保每个组织都有participants数组和expectedOutcomes对象
        selectedOrganizations.value = selectedOrganizations.value.map(org => {
          // 解析 participants 字符串
          let parsedParticipants = [];
          if (typeof org.participants === 'string') {
            try {
              parsedParticipants = JSON.parse(org.participants);
            } catch (e) {
              console.error('Error parsing participants:', e);
              parsedParticipants = [];
            }
          } else if (Array.isArray(org.participants)) {
            parsedParticipants = org.participants;
          }

          // 解析 expectedOutcomes 字符串
          let parsedOutcomes = {};
          if (typeof org.expectedOutcomes === 'string') {
            try {
              parsedOutcomes = JSON.parse(org.expectedOutcomes);
            } catch (e) {
              console.error('Error parsing expectedOutcomes:', e);
              parsedOutcomes = {};
            }
          } else if (org.expectedOutcomes && typeof org.expectedOutcomes === 'object') {
            parsedOutcomes = org.expectedOutcomes;
          }

          return {
            ...org,
            participants: parsedParticipants,
            expectedOutcomes: parsedOutcomes || {
              software: 0,
              hardware: 0,
              papers: 0,
              patents: 0,
              copyrights: 0,
              standards: 0,
              reports: 0,
              demonstrations: 0
            }
          };
        });
        
        form.value.organizations = selectedOrganizations.value;

        // 如果是编辑模式，设置牵头单位的负责人和联系人
        if (props.initialData?.leader && props.initialData?.contact) {
          const leaderOrg = selectedOrganizations.value.find(org => org.organizationId === props.initialData.organizationId);
          if (leaderOrg) {
            leaderOrg.leader = props.initialData.leader;
            leaderOrg.contact = props.initialData.contact;
          }
        }
      } catch (error) {
        console.error('Error parsing organizations:', error);
        // 如果解析失败，使用空数组
        selectedOrganizations.value = [];
        form.value.organizations = [];
      }
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
    if (!response.ok) {
      throw new Error('Failed to fetch organization users');
    }
    const data = await response.json();
    leadOrgUsers.value = data || [];
    
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
    form.value.leader = "";
    form.value.contact = "";
  }
};

// Add new function to fetch organization users
const fetchOrgUsers = async (organizationId) => {
  if (!organizationId) {
    orgUsers.value[organizationId] = [];
    return;
  }
  
  try {
    const response = await fetch(`/api/organizations/${organizationId}/users`);
    if (!response.ok) {
      throw new Error('Failed to fetch organization users');
    }
    const data = await response.json();
    orgUsers.value[organizationId] = data || [];
  } catch (error) {
    console.error('Error fetching organization users:', error);
    orgUsers.value[organizationId] = [];
  }
};

onMounted(async () => {
  await fetchOrganizations();
  
  // 如果是编辑模式，需要获取牵头单位的用户列表
  if (props.initialData?.organizationId) {
    await fetchLeadOrgUsers(props.initialData.organizationId);
  }

  // 如果没有组织数据，初始化一个空的牵头单位
  if (!form.value.organizations.length) {
    form.value.organizations = [{
      organizationId: form.value.organizationId || "",
      selfFunding: "0.00",
      allocation: "0.00",
      leader: form.value.leader || "",
      contact: form.value.contact || "",
      participants: [],
      researchSummary: "",
      expectedOutcomes: {
        software: 0,
        hardware: 0,
        papers: 0,
        patents: 0,
        copyrights: 0,
        standards: 0,
        reports: 0,
        demonstrations: 0
      }
    }];
  }

  // 获取所有已选择组织的用户列表
  for (const org of form.value.organizations) {
    if (org.organizationId) {
      await fetchOrgUsers(org.organizationId);
    }
  }

  // 初始化 selectedParticipants
  form.value.organizations.forEach((_, index) => {
    selectedParticipants.value[index] = "";
  });
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
  const newIndex = form.value.organizations.length;
  form.value.organizations.push({
    organizationId: "",
    selfFunding: "0.00",
    allocation: "0.00",
    leader: "",
    contact: "",
    participants: [],
    researchSummary: "",
    expectedOutcomes: {
      software: 0,
      hardware: 0,
      papers: 0,
      patents: 0,
      copyrights: 0,
      standards: 0,
      reports: 0,
      demonstrations: 0
    }
  });
  selectedParticipants.value[newIndex] = "";
};

// 移除参与单位
const removeOrganization = (index) => {
  form.value.organizations.splice(index, 1);
  delete selectedParticipants.value[index];
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

// Add handler for organization change
const handleOrgChange = async (index) => {
  const org = form.value.organizations[index];
  if (org.organizationId) {
    await fetchOrgUsers(org.organizationId);
    // Reset leader, contact and participants when organization changes
    org.leader = "";
    org.contact = "";
    org.participants = [];
  }
};

// Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    emit("file-selected", file);
  }
};

// Submit the form
const submitForm = async (e) => {
  e.preventDefault();
  
  try {
    // 基本验证
    if (!form.value.name) {
      ElMessage.error("请输入项目名称");
      return;
    }
    if (!form.value.type) {
      ElMessage.error("请选择项目类型");
      return;
    }
    if (!form.value.organizationId) {
      ElMessage.error("请选择牵头单位");
      return;
    }
    if (!form.value.leader) {
      ElMessage.error("请选择项目负责人");
      return;
    }
    if (!form.value.contact) {
      ElMessage.error("请选择联系人");
      return;
    }
    if (!form.value.startDate) {
      ElMessage.error("请选择开始日期");
      return;
    }
    if (!form.value.endDate) {
      ElMessage.error("请选择结束日期");
      return;
    }

    // 验证经费
    for (const org of form.value.organizations) {
      if (org.selfFunding < 0 || org.allocation < 0) {
        ElMessage.error("经费不能为负数");
        return;
      }
    }

    // 验证牵头单位信息
    const leaderOrg = form.value.organizations.find(org => org.organizationId === form.value.organizationId);
    if (!leaderOrg) {
      ElMessage.error("牵头单位信息不完整");
      return;
    }
    if (!leaderOrg.leader) {
      ElMessage.error("请选择牵头单位负责人");
      return;
    }
    if (!leaderOrg.contact) {
      ElMessage.error("请选择牵头单位联系人");
      return;
    }

    // 获取牵头单位的负责人用户信息
    const leaderUser = leadOrgUsers.value.find(
      (user) => user.name === form.value.leader
    );

    if (!leaderUser) {
      ElMessage.error(`找不到负责人: ${form.value.leader}`);
      return;
    }

    // 创建要提交的数据副本，并添加用户ID
    const formData = {
      ...form.value,
      leaderId: leaderUser.id,
      status: "进行中",
      organizations: form.value.organizations.map(org => ({
        ...org,
        participants: Array.isArray(org.participants) ? org.participants : [],
        expectedOutcomes: org.expectedOutcomes || {
          software: 0,
          hardware: 0,
          papers: 0,
          patents: 0,
          copyrights: 0,
          standards: 0,
          reports: 0,
          demonstrations: 0
        }
      }))
    };

    // 提交表单
    await emit("submit", formData);
  } catch (error) {
    console.error("Error submitting form:", error);
    ElMessage.error(error.response?.data?.error || "提交表单失败，请稍后重试");
  }
};

// Modify watch for initialData to handle new fields
watch(() => props.initialData, (newData) => {
  if (newData) {
    Object.keys(form.value).forEach((key) => {
      if (key !== 'organizations') {
        form.value[key] = newData[key] !== undefined ? newData[key] : form.value[key];
      }
    });
    
    // 只在有 organizations 数据时进行解析
    if (newData.organizations) {
      const parsedOrgs = typeof newData.organizations === 'string' 
        ? JSON.parse(newData.organizations)
        : newData.organizations;
      
      // 确保每个组织都有新的字段
      form.value.organizations = parsedOrgs.map(org => {
        // 解析 participants 字符串
        let parsedParticipants = [];
        if (typeof org.participants === 'string') {
          try {
            parsedParticipants = JSON.parse(org.participants);
          } catch (e) {
            console.error('Error parsing participants:', e);
            parsedParticipants = [];
          }
        } else if (Array.isArray(org.participants)) {
          parsedParticipants = org.participants;
        }

        // 解析 expectedOutcomes 字符串
        let parsedOutcomes = {};
        if (typeof org.expectedOutcomes === 'string') {
          try {
            parsedOutcomes = JSON.parse(org.expectedOutcomes);
          } catch (e) {
            console.error('Error parsing expectedOutcomes:', e);
            parsedOutcomes = {};
          }
        } else if (org.expectedOutcomes && typeof org.expectedOutcomes === 'object') {
          parsedOutcomes = org.expectedOutcomes;
        }

        return {
          ...org,
          leader: org.leader || "",
          contact: org.contact || "",
          participants: parsedParticipants,
          expectedOutcomes: parsedOutcomes || {
            software: 0,
            hardware: 0,
            papers: 0,
            patents: 0,
            copyrights: 0,
            standards: 0,
            reports: 0,
            demonstrations: 0
          }
        };
      });

      // 如果是编辑模式，设置牵头单位的负责人和联系人
      if (newData.leader && newData.contact) {
        const leaderOrg = form.value.organizations.find(org => org.organizationId === newData.organizationId);
        if (leaderOrg) {
          leaderOrg.leader = newData.leader;
          leaderOrg.contact = newData.contact;
        }
      }
    } else if (!form.value.organizations.length) {
      // 如果没有组织数据，初始化一个空的牵头单位
      form.value.organizations = [{
        organizationId: "",
        selfFunding: "0.00",
        allocation: "0.00",
        leader: newData.leader || "",
        contact: newData.contact || "",
        participants: [],
        researchSummary: "",
        expectedOutcomes: {
          software: 0,
          hardware: 0,
          papers: 0,
          patents: 0,
          copyrights: 0,
          standards: 0,
          reports: 0,
          demonstrations: 0
        }
      }];
    }

    // 如果有牵头单位，获取其用户列表
    if (newData.organizationId) {
      fetchLeadOrgUsers(newData.organizationId);
    }

    // 获取所有参与单位的用户列表
    form.value.organizations.forEach(async (org) => {
      if (org.organizationId) {
        await fetchOrgUsers(org.organizationId);
      }
    });
  }
}, { immediate: true });

// 监听牵头单位的负责人变化
watch(() => form.value.organizations[0]?.leader, (newLeader) => {
  if (form.value.organizations.length > 0 && form.value.organizations[0].organizationId === form.value.organizationId) {
    form.value.leader = newLeader;
  }
});

// 监听牵头单位的联系人变化
watch(() => form.value.organizations[0]?.contact, (newContact) => {
  if (form.value.organizations.length > 0 && form.value.organizations[0].organizationId === form.value.organizationId) {
    form.value.contact = newContact;
  }
});

// 监听牵头单位变化
watch(() => form.value.organizationId, (newId) => {
  if (newId) {
    fetchLeadOrgUsers(newId);
    // 同步更新参与单位及经费中的牵头单位信息
    if (form.value.organizations.length > 0) {
      form.value.organizations[0].organizationId = newId;
      form.value.organizations[0].leader = form.value.leader;
      form.value.organizations[0].contact = form.value.contact;
      // 清空参与人列表
      form.value.organizations[0].participants = [];
      selectedParticipants.value[0] = "";
    }
  } else {
    leadOrgUsers.value = [];
    form.value.leader = "";
    form.value.contact = "";
    // 清空参与单位及经费中的牵头单位信息
    if (form.value.organizations.length > 0) {
      form.value.organizations[0].organizationId = "";
      form.value.organizations[0].leader = "";
      form.value.organizations[0].contact = "";
      form.value.organizations[0].participants = [];
      selectedParticipants.value[0] = "";
    }
  }
});

// 监听项目负责人变化
watch(() => form.value.leader, (newLeader) => {
  // 同步更新参与单位及经费中的牵头单位负责人
  if (form.value.organizations.length > 0) {
    form.value.organizations[0].leader = newLeader;
  }
});

// 监听联系人变化
watch(() => form.value.contact, (newContact) => {
  // 同步更新参与单位及经费中的牵头单位联系人
  if (form.value.organizations.length > 0) {
    form.value.organizations[0].contact = newContact;
  }
});

// 在 script setup 部分添加
const selectedParticipants = ref({});

// 添加参与人
const addParticipant = (index) => {
  const participant = selectedParticipants.value[index];
  if (participant && !form.value.organizations[index].participants.includes(participant)) {
    form.value.organizations[index].participants.push(participant);
    selectedParticipants.value[index] = ""; // 重置选择
  }
};

// 移除参与人
const removeParticipant = (index, participant) => {
  form.value.organizations[index].participants = form.value.organizations[index].participants.filter(p => p !== participant);
};

// 计算预期成果总和
const totalExpectedOutcomes = computed(() => {
  const orgs = form.value.organizations;
  return {
    software: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.software) || 0), 0)),
    hardware: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.hardware) || 0), 0)),
    papers: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.papers) || 0), 0)),
    patents: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.patents) || 0), 0)),
    copyrights: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.copyrights) || 0), 0)),
    standards: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.standards) || 0), 0)),
    reports: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.reports) || 0), 0)),
    demonstrations: Math.round(orgs.reduce((sum, org) => sum + (parseFloat(org.expectedOutcomes.demonstrations) || 0), 0))
  };
});
</script>
