<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  getRoles,
  getRoleDetail,
  getRoleMenus,
  createRole,
  updateRole,
  deleteRole,
  getMenus,
  type Role,
  type Menu,
} from "~/api/admin";

// 加载状态
const loading = ref(false);
const menuLoading = ref(false);
const dialogLoading = ref(false);

// 角色列表
const roleList = ref<Role[]>([]);

// 菜单树
const menuTreeAll = ref<Menu[]>([]);
const menuTreeTop = ref<Menu[]>([]);
const menuTreeRef = ref<any>(null);
const menuDescendants = new Map<string, Set<string>>();

// 弹窗
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();

const form = ref({
  id: "",
  code: "",
  name: "",
  description: "",
  status: 1,
});

const rules = {
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
};

// 获取菜单树数据
async function loadMenus() {
  menuLoading.value = true;
  try {
    const res = await getMenus();
    const tree = buildMenuTree(res.items || []);
    menuTreeAll.value = tree;
    menuTreeTop.value = tree.map((node) => ({ ...node, children: [] }));
    menuDescendants.clear();
    for (const root of tree) {
      const set = new Set<string>();
      collectDescendants(root, set);
      menuDescendants.set(root.id, set);
    }
  } catch (error: any) {
    ElMessage.error(error.message || "加载菜单失败");
  } finally {
    menuLoading.value = false;
  }
}

// 构建菜单树
function buildMenuTree(menus: Menu[]): Menu[] {
  const map = new Map<string, Menu>();
  const roots: Menu[] = [];

  menus.forEach((menu) => {
    const id = String(menu.id);
    const parentId =
      menu.parentId === null || menu.parentId === undefined
        ? null
        : String(menu.parentId);
    map.set(id, { ...menu, id, parentId, children: [] });
  });

  menus.forEach((menu) => {
    const id = String(menu.id);
    const parentId =
      menu.parentId === null || menu.parentId === undefined
        ? null
        : String(menu.parentId);
    const node = map.get(id);
    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId);
      parent?.children?.push(node!);
    } else {
      roots.push(node!);
    }
  });

  return roots;
}

function collectDescendants(node: Menu, set: Set<string>) {
  set.add(node.id);
  if (node.children?.length) {
    for (const child of node.children) {
      collectDescendants(child, set);
    }
  }
}

function getRootIdsByMenuIds(menuIds: string[]): string[] {
  if (!menuIds.length) return [];
  const menuIdSet = new Set(menuIds);
  const rootIds: string[] = [];
  for (const [rootId, descendants] of menuDescendants.entries()) {
    for (const id of descendants) {
      if (menuIdSet.has(id)) {
        rootIds.push(rootId);
        break;
      }
    }
  }
  return rootIds;
}

function expandRootIds(rootIds: string[]): string[] {
  const expanded = new Set<string>();
  for (const rootId of rootIds) {
    const descendants = menuDescendants.get(rootId);
    if (descendants) {
      for (const id of descendants) expanded.add(id);
    } else {
      expanded.add(rootId);
    }
  }
  return Array.from(expanded);
}

// 加载角色列表
async function loadRoles() {
  loading.value = true;
  try {
    const res = await getRoles();
    roleList.value = res.items || [];
  } catch (error: any) {
    ElMessage.error(error.message || "加载角色失败");
  } finally {
    loading.value = false;
  }
}

// 打开新增弹窗
async function openCreateDialog() {
  isEdit.value = false;
  form.value = {
    id: "",
    code: "",
    name: "",
    description: "",
    status: 1,
  };
  dialogVisible.value = true;
  if (!menuTreeAll.value.length) {
    await loadMenus();
  }
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys([]);
  });
}

// 打开编辑弹窗
async function openEditDialog(row: Role) {
  isEdit.value = true;
  form.value = {
    id: row.id,
    code: row.code || "",
    name: row.name,
    description: row.description || "",
    status: row.status,
  };
  dialogVisible.value = true;
  menuLoading.value = true;
  try {
    // 1. 确保菜单树已加载
    if (!menuTreeAll.value.length) {
      await loadMenus();
    }

    // 2. 获取 menuIds（优先用角色详情接口，兜底用角色菜单接口）
    let menuIds: string[] = [];
    const detailRes = await getRoleDetail(row.id);
    menuIds = (detailRes.item?.menuIds || []).map(String);

    // 兜底：如果 menuIds 为空，调用专用接口
    if (!menuIds.length) {
      const menusRes = await getRoleMenus(row.id);
      menuIds = (menusRes.items || []).map(String);
    }

    // 3. 将 menuIds 映射为一级菜单勾选
    const rootIds = getRootIdsByMenuIds(menuIds);

    // 4. 弹窗打开后回显勾选状态
    nextTick(() => {
      menuTreeRef.value?.setCheckedKeys(rootIds);
    });
  } catch (error: any) {
    ElMessage.error(error.message || "加载角色权限失败");
  } finally {
    menuLoading.value = false;
  }
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  dialogLoading.value = true;
  try {
    const checkedRootIds = menuTreeRef.value?.getCheckedKeys() || [];
    const menuIds = expandRootIds(checkedRootIds);
    if (isEdit.value) {
      await updateRole(form.value.id, {
        code: form.value.code,
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
        menuIds,
      });
      ElMessage.success("更新成功");
    } else {
      await createRole({
        code: form.value.code,
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
        menuIds,
      });
      ElMessage.success("创建成功");
    }
    dialogVisible.value = false;
    loadRoles();
  } catch (error: any) {
    ElMessage.error(error.message || (isEdit.value ? "更新失败" : "创建失败"));
  } finally {
    dialogLoading.value = false;
  }
}

// 删除角色
async function handleDelete(row: Role) {
  try {
    await ElMessageBox.confirm(`确认删除角色 ${row.name}？`, "确认删除", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteRole(row.id);
    ElMessage.success("删除成功");
    loadRoles();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "删除失败");
    }
  }
}

// 切换状态
async function toggleStatus(row: Role) {
  const newStatus = row.status === 1 ? 0 : 1;
  const actionText = newStatus === 1 ? "启用" : "禁用";
  try {
    await updateRole(row.id, { status: newStatus });
    row.status = newStatus;
    ElMessage.success(`${actionText}成功`);
  } catch (error: any) {
    ElMessage.error(error.message || `${actionText}失败`);
  }
}

// 树节点显示
function treeNodeLabel(data: any): string {
  return data.name;
}

onMounted(() => {
  loadRoles();
  loadMenus();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">角色管理</div>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">新增角色</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="section">
      <!-- 左侧：角色列表 -->
      <el-col :xs="24" :lg="24">
        <el-card shadow="never" v-loading="loading">
          <el-table
            :data="roleList"
            border
            highlight-current-row
            style="width: 100%"
          >
            <el-table-column prop="name" label="角色名称" min-width="120" />
            <el-table-column prop="code" label="角色编码" min-width="120" />
            <el-table-column label="状态" width="80">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 1 ? 'success' : 'info'"
                  size="small"
                >
                  {{ row.status === 1 ? "启用" : "禁用" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" width="160">
              <template #default="{ row }">
                {{
                  row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "-"
                }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <div class="table-actions">
                  <el-button link type="primary" @click="openEditDialog(row)"
                    >编辑</el-button
                  >
                  <el-button
                    link
                    :type="row.status === 1 ? 'info' : 'success'"
                    @click="toggleStatus(row)"
                  >
                    {{ row.status === 1 ? "禁用" : "启用" }}
                  </el-button>
                  <el-button link type="danger" @click="handleDelete(row)"
                    >删除</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入角色编码"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <div class="menu-tree-wrapper">
            <div class="menu-tip">只选择一级菜单，保存时会自动包含子菜单。</div>
            <el-tree
              ref="menuTreeRef"
              v-loading="menuLoading"
              :data="menuTreeTop"
              show-checkbox
              node-key="id"
              :props="{ label: treeNodeLabel, children: 'children' }"
            />
          </div>
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
.page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
}

.section {
  margin-bottom: 16px;
}

.menu-tree-wrapper {
  max-height: 500px;
  overflow-y: auto;
}

.menu-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.table-actions {
  display: flex;
  gap: 8px;
}
</style>
