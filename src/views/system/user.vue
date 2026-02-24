<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type Role,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "~/api/admin";

// 数据列表
const loading = ref(false);
const tableData = ref<User[]>([]);
const roleList = ref<Role[]>([]);

// 搜索表单
const searchForm = ref({
  username: "",
  roleId: "",
});

// 角色选项（仅启用角色，用于新建和筛选）
const enabledRoleOptions = computed(() =>
  roleList.value
    .filter((role) => role.status === 1)
    .map((role) => ({
      label: role.name,
      value: role.id,
    }))
);

// 角色选项（包含禁用角色，用于编辑时显示已禁用状态）
const allRoleOptions = computed(() =>
  roleList.value.map((role) => ({
    label: role.status === 0 ? `${role.name}（已禁用）` : role.name,
    value: role.id,
    disabled: role.status === 0,
  }))
);

// 检查角色是否被禁用
function isRoleDisabled(roleId: string): boolean {
  const role = roleList.value.find((r) => r.id === roleId);
  return role?.status === 0;
}

// 获取角色名称
function getRoleName(roleId: string): string {
  const role = roleList.value.find((r) => r.id === roleId);
  return role?.name || roleId;
}

// 获取角色状态
function getRoleStatus(roleId: string): number {
  const role = roleList.value.find((r) => r.id === roleId);
  return role?.status ?? 1;
}

// 获取角色标签类型
function getRoleTagType(
  roleId: string,
): "success" | "warning" | "danger" | "info" | "primary" {
  const status = getRoleStatus(roleId);
  if (status === 0) return "info"; // 禁用 - 灰色
  const role = roleList.value.find((r) => r.id === roleId);
  if (role?.code === "admin") return "danger";
  if (role?.code === "warehouse") return "primary";
  return "success";
}

// 加载角色列表（全部角色，用于显示状态）
async function loadRoleList() {
  try {
    const res = await getRoles();
    roleList.value = res.items || [];
  } catch (error: any) {
    ElMessage.error(error.message || "加载角色失败");
  }
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const res = await getUsers();
    tableData.value = res.items || [];
  } catch (error: any) {
    ElMessage.error(error.message || "加载数据失败");
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  loadData();
}

// 重置
function handleReset() {
  searchForm.value = {
    username: "",
    roleId: "",
  };
  loadData();
}

// 编辑弹窗
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const form = ref<{
  id?: string;
  username: string;
  password?: string;
  roleId: string;
}>({
  username: "",
  password: "",
  roleId: "",
});

const rules = computed(() => ({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    {
      validator: (_: unknown, value: string, callback: (err?: Error) => void) => {
        if (isEdit.value && !value) {
          callback();
          return;
        }
        if (!value) {
          callback(new Error("请输入密码"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
  roleId: [{ required: true, message: "请选择角色", trigger: "change" }],
}));

// 打开新建弹窗
function openCreateDialog() {
  isEdit.value = false;
  form.value = {
    username: "",
    password: "",
    roleId: "",
  };
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
}

// 打开编辑弹窗
function openEditDialog(row: User) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    username: row.username,
    roleId: String(row.role_id ?? ""),
  };
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  // 检查是否选择了禁用角色
  if (isRoleDisabled(form.value.roleId)) {
    ElMessage.error("不能绑定已禁用的角色，请更换为启用状态的角色");
    return;
  }

  dialogLoading.value = true;
  try {
    if (isEdit.value && form.value.id) {
      const payload: UpdateUserPayload = {
        username: form.value.username,
        roleId: form.value.roleId,
      };
      if (form.value.password) {
        payload.password = form.value.password;
      }
      await updateUser(form.value.id, payload);
      ElMessage.success("更新成功");
    } else {
      const payload: CreateUserPayload = {
        username: form.value.username,
        password: form.value.password || "",
        roleId: form.value.roleId,
      };
      await createUser(payload);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || (isEdit.value ? "更新失败" : "创建失败"));
  } finally {
    dialogLoading.value = false;
  }
}

// 删除
async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username}？`, "确认删除", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteUser(row.id);
    ElMessage.success("删除成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
}

onMounted(async () => {
  await Promise.all([loadRoleList(), loadData()]);
});

watch(dialogVisible, (visible) => {
  if (!visible) {
    formRef.value?.clearValidate();
  }
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">用户管理</div>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
      </div>
    </div>

    <el-card shadow="never" class="section">
      <el-form inline label-width="72px">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.roleId"
            placeholder="选择角色"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="role in enabledRoleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="section">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="username" label="用户名" />
        <el-table-column label="角色">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role_id)" size="small">
              {{ getRoleName(row.role_id) }}
              {{ getRoleStatus(row.role_id) === 0 ? "（已禁用）" : "" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="openEditDialog(row)"
                >编辑</el-button
              >
              <el-button link type="danger" @click="handleDelete(row)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        :validate-on-rule-change="false"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item
          :label="isEdit ? '新密码' : '密码'"
          prop="password"
          v-if="!isEdit || form.password !== undefined"
        >
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
          <small v-if="isEdit" class="form-tip">留空表示不修改密码</small>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select
            v-model="form.roleId"
            placeholder="选择角色"
            :validate-event="false"
            style="width: 100%"
          >
            <el-option
              v-for="role in allRoleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
              :disabled="role.disabled"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="submitForm">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.form-tip {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}
</style>
