<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  type Menu,
  type CreateMenuPayload,
} from "~/api/admin";

// 数据列表
const loading = ref(false);
const tableData = ref<Menu[]>([]);

// 加载数据（直接使用 API 返回的树形数据）
async function loadData() {
  loading.value = true;
  try {
    const res = await getMenus();
    // 接口已返回树形结构，直接使用
    tableData.value = res.items || [];
  } catch (error: any) {
    ElMessage.error(error.message || "加载数据失败");
  } finally {
    loading.value = false;
  }
}

// 编辑弹窗
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const parentOptions = ref<Menu[]>([]);

const form = ref<{
  id?: string;
  name: string;
  path: string;
  parentId: string | null;
  sort: number;
  hidden: boolean;
}>({
  name: "",
  path: "",
  parentId: null,
  sort: 0,
  hidden: false,
});

const rules = {
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  path: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
};

// 扁平化菜单（用于上级菜单下拉选项，保持树形顺序）
function flattenMenu(menus: Menu[]): Menu[] {
  const result: Menu[] = [];

  function collect(nodes: Menu[]) {
    nodes.forEach((menu) => {
      result.push(menu);
      if (menu.children?.length) {
        collect(menu.children);
      }
    });
  }

  collect(menus);
  return result;
}

// 检查 target 是否是 nodeId 的子节点
function isChildOf(menus: Menu[], nodeId: string, targetId: string): boolean {
  const node = findMenuById(menus, nodeId);
  if (!node?.children) return false;
  if (node.children.some((c) => c.id === targetId)) return true;
  return node.children.some((c) => isChildOf([c], c.id, targetId));
}

// 根据 ID 查找菜单
function findMenuById(menus: Menu[], id: string): Menu | undefined {
  for (const menu of menus) {
    if (menu.id === id) return menu;
    if (menu.children?.length) {
      const found = findMenuById(menu.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

// 打开新建弹窗
function openCreateDialog() {
  isEdit.value = false;
  form.value = {
    name: "",
    path: "",
    parentId: null,
    sort: 0,
    hidden: false,
  };
  parentOptions.value = flattenMenu(tableData.value);
  dialogVisible.value = true;
}

// 打开编辑弹窗
function openEditDialog(row: Menu) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    name: row.name,
    path: row.path,
    parentId: row.parentId || null,
    sort: row.sort || 0,
    hidden: row.hidden || false,
  };
  // 排除当前节点及其子节点作为父节点选择
  parentOptions.value = flattenMenu(tableData.value).filter(
    (m) => m.id !== row.id && !isChildOf(tableData.value, row.id, m.id)
  );
  dialogVisible.value = true;
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  dialogLoading.value = true;
  try {
    const payload: CreateMenuPayload = {
      name: form.value.name,
      path: form.value.path,
      parentId: form.value.parentId,
      sort: form.value.sort,
      hidden: form.value.hidden,
    };
    if (isEdit.value && form.value.id) {
      await updateMenu(form.value.id, payload);
      ElMessage.success("更新成功");
    } else {
      await createMenu(payload);
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
async function handleDelete(row: Menu) {
  try {
    await ElMessageBox.confirm(`确认删除菜单 ${row.name}？`, "确认删除", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteMenu(row.id);
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
      <div class="page-title">菜单管理</div>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">新增菜单</el-button>
      </div>
    </div>

    <el-card shadow="never" class="section">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <!-- 菜单名称（树形主列）-->
        <el-table-column prop="name" label="菜单名称" min-width="180">
          <template #default="{ row }">
            <span :class="{ 'is-child': row.parentId }">
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <!-- 路由路径 -->
        <el-table-column prop="path" label="路由路径" min-width="180" />
        <!-- 排序 -->
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <!-- 是否隐藏 -->
        <el-table-column prop="hidden" label="隐藏" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.hidden" type="info" size="small">是</el-tag>
            <el-tag v-else type="success" size="small">否</el-tag>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" width="160">
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
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由路径，如：/system/user" />
        </el-form-item>
        <el-form-item label="上级菜单">
          <el-select
            v-model="form.parentId as string | undefined"
            placeholder="选择上级菜单（不选为根菜单）"
            clearable
            style="width: 100%"
          >
            <el-option label="无（根菜单）" value="" />
            <el-option
              v-for="menu in parentOptions"
              :key="menu.id"
              :label="menu.name"
              :value="menu.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="是否隐藏">
          <el-switch
            v-model="form.hidden"
            active-text="隐藏"
            inactive-text="显示"
            :active-value="true"
            :inactive-value="false"
          />
          <div class="form-tip">隐藏后不在侧边栏显示，但路由仍可访问</div>
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
.is-child {
  color: var(--ep-text-color-secondary);
  font-weight: normal;
}

.text-muted {
  color: var(--ep-text-color-placeholder);
}

.table-actions {
  display: flex;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: var(--ep-text-color-secondary);
  margin-top: 4px;
}
</style>
