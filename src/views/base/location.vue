<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  type Location,
  type LocationPayload,
} from "~/api/locations";
import { useStatusConfig } from "~/composables/useStatusConfig";

// 状态配置
const { statusMap, options: statusOptions, getLabel } = useStatusConfig("LOCATION");

// 数据列表
const loading = ref(false);
const tableData = ref<Location[]>([]);

// 搜索表单
const searchForm = ref({
  code: "",
  status: null as string | null,
});

// 获取状态类型
function getStatusType(status?: string) {
  const map: Record<string, any> = {
    empty: "success",
    occupied: "primary",
    locked: "warning",
    disabled: "info",
    0: "success",
    1: "primary",
    2: "warning",
    3: "info",
  };
  return map[status || ""] || "info";
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const params: { code?: string; status?: string } = {};
    if (searchForm.value.code) {
      params.code = searchForm.value.code;
    }
    if (searchForm.value.status) {
      params.status = searchForm.value.status;
    }
    const res = await getLocations(params);
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
    code: "",
    status: null,
  };
  loadData();
}

// 编辑弹窗
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();
const form = ref<LocationPayload & { id?: string }>({
  code: "",
  name: "",
  status: "empty",
});

const rules = {
  code: [{ required: true, message: "请输入库位编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
};

// 打开新建弹窗
function openCreateDialog() {
  isEdit.value = false;
  form.value = {
    code: "",
    name: "",
    status: "",
  };
  dialogVisible.value = true;
}

// 打开编辑弹窗
function openEditDialog(row: Location) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status,
  };
  dialogVisible.value = true;
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  dialogLoading.value = true;
  try {
    if (isEdit.value && form.value.id) {
      await updateLocation(form.value.id, {
        code: form.value.code,
        name: form.value.name,
        status: form.value.status,
      });
      ElMessage.success("更新成功");
    } else {
      await createLocation({
        code: form.value.code,
        name: form.value.name,
        status: form.value.status,
      });
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
async function handleDelete(row: Location) {
  try {
    await ElMessageBox.confirm(`确认删除库位 ${row.code}？`, "确认删除", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteLocation(row.id);
    ElMessage.success("删除成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">库位管理</div>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">新增</el-button>
        <el-button>批量导入</el-button>
      </div>
    </div>

    <el-card shadow="never" class="section">
      <el-form inline label-width="72px">
        <el-form-item label="库位编码">
          <el-input v-model="searchForm.code" placeholder="请输入库位编码" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable :value-on-clear="null" style="width: 180px">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
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
        <el-table-column prop="code" label="库位编码" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getLabel(row.status || "") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑库位' : '新增库位'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="库位编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入库位编码，如：A-01-01" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="选择状态">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
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

    <div class="note">状态说明：空闲 / 占用 / 锁定 / 禁用。</div>
  </div>
</template>

<style scoped>
</style>
