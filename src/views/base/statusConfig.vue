<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getStatusConfigs,
  getBizTypes,
  createStatusConfig,
  updateStatusConfig,
  deleteStatusConfig,
  type StatusConfig,
  type StatusConfigPayload,
} from "~/api/statusConfig";
import { useStatusConfigManager } from "~/composables/useStatusConfig";

const {
  loading,
  tableData,
  bizTypes,
  total,
  page,
  pageSize,
  searchForm,
  loadBizTypes,
  loadData,
  handlePageChange,
  handlePageSizeChange,
  handleSearch,
  handleReset,
  refresh,
} = useStatusConfigManager();

// 使用 computed 确保 bizTypes 响应式正确工作
const bizTypeOptions = computed(() => bizTypes.value || []);

// 加载数据
onMounted(async () => {
  await loadBizTypes();
  loadData();
});

// 新增/编辑弹窗
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref();

const form = ref<
  StatusConfigPayload & {
    id?: number;
  }
>({
  bizType: "",
  code: 0,
  label: "",
  sort: 0,
  isDefault: false,
  isEnabled: true,
  remark: "",
});

const rules = {
  bizType: [{ required: true, message: "请选择业务类型", trigger: "change" }],
  code: [{ required: true, message: "请输入状态码", trigger: "blur" }],
  label: [{ required: true, message: "请输入状态标签", trigger: "blur" }],
};

// 打开新增弹窗
function openCreateDialog() {
  isEdit.value = false;
  form.value = {
    bizType: "",
    code: 0,
    label: "",
    sort: 0,
    isDefault: false,
    isEnabled: true,
    remark: "",
  };
  dialogVisible.value = true;
}

// 打开编辑弹窗
function openEditDialog(row: StatusConfig) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    bizType: row.bizType,
    code: row.code,
    label: row.label,
    sort: row.sort,
    isDefault: !!row.isDefault,
    isEnabled: !!row.isEnabled,
    remark: row.remark,
  };
  dialogVisible.value = true;
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  dialogLoading.value = true;
  try {
    const payload: StatusConfigPayload = {
      bizType: form.value.bizType,
      code: form.value.code,
      label: form.value.label,
      sort: form.value.sort,
      isDefault: form.value.isDefault,
      isEnabled: form.value.isEnabled,
      remark: form.value.remark,
    };

    if (isEdit.value && form.value.id) {
      await updateStatusConfig(form.value.id, payload);
      ElMessage.success("更新成功");
    } else {
      await createStatusConfig(payload);
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    refresh();
  } catch (error: any) {
    ElMessage.error(error.message || (isEdit.value ? "更新失败" : "创建失败"));
  } finally {
    dialogLoading.value = false;
  }
}

// 删除
async function handleDelete(row: StatusConfig) {
  try {
    await ElMessageBox.confirm(
      `确认删除状态配置 "${row.label}"（${row.bizType}-${row.code}）？`,
      "确认删除",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await deleteStatusConfig(row.id);
    ElMessage.success("删除成功");
    refresh();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
}

// 获取状态开关类型
function getEnabledType(enabled: number) {
  return enabled ? "success" : "info";
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">状态配置</div>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">新增配置</el-button>
      </div>
    </div>

    <el-card shadow="never" class="section">
      <el-form inline label-width="72px">
        <el-form-item label="业务类型">
          <el-select
            v-model="searchForm.bizType"
            placeholder="选择业务类型"
            clearable
            filterable
          >
            <el-option
              v-for="bt in bizTypeOptions"
              :key="bt"
              :label="bt"
              :value="bt"
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
        <el-table-column prop="bizType" label="业务类型" width="140" />
        <el-table-column prop="code" label="状态码" width="100" />
        <el-table-column prop="label" label="状态标签" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="默认" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="success" size="small">是</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="启用" width="80">
          <template #default="{ row }">
            <el-switch
              :model-value="row.isEnabled === 1"
              disabled
              :active-color="getEnabledType(row.isEnabled) === 'success' ? '#67C23A' : '#909399'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑状态配置' : '新增状态配置'"
      width="600px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
      class="status-config-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="dialog-form">
        <el-form-item label="业务类型" prop="bizType">
          <el-select v-model="form.bizType" placeholder="选择业务类型" style="width: 100%">
            <el-option
              v-for="bt in bizTypeOptions"
              :key="bt"
              :label="bt"
              :value="bt"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="状态码" prop="code">
              <el-input-number v-model="form.code" :min="0" :precision="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态标签" prop="label">
              <el-input v-model="form.label" placeholder="如: 待处理" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="默认状态">
              <el-switch v-model="form.isDefault" />
              <span class="form-tip">设为默认后，新增数据自动使用此状态</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-switch v-model="form.isEnabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
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
  margin-left: 8px;
  font-size: 12px;
  color: var(--ep-text-color-secondary);
  white-space: nowrap;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 弹窗样式 */
:deep(.status-config-dialog .ep-dialog__body) {
  max-height: calc(80vh - 120px);
  overflow-y: auto;
  padding: 20px;
}

.dialog-form {
  padding-right: 8px;
}
</style>
