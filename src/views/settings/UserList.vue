<template>
  <div class="user-list">
    <div class="header">
      <h2>人员管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增人员
      </el-button>
    </div>

    <el-table :data="users" v-loading="loading" border>
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="idNumber" label="身份证号" />
      <el-table-column prop="organizationName" label="所属单位" />
      <el-table-column prop="position" label="职务" />
      <el-table-column prop="title" label="职称" />
      <el-table-column prop="education" label="学历" />
      <el-table-column prop="major" label="专业" />
      <el-table-column prop="researchArea" label="研究方向" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input 
            ref="usernameInputRef"
            v-model="form.username" 
            :disabled="!!form.id"
            @blur="checkUsername"
          />
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="form.idNumber" />
        </el-form-item>
        <el-form-item label="所属单位" prop="organizationId">
          <el-select v-model="form.organizationId" placeholder="请选择所属单位">
            <el-option
              v-for="org in organizations"
              :key="org.id"
              :label="org.name"
              :value="org.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职务" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="form.title" placeholder="请选择职称">
            <el-option label="教授" value="教授" />
            <el-option label="副教授" value="副教授" />
            <el-option label="讲师" value="讲师" />
            <el-option label="研究员" value="研究员" />
            <el-option label="高级工程师" value="高级工程师" />
            <el-option label="工程师" value="工程师" />
            <el-option label="技术员" value="技术员" />
          </el-select>
        </el-form-item>
        <el-form-item label="学历" prop="education">
          <el-select v-model="form.education" placeholder="请选择学历">
            <el-option label="博士" value="博士" />
            <el-option label="硕士" value="硕士" />
            <el-option label="学士" value="学士" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="form.major" />
        </el-form-item>
        <el-form-item label="研究方向" prop="researchArea">
          <el-input v-model="form.researchArea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Edit, Delete } from "@element-plus/icons-vue";
import api from "@/utils/api";

const loading = ref(false);
const users = ref([]);
const organizations = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref(null);
const usernameInputRef = ref(null);
const form = ref({
  name: "",
  username: "",
  idNumber: "",
  organizationId: "",
  position: "",
  title: "",
  education: "",
  major: "",
  researchArea: "",
});

const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  idNumber: [{ required: true, message: "请输入身份证号", trigger: "blur" }],
  organizationId: [{ required: true, message: "请选择所属单位", trigger: "change" }],
};

// 获取人员列表
const fetchUsers = async () => {
  try {
    loading.value = true;
    const response = await api.get("/users");
    users.value = response.data;
  } catch (error) {
    console.error("获取人员列表失败:", error);
    ElMessage.error("获取人员列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取单位列表
const fetchOrganizations = async () => {
  try {
    const response = await api.get("/organizations");
    organizations.value = response.data;
  } catch (error) {
    console.error("获取单位列表失败:", error);
    ElMessage.error("获取单位列表失败");
  }
};

// 检查用户名是否重复
const checkUsername = async () => {
  if (!form.value.username) return;
  try {
    const response = await api.get(`/users/check-username?username=${form.value.username}`);
    if (response.data.exists) {
      ElMessage.error("用户名已存在");
      // 使用ref获取输入框元素并设置焦点
      if (usernameInputRef.value) {
        usernameInputRef.value.focus();
      }
    }
  } catch (error) {
    console.error("检查用户名失败:", error);
    ElMessage.error("检查用户名失败");
  }
};

// 新增人员
const handleAdd = () => {
  dialogTitle.value = "新增人员";
  form.value = {
    name: "",
    username: "",
    idNumber: "",
    organizationId: "",
    position: "",
    title: "",
    education: "",
    major: "",
    researchArea: "",
  };
  dialogVisible.value = true;
};

// 编辑人员
const handleEdit = (row) => {
  dialogTitle.value = "编辑人员";
  form.value = { ...row };
  dialogVisible.value = true;
};

// 删除人员
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该人员吗？", "提示", {
      type: "warning",
    });
    await api.delete(`/users/${row.id}`);
    ElMessage.success("删除成功");
    fetchUsers();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除用户失败:", error);
      ElMessage.error("删除用户失败");
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (form.value.id) {
          await api.put(`/users/${form.value.id}`, form.value);
          ElMessage.success("更新成功");
        } else {
          await api.post("/users", form.value);
          ElMessage.success("添加成功");
        }
        dialogVisible.value = false;
        fetchUsers();
      } catch (error) {
        console.error("保存用户失败:", error);
        ElMessage.error("保存用户失败");
      }
    }
  });
};

onMounted(() => {
  fetchUsers();
  fetchOrganizations();
});
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 