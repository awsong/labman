<template>
  <div class="milestone-details">
    <el-page-header @back="goBack" :title="milestone?.title || '里程碑详情'">
      <template #content>
        <div class="flex items-center">
          <el-tag :type="getStatusType(milestone?.status)">{{ milestone?.status }}</el-tag>
          <span class="ml-2">完成度: {{ milestone?.completion }}%</span>
        </div>
      </template>
      <template #extra>
        <el-button type="primary" @click="openTaskDialog()">添加任务</el-button>
      </template>
    </el-page-header>

    <div class="mt-4">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="描述">{{ milestone?.description }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ formatDate(milestone?.dueDate) }}</el-descriptions-item>
        <el-descriptions-item label="权重">{{ milestone?.weight }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ milestone?.notes }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 任务列表 -->
    <div class="mt-4">
      <el-card>
        <template #header>
          <div class="flex justify-between items-center">
            <span>任务列表</span>
          </div>
        </template>

        <el-table :data="tasks" style="width: 100%">
          <el-table-column prop="name" label="任务名称" min-width="180" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="status" label="状态" width="120" />
          <el-table-column label="时间范围" min-width="200">
            <template #default="{ row }">
              {{ formatDate(row.startDate) }} 至 {{ formatDate(row.endDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="assignee" label="负责人" min-width="120" />
          <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip />
          <el-table-column label="文档数" width="100">
            <template #default="{ row }">
              {{ row.documents?.length || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openTaskDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="deleteTask(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 任务表单对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="editingTask ? '编辑任务' : '添加任务'"
      width="800px"
    >
      <el-form ref="taskFormRef" :model="taskForm" :rules="taskRules" label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select v-model="taskForm.type" placeholder="请选择任务类型" style="width: 100%">
            <el-option label="软件" value="软件" />
            <el-option label="硬件" value="硬件" />
            <el-option label="论文" value="论文" />
            <el-option label="专利" value="专利" />
            <el-option label="软件著作权" value="软件著作权" />
            <el-option label="标准" value="标准" />
            <el-option label="技术报告" value="技术报告" />
            <el-option label="应用规范" value="应用规范" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-input 
            v-model="taskForm.status" 
            placeholder="请输入任务状态" 
            maxlength="20" 
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="taskForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="taskForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="assignee">
          <el-select v-model="taskForm.assignee" placeholder="选择负责人" style="width: 100%">
            <el-option
              v-for="participant in participants"
              :key="participant.name"
              :label="participant.name"
              :value="participant.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="taskForm.notes"
            type="textarea"
            rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
        
        <!-- 文档管理部分 -->
        <el-form-item label="相关文档">
          <div class="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <!-- 已上传文档列表 -->
            <div v-if="taskForm.documents && taskForm.documents.length > 0" class="mb-4">
              <div v-for="(doc, index) in taskForm.documents" :key="index" 
                   class="flex items-center justify-between p-2 mb-2 bg-white dark:bg-gray-700 rounded">
                <div class="flex items-center flex-1 min-w-0">
                  <el-input 
                    v-model="doc.displayName" 
                    class="mr-2"
                    placeholder="文件名"
                    @change="updateDocumentName(index, doc.displayName)"
                  />
                  <span class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {{ formatFileSize(doc.size) }}
                  </span>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                  <el-button type="primary" link @click="downloadDocument(doc)">
                    下载
                  </el-button>
                  <el-button type="danger" link @click="removeDocument(index)">
                    删除
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 上传按钮 -->
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              multiple
              name="document"
            >
              <el-button type="primary">
                <i class="el-icon-upload"></i> 上传文档
              </el-button>
              <template #tip>
                <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  支持多个文件上传，单个文件不超过10MB
                </div>
              </template>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="taskDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTaskForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/format'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const milestone = ref(null)
const tasks = ref([])
const participants = ref([])
const taskDialogVisible = ref(false)
const editingTask = ref(null)
const taskFormRef = ref(null)

const taskForm = ref({
  name: '',
  startDate: '',
  endDate: '',
  assignee: '',
  type: '',
  status: '',
  notes: '',
  documents: []
})

const taskRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  assignee: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  status: [{ required: true, message: '请输入任务状态', trigger: 'blur' }]
}

// 获取里程碑信息
const fetchMilestone = async () => {
  try {
    const response = await api.get(`/milestones/${route.params.id}`)
    milestone.value = response.data
    // 获取项目参与人
    const projectResponse = await api.get(`/projects/${milestone.value.projectId}/participants`)
    participants.value = projectResponse.data
    // 获取任务列表
    await fetchTasks()
  } catch (error) {
    ElMessage.error('获取里程碑信息失败')
    console.error(error)
  }
}

// 获取任务列表
const fetchTasks = async () => {
  try {
    const response = await api.get(`/milestones/${route.params.id}/tasks`)
    tasks.value = response.data
  } catch (error) {
    ElMessage.error('获取任务列表失败')
    console.error(error)
  }
}

// 打开任务表单对话框
const openTaskDialog = (task = null) => {
  editingTask.value = task
  if (task) {
    taskForm.value = { 
      ...task,
      documents: task.documents || []
    }
  } else {
    taskForm.value = {
      name: '',
      startDate: '',
      endDate: '',
      assignee: '',
      type: '',
      status: '',
      notes: '',
      documents: []
    }
  }
  taskDialogVisible.value = true
}

// 上传文档相关
const uploadUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const apiPrefix = baseUrl || '/api'
  return editingTask.value 
    ? `${apiPrefix}/tasks/${editingTask.value.id}/documents`
    : `${apiPrefix}/tasks/temp-documents`
})

const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

const beforeUpload = (file) => {
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response, file) => {
  if (response.error) {
    ElMessage.error(`文档上传失败: ${response.error}`)
    return
  }
  
  const newDoc = {
    id: response.documentId,
    path: response.path,
    displayName: file.name,
    originalName: file.name,
    size: file.size,
    uploadTime: new Date().toISOString()
  }
  
  taskForm.value.documents = [...(taskForm.value.documents || []), newDoc]
  ElMessage.success('文档上传成功')
}

const handleUploadError = (error) => {
  console.error('文档上传错误:', error)
  ElMessage.error(`文档上传失败: ${error.message || '请检查文件大小和格式'}`)
}

const updateDocumentName = async (index, newName) => {
  try {
    if (taskForm.value.documents[index]) {
      const doc = taskForm.value.documents[index];
      if (doc.id && editingTask.value) {
        const response = await api.put(`/tasks/${editingTask.value.id}/documents/${doc.id}`, {
          displayName: newName
        });
        // Update the document with the properly encoded response
        taskForm.value.documents[index] = {
          ...doc,
          displayName: response.displayName,
          originalName: response.originalName
        };
        ElMessage.success('文档名称更新成功');
      }
    }
  } catch (error) {
    console.error('更新文档名称失败:', error);
    ElMessage.error('更新文档名称失败');
  }
}

const removeDocument = async (index) => {
  try {
    const doc = taskForm.value.documents[index]
    if (doc.id && editingTask.value) {
      await api.delete(`/tasks/${editingTask.value.id}/documents/${doc.id}`)
    }
    taskForm.value.documents.splice(index, 1)
    ElMessage.success('文档删除成功')
  } catch (error) {
    console.error('删除文档失败:', error)
    ElMessage.error('删除文档失败')
  }
}

const downloadDocument = async (doc) => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_API_BASE_URL || ''}${doc.path}`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', doc.displayName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error('下载文件失败')
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 提交任务表单
const submitTaskForm = async () => {
  if (!taskFormRef.value) return
  
  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = {
          ...taskForm.value,
          milestoneId: route.params.id
        }
        
        if (editingTask.value) {
          await api.put(`/tasks/${editingTask.value.id}`, data)
          ElMessage.success('任务更新成功')
        } else {
          const response = await api.post('/tasks', data)
          // 如果有临时文档，将它们关联到新创建的任务
          if (taskForm.value.documents.length > 0) {
            await api.post(`/tasks/${response.data.id}/associate-documents`, {
              documentIds: taskForm.value.documents.map(doc => doc.id)
            })
          }
          ElMessage.success('任务创建成功')
        }
        
        taskDialogVisible.value = false
        await fetchTasks()
      } catch (error) {
        ElMessage.error(editingTask.value ? '更新任务失败' : '创建任务失败')
        console.error(error)
      }
    }
  })
}

// 删除任务
const deleteTask = async (task) => {
  try {
    await ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
      type: 'warning'
    })
    
    await api.delete(`/tasks/${task.id}`)
    ElMessage.success('任务删除成功')
    await fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除任务失败')
      console.error(error)
    }
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    '未开始': 'info',
    '进行中': 'warning',
    '已完成': 'success',
    '已延期': 'danger'
  }
  return statusMap[status] || 'info'
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchMilestone()
})
</script>

<style scoped>
.milestone-details {
  padding: 20px;
}

.upload-demo {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  background-color: #ffffff;
  transition: all 0.3s;
}

.dark .upload-demo {
  border-color: #4a5568;
  background-color: #2d3748;
}

.upload-demo:hover {
  border-color: #409eff;
}
</style>
