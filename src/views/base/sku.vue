<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getSkus,
  createSku,
  updateSku,
  deleteSku,
  type Sku,
  type SkuPayload,
} from "~/api/skus";
import { useStatusConfig } from "~/composables/useStatusConfig";

// 状态配置
const { statusMap, options: statusOptions, getLabel } = useStatusConfig("SKU");

// 数据列表
const loading = ref(false);
const tableData = ref<Sku[]>([]);

// 搜索表单
const searchForm = ref({
  code: "",
  name: "",
  status: null as string | null,
});

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const params: Record<string, any> = {};
    if (searchForm.value.code) {
      params.code = searchForm.value.code;
    }
    if (searchForm.value.name) {
      params.name = searchForm.value.name;
    }
    if (searchForm.value.status) {
      params.status = searchForm.value.status;
    }
    const res = await getSkus(params);
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
    name: "",
    status: null,
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
  code: string;
  name: string;
  unit: string;
  status: string | null;
}>({
  code: "",
  name: "",
  unit: "",
  status: null,
});

const rules = {
  code: [{ required: true, message: "请输入SKU编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  unit: [{ required: true, message: "请输入单位", trigger: "blur" }],
};

// 打开新建弹窗
function openCreateDialog() {
  isEdit.value = false;
  form.value = {
    code: "",
    name: "",
    unit: "",
    status: null,
  };
  dialogVisible.value = true;
}

// 打开编辑弹窗
function openEditDialog(row: Sku) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    code: row.code,
    name: row.name,
    unit: row.unit,
    status: String(row.status),
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
      await updateSku(form.value.id, {
        code: form.value.code,
        name: form.value.name,
        unit: form.value.unit,
        status: form.value.status || undefined,
      });
      ElMessage.success("更新成功");
    } else {
      await createSku({
        code: form.value.code,
        name: form.value.name,
        unit: form.value.unit,
        status: form.value.status || undefined,
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
async function handleDelete(row: Sku) {
  try {
    await ElMessageBox.confirm(`确认删除SKU ${row.code}？`, "确认删除", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteSku(row.id);
    ElMessage.success("删除成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
}

// 获取状态类型
function getStatusType(status?: string) {
  const map: Record<string, any> = {
    ACTIVE: "success",
    INACTIVE: "info",
  };
  return map[status || ""] || "info";
}

onMounted(() => {
  loadData();
  console.log("statusOptions", statusOptions.value);
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">SKU管理</div>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">新增</el-button>
        <el-button>导入</el-button>
        <el-button>导出</el-button>
      </div>
    </div>

    <el-card shadow="never" class="section">
      <el-form inline label-width="72px">
        <el-form-item label="SKU编码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入SKU编码"
            clearable
          />
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            :value-on-clear="null"
            :empty-values="[null, undefined, '']"
            style="width: 180px"
          >
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
      <el-table v-loading="loading" :data="tableData" size="default" border>
        <el-table-column prop="code" label="SKU编码" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="unit" label="单位" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getLabel(row.status) }}
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
      :title="isEdit ? '编辑SKU' : '新增SKU'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="SKU编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入SKU编码" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input
            v-model="form.unit"
            placeholder="请输入单位，如：箱、个、卷"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="form.status"
            style="width: 100%"
            placeholder="请选择状态"
            clearable
            :value-on-clear="null"
          >
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

    <div class="note">SKU 基础信息用于入出库与库存管理。</div>
  </div>
</template>

<style scoped></style>
