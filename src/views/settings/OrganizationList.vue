<template>
  <div class="organization-list">
    <div class="header">
      <h2>单位管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增单位
      </el-button>
    </div>

    <el-table :data="organizations" v-loading="loading" border>
      <el-table-column prop="name" label="单位名称" />
      <el-table-column prop="type" label="单位类型" />
      <el-table-column prop="createdAt" label="创建时间">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
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
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="单位名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="单位类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择单位类型">
            <el-option label="学院" value="学院" />
            <el-option label="企业" value="企业" />
            <el-option label="政府部门" value="政府部门" />
            <el-option label="本单位" value="本单位" />
          </el-select>
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
import { formatDate } from "@/utils/date";

const loading = ref(false);
const organizations = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref(null);
const form = ref({
  name: "",
  type: "",
});

const rules = {
  name: [{ required: true, message: "请输入单位名称", trigger: "blur" }],
  type: [{ required: true, message: "请选择单位类型", trigger: "change" }],
};

// 获取单位列表
const fetchOrganizations = async () => {
  try {
    loading.value = true;
    const response = await fetch("http://localhost:3000/api/organizations");
    if (!response.ok) throw new Error("获取单位列表失败");
    organizations.value = await response.json();
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    loading.value = false;
  }
};

// 新增单位
const handleAdd = () => {
  dialogTitle.value = "新增单位";
  form.value = {
    name: "",
    type: "",
  };
  dialogVisible.value = true;
};

// 编辑单位
const handleEdit = (row) => {
  dialogTitle.value = "编辑单位";
  form.value = { ...row };
  dialogVisible.value = true;
};

// 删除单位
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除单位"${row.name}"吗？`,
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    const response = await fetch(
      `http://localhost:3000/api/organizations/${row.id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) throw new Error("删除单位失败");

    ElMessage.success("删除成功");
    fetchOrganizations();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(error.message);
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    const url = form.value.id
      ? `http://localhost:3000/api/organizations/${form.value.id}`
      : "http://localhost:3000/api/organizations";
    const method = form.value.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form.value),
    });

    if (!response.ok) throw new Error("保存单位失败");

    ElMessage.success("保存成功");
    dialogVisible.value = false;
    fetchOrganizations();
  } catch (error) {
    ElMessage.error(error.message);
  }
};

onMounted(() => {
  fetchOrganizations();
});
</script>

<style scoped>
.organization-list {
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