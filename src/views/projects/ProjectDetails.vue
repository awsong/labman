<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <arrow-path-icon class="animate-spin h-10 w-10 text-primary-500" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
    >
      <p class="font-medium">加载项目详情失败</p>
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Project Header -->
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
      >
        <div>
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ project.name }}
            </h1>
            <span
              class="ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              :class="getProjectTypeClass(project.type)"
            >
              {{ project.type }}
            </span>
          </div>
          <p class="mt-1 text-gray-600 dark:text-gray-400">
            <span class="inline-block mr-3"
              >牵头单位: {{ project.organization }}</span
            >
            <span class="inline-block mr-3">负责人: {{ project.leader }}</span>
            <span class="inline-block"
              >起止时间: {{ formatDate(project.startDate) }} ~
              {{ formatDate(project.endDate) }}</span
            >
          </p>
        </div>
        <div class="mt-4 md:mt-0 flex space-x-3">
          <router-link
            :to="`/projects/${id}/edit`"
            class="btn btn-outline flex items-center"
          >
            <pencil-icon class="h-5 w-5 mr-1" />
            编辑项目
          </router-link>
          <router-link
            :to="`/progress?projectId=${id}`"
            class="btn btn-primary flex items-center"
          >
            <chart-bar-icon class="h-5 w-5 mr-1" />
            进度管理
          </router-link>
        </div>
      </div>

      <!-- Project Status Card -->
      <div class="card mb-6">
        <div class="flex items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">
            项目状态
          </h2>
          <span
            class="ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
            :class="getProjectStatusClass(project)"
          >
            {{ getProjectStatus(project) }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              项目开始日期
            </div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formatDate(project.startDate) }}
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              项目结束日期
            </div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ formatDate(project.endDate) }}
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              经费预算
            </div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{
                project.budget ? `¥${formatNumber(project.budget)}` : "未设置"
              }}
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
            <div
              class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
              里程碑完成率
            </div>
            <div class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ calculateMilestoneProgress() }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Project Details Tabs -->
      <div class="card mb-6">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.name"
              @click="currentTab = tab.name"
              :class="[
                currentTab === tab.name
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <div class="pt-4">
          <!-- Overview Tab -->
          <div v-if="currentTab === 'overview'">
            <div class="grid grid-cols-1 gap-6">
              <div>
                <h3
                  class="text-md font-medium text-gray-900 dark:text-white mb-2"
                >
                  研究内容摘要
                </h3>
                <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
                  <p
                    class="text-gray-700 dark:text-gray-300 whitespace-pre-line"
                  >
                    {{ project.summary || "暂无研究内容摘要" }}
                  </p>
                </div>
              </div>

              <div>
                <h3
                  class="text-md font-medium text-gray-900 dark:text-white mb-2"
                >
                  预期成果汇总
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <!-- 软件 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">软件</h4>
                      </div>
                      <span class="text-lg font-semibold text-blue-600 dark:text-blue-400">{{ getTotalOutcome('software') }}</span>
                    </div>
                  </div>

                  <!-- 硬件 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-green-100 dark:bg-green-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">硬件</h4>
                      </div>
                      <span class="text-lg font-semibold text-green-600 dark:text-green-400">{{ getTotalOutcome('hardware') }}</span>
                    </div>
                  </div>

                  <!-- 论文 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">论文</h4>
                      </div>
                      <span class="text-lg font-semibold text-purple-600 dark:text-purple-400">{{ getTotalOutcome('papers') }}</span>
                    </div>
                  </div>

                  <!-- 专利 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-yellow-100 dark:bg-yellow-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582A1 1 0 004 6.32V16a1 1 0 001.029.976l5-1V17a1 1 0 102 0v-1.024l5 1A1 1 0 0018 16V6.32a1.001 1.001 0 00-.046-.343 1 1 0 00-.58-.514L13.42 3.582A1 1 0 0013 3.32V3a1 1 0 00-1-1h-2z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">专利</h4>
                      </div>
                      <span class="text-lg font-semibold text-yellow-600 dark:text-yellow-400">{{ getTotalOutcome('patents') }}</span>
                    </div>
                  </div>

                  <!-- 软件著作权 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-indigo-100 dark:bg-indigo-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-6H7v4h6V7zm2 0h1v4h-1V7zm1-2V4h-1v1h1zm-1 10h1v2h-1v-2zM9 17v-2H7v2h2z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">软件著作权</h4>
                      </div>
                      <span class="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{{ getTotalOutcome('copyrights') }}</span>
                    </div>
                  </div>

                  <!-- 标准 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-red-100 dark:bg-red-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">标准</h4>
                      </div>
                      <span class="text-lg font-semibold text-red-600 dark:text-red-400">{{ getTotalOutcome('standards') }}</span>
                    </div>
                  </div>

                  <!-- 技术报告 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-pink-100 dark:bg-pink-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-600 dark:text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">技术报告</h4>
                      </div>
                      <span class="text-lg font-semibold text-pink-600 dark:text-pink-400">{{ getTotalOutcome('reports') }}</span>
                    </div>
                  </div>

                  <!-- 应用示范证明 -->
                  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <div class="rounded-full p-2 bg-orange-100 dark:bg-orange-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-600 dark:text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <h4 class="ml-3 text-sm font-medium text-gray-900 dark:text-white">应用示范</h4>
                      </div>
                      <span class="text-lg font-semibold text-orange-600 dark:text-orange-400">{{ getTotalOutcome('demonstrations') }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Team Tab -->
          <div v-if="currentTab === 'team'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3
                  class="text-md font-medium text-gray-900 dark:text-white mb-2"
                >
                  成员分工
                </h3>
                <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
                  <p
                    class="text-gray-700 dark:text-gray-300 whitespace-pre-line"
                  >
                    {{ project.teamAllocation || "暂无成员分工信息" }}
                  </p>
                </div>
              </div>

              <div>
                <h3
                  class="text-md font-medium text-gray-900 dark:text-white mb-2"
                >
                  合作单位与合作人员
                </h3>
                <div class="bg-gray-50 p-4 rounded-md dark:bg-gray-700/50">
                  <p
                    class="text-gray-700 dark:text-gray-300 whitespace-pre-line"
                  >
                    {{ project.collaborators || "暂无合作单位与合作人员信息" }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Task Document Tab -->
          <div v-if="currentTab === 'document'">
            <div v-if="project.taskDocument" class="text-center">
              <document-text-icon
                class="h-20 w-20 text-gray-400 mx-auto mb-4"
              />
              <h3
                class="text-lg font-medium text-gray-900 dark:text-white mb-2"
              >
                项目任务书
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                您可以下载或在线查看项目任务书文档
              </p>
              <div class="flex justify-center space-x-4">
                <a
                  :href="getDocumentUrl(project.taskDocument)"
                  target="_blank"
                  class="btn btn-primary"
                >
                  查看任务书
                </a>
                <button 
                  @click="handleUploadClick" 
                  class="btn btn-outline"
                >
                  更新任务书
                </button>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <document-icon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3
                class="text-lg font-medium text-gray-900 dark:text-white mb-2"
              >
                暂无项目任务书
              </h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                您可以直接上传任务书文档或在编辑项目时上传
              </p>
              <div class="flex justify-center space-x-4">
                <button 
                  @click="handleUploadClick" 
                  class="btn btn-primary"
                >
                  上传任务书
                </button>
                <router-link :to="`/projects/${id}/edit`" class="btn btn-outline">
                  编辑项目
                </router-link>
              </div>
            </div>
            <!-- 隐藏的文件输入元素 -->
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
              class="hidden"
            />
          </div>

          <!-- Organizations Tab -->
          <div v-if="currentTab === 'organizations'">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      单位名称
                    </th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      单位类型
                    </th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      负责人
                    </th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      参与人员
                    </th>
                    <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      自筹经费
                    </th>
                    <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      拨款经费
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  <tr v-for="org in getProjectOrganizations()" :key="org.organizationId" :class="{ 'bg-primary-50 dark:bg-primary-900/20': org.isLeader }">
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ getOrgName(org.organizationId) }}
                      <span v-if="org.isLeader" class="ml-2 text-xs text-primary-600 dark:text-primary-400">(牵头单位)</span>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ org.organizationType }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ org.leader }}
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      <div class="flex flex-wrap gap-1">
                        <span v-for="participant in getParticipants(org)" :key="participant" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {{ participant }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {{ formatNumber(org.selfFunding) }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {{ formatNumber(org.allocation) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <td colspan="4" class="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                      总计
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                      {{ formatNumber(getTotalSelfFunding()) }}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                      {{ formatNumber(getTotalAllocation()) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Milestones -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white">
            项目里程碑
          </h2>
          <button
            @click="openAddMilestoneModal"
            class="btn btn-outline flex items-center text-sm"
          >
            <plus-icon class="h-4 w-4 mr-1" />
            添加里程碑
          </button>
        </div>

        <div v-if="milestonesLoading" class="flex justify-center py-6">
          <arrow-path-icon class="animate-spin h-6 w-6 text-primary-500" />
        </div>

        <div
          v-else-if="milestones.length === 0"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center"
        >
          <flag-icon class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">
            暂无里程碑
          </h3>
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            您还没有为此项目添加任何里程碑
          </p>
          <button @click="openAddMilestoneModal" class="btn btn-primary">
            添加里程碑
          </button>
        </div>

        <div
          v-else
          class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    里程碑名称
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    类型
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    到期日期
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    完成度
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    状态
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="milestone in milestones"
                  :key="milestone.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link
                      :to="`/milestones/${milestone.id}`"
                      class="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      {{ milestone.title }}
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
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                  >
                    {{ formatDate(milestone.dueDate) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
                    >
                      <div
                        class="bg-primary-600 h-2.5 rounded-full dark:bg-primary-500"
                        :style="{ width: `${milestone.completion || 0}%` }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ milestone.completion || 0 }}%
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getMilestoneStatusClass(milestone.status)"
                    >
                      {{ milestone.status }}
                    </span>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                  >
                    <div class="flex justify-end space-x-2">
                      <router-link
                        :to="`/milestones/${milestone.id}`"
                        class="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                      >
                        查看
                      </router-link>
                      <button
                        @click="editMilestone(milestone)"
                        class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                      >
                        编辑
                      </button>
                      <button
                        @click="confirmDeleteMilestone(milestone)"
                        class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Milestone Modal -->
    <transition name="fade">
      <div
        v-if="showMilestoneModal"
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          class="absolute inset-0 bg-black opacity-50"
          @click="showMilestoneModal = false"
        ></div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 z-10 shadow-xl"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              {{ editingMilestone?.id ? "编辑里程碑" : "添加新里程碑" }}
            </h3>
            <button
              @click="showMilestoneModal = false"
              class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <x-mark-icon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="saveMilestone">
            <div class="mb-4">
              <label
                for="milestoneTitle"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                里程碑名称 <span class="text-red-500">*</span>
              </label>
              <input
                id="milestoneTitle"
                v-model="milestoneForm.title"
                type="text"
                required
                class="form-input"
                placeholder="请输入里程碑名称"
              />
            </div>

            <div class="mb-4">
              <label
                for="milestoneType"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                类型 <span class="text-red-500">*</span>
              </label>
              <select
                id="milestoneType"
                v-model="milestoneForm.type"
                required
                class="form-input"
              >
                <option value="" disabled>请选择里程碑类型</option>
                <option value="年度评审">年度评审</option>
                <option value="中期评审">中期评审</option>
                <option value="结项评审">结项评审</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div class="mb-4">
              <label
                for="milestoneDueDate"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                到期日期 <span class="text-red-500">*</span>
              </label>
              <input
                id="milestoneDueDate"
                v-model="milestoneForm.dueDate"
                type="date"
                required
                class="form-input"
              />
            </div>

            <div class="mb-4">
              <label
                for="milestoneStatus"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                状态 <span class="text-red-500">*</span>
              </label>
              <select
                id="milestoneStatus"
                v-model="milestoneForm.status"
                required
                class="form-input"
              >
                <option value="" disabled>请选择里程碑状态</option>
                <option value="未开始">未开始</option>
                <option value="进行中">进行中</option>
                <option value="已完成">已完成</option>
                <option value="已延期">已延期</option>
              </select>
            </div>

            <div class="mb-4">
              <label
                for="milestoneCompletion"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                完成度 (%)
              </label>
              <input
                id="milestoneCompletion"
                v-model.number="milestoneForm.completion"
                type="number"
                min="0"
                max="100"
                class="form-input"
                placeholder="请输入完成度百分比"
              />
            </div>

            <div class="mb-4">
              <label
                for="milestoneDescription"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                描述
              </label>
              <textarea
                id="milestoneDescription"
                v-model="milestoneForm.description"
                rows="3"
                class="form-input"
                placeholder="请输入里程碑描述"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                class="btn btn-outline"
                @click="showMilestoneModal = false"
              >
                取消
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="milestoneSaving"
              >
                <arrow-path-icon
                  v-if="milestoneSaving"
                  class="animate-spin h-5 w-5 mr-2"
                />
                {{ editingMilestone?.id ? "保存修改" : "添加里程碑" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Milestone Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showDeleteMilestoneModal"
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 z-10 shadow-xl"
        >
          <div class="flex items-center mb-4 text-red-600 dark:text-red-400">
            <exclamation-triangle-icon class="h-6 w-6 mr-2" />
            <h3 class="text-lg font-medium">确认删除里程碑</h3>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            您确定要删除里程碑
            <span class="font-medium">{{ milestoneToDelete?.title }}</span>
            吗？此操作不可撤销。
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="showDeleteMilestoneModal = false"
              class="btn btn-outline"
            >
              取消
            </button>
            <button
              @click="deleteMilestone"
              class="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              :disabled="deletingMilestone"
            >
              <arrow-path-icon
                v-if="deletingMilestone"
                class="animate-spin h-5 w-5 mr-2"
              />
              确认删除
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowPathIcon,
  PencilIcon,
  ChartBarIcon,
  DocumentTextIcon,
  DocumentIcon,
  PlusIcon,
  FlagIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import { useProjectStore } from "@/store/project";
import { useMilestoneStore } from "@/store/milestone";

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const milestoneStore = useMilestoneStore();

// Get project ID from route params
const id = computed(() => route.params.id);

// State variables
const loading = ref(true);
const error = ref(null);
const milestonesLoading = ref(true);
const milestones = ref([]);
const currentTab = ref("overview");
const showMilestoneModal = ref(false);
const editingMilestone = ref(null);
const milestoneSaving = ref(false);
const showDeleteMilestoneModal = ref(false);
const milestoneToDelete = ref(null);
const deletingMilestone = ref(false);
const fileInput = ref(null);

// Tabs definition
const tabs = [
  { name: "overview", label: "项目概览" },
  { name: "team", label: "团队与合作" },
  { name: "document", label: "项目任务书" },
  { name: "organizations", label: "项目组织" },
];

// Project computed property
const project = computed(() => {
  const currentProject = projectStore.currentProject;
  console.log('Computing project value:', currentProject);
  
  if (!currentProject) {
    console.warn('No current project data available');
    return {};
  }

  // 确保 organizations 是数组
  if (currentProject.organizations) {
    try {
      currentProject.organizations = typeof currentProject.organizations === 'string'
        ? JSON.parse(currentProject.organizations)
        : currentProject.organizations;
        
      if (!Array.isArray(currentProject.organizations)) {
        console.error('Project organizations is not an array:', currentProject.organizations);
        currentProject.organizations = [];
      }
    } catch (error) {
      console.error('Error parsing project organizations:', error);
      currentProject.organizations = [];
    }
  } else {
    currentProject.organizations = [];
  }

  return currentProject;
});

// Milestone form
const milestoneForm = reactive({
  title: "",
  description: "",
  type: "",
  dueDate: "",
  status: "",
  completion: 0,
  notes: "",
  projectId: computed(() => parseInt(id.value)),
});

// Format date to YYYY-MM-DD
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN");
};

// Format number with thousand separators
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Get project status based on dates
const getProjectStatus = (project) => {
  const now = new Date();
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);

  if (now < startDate) {
    return "未开始";
  } else if (now > endDate) {
    return "已完成";
  } else {
    return "进行中";
  }
};

// Get CSS class for project status
const getProjectStatusClass = (project) => {
  const status = getProjectStatus(project);

  switch (status) {
    case "未开始":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    case "进行中":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "已完成":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

// Get CSS class for project type
const getProjectTypeClass = (type) => {
  switch (type) {
    case "国家级项目":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "省部级项目":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "市级项目":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "企业合作项目":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "横向课题":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "院校内部项目":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
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

// Calculate milestone progress
const calculateMilestoneProgress = () => {
  if (milestones.value.length === 0) return 0;

  const totalCompletion = milestones.value.reduce(
    (sum, milestone) => sum + (milestone.completion || 0),
    0
  );
  return Math.round(totalCompletion / milestones.value.length);
};

// Open add milestone modal
const openAddMilestoneModal = () => {
  // Reset form
  Object.assign(milestoneForm, {
    title: "",
    description: "",
    type: "",
    dueDate: "",
    status: "",
    completion: 0,
    notes: "",
  });

  editingMilestone.value = null;
  showMilestoneModal.value = true;
};

// Edit milestone
const editMilestone = (milestone) => {
  // Fill form with milestone data
  Object.assign(milestoneForm, {
    title: milestone.title,
    description: milestone.description || "",
    type: milestone.type,
    dueDate: milestone.dueDate,
    status: milestone.status,
    completion: milestone.completion || 0,
    notes: milestone.notes || "",
  });

  editingMilestone.value = milestone;
  showMilestoneModal.value = true;
};

// Save milestone
const saveMilestone = async () => {
  milestoneSaving.value = true;

  try {
    if (editingMilestone.value) {
      // Update existing milestone
      await milestoneStore.updateMilestone(
        editingMilestone.value.id,
        milestoneForm
      );
    } else {
      // Create new milestone
      await milestoneStore.createMilestone(milestoneForm);
    }

    // Refresh milestones
    await loadMilestones();

    // Close modal
    showMilestoneModal.value = false;
  } catch (error) {
    console.error("Error saving milestone:", error);
  } finally {
    milestoneSaving.value = false;
  }
};

// Confirm delete milestone
const confirmDeleteMilestone = (milestone) => {
  milestoneToDelete.value = milestone;
  showDeleteMilestoneModal.value = true;
};

// Delete milestone
const deleteMilestone = async () => {
  if (!milestoneToDelete.value) return;

  deletingMilestone.value = true;

  try {
    await milestoneStore.deleteMilestone(milestoneToDelete.value.id);

    // Refresh milestones
    await loadMilestones();

    // Close modal
    showDeleteMilestoneModal.value = false;
    milestoneToDelete.value = null;
  } catch (error) {
    console.error("Error deleting milestone:", error);
  } finally {
    deletingMilestone.value = false;
  }
};

// Load milestones for the project
const loadMilestones = async () => {
  milestonesLoading.value = true;

  try {
    const projectMilestones = await milestoneStore.fetchMilestones(id.value);
    milestones.value = projectMilestones;
  } catch (error) {
    console.error("Error loading milestones:", error);
  } finally {
    milestonesLoading.value = false;
  }
};

// Handle upload click
const handleUploadClick = () => {
  // Trigger hidden file input click
  fileInput.value.click();
};

// Handle file change
const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const formData = new FormData();
    formData.append("taskDocument", file);
    
    // Show uploading status
    projectStore.loading = true;
    
    // Upload file
    await projectStore.uploadTaskDocument(id.value, formData);
    
    // Reset file input
    event.target.value = "";
    
    // Success message
    alert("任务书上传成功！");
  } catch (error) {
    console.error("上传任务书失败:", error);
    alert("上传任务书失败: " + (error.message || "未知错误"));
  } finally {
    projectStore.loading = false;
  }
};

// Get document URL
const getDocumentUrl = (url) => {
  if (!url) return '';
  // 将/uploads/开头的路径转换为指向后端服务器的URL
  if (url.startsWith('/uploads/')) {
    return `${import.meta.env.VITE_BASE_URL}${url}`;
  }
};

// Add these functions in the script section before the onMounted
const getOrgName = (orgId) => {
  if (!orgId) {
    console.warn('getOrgName: No organization ID provided');
    return '未知单位';
  }

  // 确保 organizations.value 是有效的
  if (!organizations.value || !Array.isArray(organizations.value)) {
    console.warn('getOrgName: Organizations not properly initialized');
    return '未知单位';
  }

  // 转换为数字进行比较
  const numericOrgId = Number(orgId);
  if (isNaN(numericOrgId)) {
    console.warn('getOrgName: Invalid organization ID:', orgId);
    return '未知单位';
  }

  const org = organizations.value.find(org => Number(org.id) === numericOrgId);
  
  if (!org) {
    console.warn(`getOrgName: Organization not found for ID: ${orgId}`);
    return '未知单位';
  }

  return org.name || '未知单位';
};

const getExpectedOutcome = (org, type) => {
  try {
    let outcomes = org.expectedOutcomes;
    
    // 如果是字符串，尝试解析 JSON
    if (typeof outcomes === 'string') {
      outcomes = JSON.parse(outcomes);
    }
    
    if (typeof outcomes !== 'object' || outcomes === null) {
      console.error('Invalid expectedOutcomes format:', outcomes);
      return 0;
    }
    
    return Number(outcomes[type]) || 0;
  } catch (error) {
    console.error('Error parsing expected outcomes:', error);
    return 0;
  }
};

const getParticipants = (org) => {
  try {
    let participants = org.participants;
    
    // 如果是字符串，尝试解析 JSON
    if (typeof participants === 'string') {
      participants = JSON.parse(participants);
    }
    
    if (!Array.isArray(participants)) {
      console.error('Invalid participants format:', participants);
      return [];
    }
    
    return participants;
  } catch (error) {
    console.error('Error parsing participants:', error);
    return [];
  }
};

const getTotalOutcome = (type) => {
  try {
    const organizations = project.value?.organizations;
    if (!organizations) return 0;
    
    // 如果是字符串，尝试解析 JSON
    let orgs = organizations;
    if (typeof organizations === 'string') {
      orgs = JSON.parse(organizations);
    }
    
    if (!Array.isArray(orgs)) {
      console.error('Invalid organizations format:', orgs);
      return 0;
    }
    
    return orgs.reduce((sum, org) => {
      return sum + getExpectedOutcome(org, type);
    }, 0);
  } catch (error) {
    console.error('Error calculating total outcome:', error);
    return 0;
  }
};

const organizations = ref([]);

const getProjectOrganizations = () => {
  const projectOrgs = project.value?.organizations;
  console.log('Getting project organizations:', projectOrgs);

  if (!projectOrgs) {
    console.warn('No project organizations data');
    return [];
  }

  try {
    // 如果是字符串，尝试解析 JSON
    let orgs = projectOrgs;
    if (typeof projectOrgs === 'string') {
      orgs = JSON.parse(projectOrgs);
    }

    if (!Array.isArray(orgs)) {
      console.error('Invalid organizations format:', orgs);
      return [];
    }

    // 确保每个组织的数据都是有效的
    return orgs.map(org => ({
      ...org,
      organizationId: Number(org.organizationId),
      selfFunding: Number(org.selfFunding) || 0,
      allocation: Number(org.allocation) || 0,
      participants: getParticipants(org),
      expectedOutcomes: parseExpectedOutcomes(org.expectedOutcomes)
    }));
  } catch (error) {
    console.error('Error processing project organizations:', error);
    return [];
  }
};

const parseExpectedOutcomes = (outcomes) => {
  try {
    if (typeof outcomes === 'string') {
      outcomes = JSON.parse(outcomes);
    }
    
    if (typeof outcomes !== 'object' || outcomes === null) {
      console.warn('Invalid expected outcomes format:', outcomes);
      return {
        software: 0,
        hardware: 0,
        papers: 0,
        patents: 0,
        copyrights: 0,
        standards: 0,
        reports: 0,
        demonstrations: 0
      };
    }
    
    return outcomes;
  } catch (error) {
    console.error('Error parsing expected outcomes:', error);
    return {
      software: 0,
      hardware: 0,
      papers: 0,
      patents: 0,
      copyrights: 0,
      standards: 0,
      reports: 0,
      demonstrations: 0
    };
  }
};

const getTotalSelfFunding = () => {
  const orgs = getProjectOrganizations();
  return orgs.reduce((sum, org) => sum + (Number(org.selfFunding) || 0), 0);
};

const getTotalAllocation = () => {
  const orgs = getProjectOrganizations();
  return orgs.reduce((sum, org) => sum + (Number(org.allocation) || 0), 0);
};

// Load project data on component mount
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    // 先获取组织列表
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Loaded organizations:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Organizations data is not an array');
      }
      
      organizations.value = data;
    } catch (err) {
      console.error('Error fetching organizations:', err);
      error.value = "加载组织列表失败：" + (err.message || "未知错误");
      organizations.value = [];
    }

    // 然后加载项目详情
    const projectData = await projectStore.fetchProjectById(id.value);
    console.log('Loaded project data:', projectData);

    if (!projectData) {
      throw new Error("未找到项目");
    }

    // Load milestones
    await loadMilestones();
  } catch (err) {
    error.value = err.message || "加载项目详情失败";
    console.error("Error loading project details:", err);
  } finally {
    loading.value = false;
  }
});

// 添加 watch 以监听组织数据变化
watch(organizations, (newOrgs) => {
  console.log('Organizations updated:', newOrgs);
}, { deep: true });

// 添加 watch 以监听项目数据变化
watch(() => project.value, (newProject) => {
  console.log('Project updated:', newProject);
}, { deep: true });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
