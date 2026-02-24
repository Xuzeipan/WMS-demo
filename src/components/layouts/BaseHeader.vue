<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import {
  ArrowDown,
  Bell,
  Box,
  Moon,
  Sunny,
  SwitchButton,
  UserFilled,
} from "@element-plus/icons-vue";
import { toggleDark, isDark } from "~/composables";
import { getParentRoutes } from "~/router/helper";
import routerInstance from "~/router/index";
import { useUserStore } from "~/stores/user";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getUnread,
  markRead,
  markAllRead,
  type NotificationItem,
} from "~/api/notifications";

const routes = routerInstance.getRoutes();
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();

// 面包屑数据
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title);
  const parents = getParentRoutes(routes as any, route.path);
  return [...parents, ...matched].filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.path === item.path) &&
      !item.meta?.hidden,
  );
});

// 从 Pinia store 获取用户信息
const userInfo = computed(() => {
  return {
    username: userStore.user?.username || "管理员",
    avatar: userStore.user?.avatar || "",
    role: userStore.user?.roleName || "未分配角色",
  };
});

// 通知相关状态
const unreadCount = ref(0);
const notificationList = ref<NotificationItem[]>([]);
const notificationLoading = ref(false);

// 跳转映射规则
function getNotificationPath(item: NotificationItem): string | null {
  if (!item.relatedType) return null;

  // 需要 relatedId 的类型
  const needIdTypes = ["inbound_order", "outbound_order"];
  if (needIdTypes.includes(item.relatedType) && !item.relatedId) {
    return null;
  }

  const pathMap: Record<string, string> = {
    inbound_order: `/inbound/receive/${item.relatedId}`,
    outbound_order: `/outbound/pick/${item.relatedId}`,
    location: `/base/location`,
    sku: `/base/sku`,
    system: `/inventory/list`,
    inventory: `/inventory/list`,
  };
  return pathMap[item.relatedType] || null;
}

// 加载未读通知
async function loadUnreadNotifications() {
  notificationLoading.value = true;
  try {
    const res = await getUnread(5);
    notificationList.value = res.items || [];
    unreadCount.value = res.unreadCount || 0;
  } catch (error: any) {
    ElMessage.error(error.message || "加载通知失败");
  } finally {
    notificationLoading.value = false;
  }
}

// 格式化相对时间
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString("zh-CN");
}

// 获取通知标签类型
function getLevelType(
  level: string,
): "success" | "warning" | "danger" | "info" {
  const map: Record<string, "success" | "warning" | "danger" | "info"> = {
    success: "success",
    warning: "warning",
    error: "danger",
    info: "info",
  };
  return map[level] || "info";
}

// 点击通知项：标记已读并跳转
async function handleNotificationClick(item: NotificationItem) {
  // 标记已读
  if (!item.read) {
    try {
      await markRead(item.id);
      item.read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error: any) {
      ElMessage.error(error.message || "标记已读失败");
    }
  }
  // 跳转详情页
  const path = getNotificationPath(item);
  if (path) {
    router.push(path);
  }
}

// 全部已读
async function handleMarkAllRead() {
  try {
    await markAllRead();
    unreadCount.value = 0;
    notificationList.value = notificationList.value.map((item) => ({
      ...item,
      read: true,
    }));
    ElMessage.success("全部已读");
  } catch (error: any) {
    ElMessage.error(error.message || "操作失败");
  }
}

// 处理下拉菜单命令
function handleCommand(command: string) {
  switch (command) {
    case "logout":
      handleLogout();
      break;
  }
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm("确定要退出登录吗？", "退出确认", {
      confirmButtonText: "确认退出",
      cancelButtonText: "取消",
      type: "warning",
      confirmButtonClass: "el-button--danger",
    });
    // 清除登录状态
    userStore.clearAuth();
    ElMessage.success("已安全退出登录");
    // 跳转到登录页
    router.push("/login");
  } catch {
    // 用户取消
  }
}

// 页面加载时获取未读数
onMounted(() => {
  loadUnreadNotifications();
});
</script>

<template>
  <el-header class="header">
    <div class="header-left">
      <!-- Logo -->
      <div class="logo" @click="router.push('/')">
        <el-icon class="logo-icon" :size="24">
          <Box />
        </el-icon>
        <span class="logo-text">XU-WMS</span>
      </div>

      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="item.path"
          :to="index < breadcrumbs.length - 1 ? { path: item.path } : undefined"
        >
          {{ item.meta?.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <!-- 主题切换 -->
      <el-tooltip
        :content="isDark ? '切换到亮色模式' : '切换到暗色模式'"
        placement="bottom"
      >
        <div class="action-btn" @click="toggleDark()">
          <el-icon :size="18">
            <Moon v-if="isDark" />
            <Sunny v-else />
          </el-icon>
        </div>
      </el-tooltip>

      <!-- 通知 -->
      <el-dropdown
        trigger="click"
        placement="bottom-end"
        @visible-change="
          (visbile: boolean) => visbile && loadUnreadNotifications()
        "
      >
        <div class="action-btn">
          <el-badge
            :value="unreadCount"
            :max="99"
            :hidden="unreadCount === 0"
            class="notice-badge"
          >
            <el-icon :size="18">
              <Bell />
            </el-icon>
          </el-badge>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="notice-dropdown">
            <div class="notice-header">
              <span>通知消息</span>
              <el-link
                type="primary"
                :underline="false"
                size="small"
                @click="handleMarkAllRead"
              >
                全部已读
              </el-link>
            </div>
            <template v-if="notificationList.length > 0">
              <el-dropdown-item
                v-for="item in notificationList"
                :key="item.id"
                @click="handleNotificationClick(item)"
              >
                <div class="notice-item">
                  <el-tag size="small" :type="getLevelType(item.level)">
                    {{ item.level === "info" ? item.type : item.level }}
                  </el-tag>
                  <div class="notice-content">
                    <span class="notice-text">{{ item.title }}</span>
                    <span class="notice-time">{{
                      formatRelativeTime(item.createdAt)
                    }}</span>
                  </div>
                </div>
              </el-dropdown-item>
            </template>
            <div v-else class="notice-empty">
              <span>暂无新通知</span>
            </div>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户下拉 -->
      <el-dropdown
        trigger="click"
        placement="bottom-end"
        @command="handleCommand"
      >
        <div class="user-info">
          <el-avatar :size="32" :icon="UserFilled" class="user-avatar" />
          <span class="username">{{ userInfo.username }}</span>
          <el-icon class="arrow-icon">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <div class="user-dropdown-header">
              <el-avatar :size="40" :icon="UserFilled" />
              <div class="user-meta">
                <div class="user-name">{{ userInfo.username }}</div>
                <div class="user-role">{{ userInfo.role }}</div>
              </div>
            </div>
            <el-dropdown-item command="logout">
              <el-icon class="logout-icon">
                <SwitchButton />
              </el-icon>
              <span class="logout-text">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
  background-color: var(--wms-bg-surface);
  border-bottom: 1px solid var(--ep-border-color-light);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

.logo-icon {
  color: var(--ep-color-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--ep-text-color-primary);
  letter-spacing: -0.5px;
}

.breadcrumb {
  font-size: 14px;

  :deep(.ep-breadcrumb__item) {
    display: flex;
    align-items: center;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--ep-text-color-regular);
  transition: all 0.2s;

  &:hover {
    background-color: var(--ep-fill-color-light);
    color: var(--ep-text-color-primary);
  }
}

.notice-badge {
  :deep(.ep-badge__content) {
    transform: translateY(2px) translateX(100%);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px 4px 4px;
  margin-left: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--ep-fill-color-light);
  }
}

.user-avatar {
  background-color: var(--ep-color-primary);
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--ep-text-color-primary);
}

.arrow-icon {
  font-size: 12px;
  color: var(--ep-text-color-secondary);
  margin-left: 2px;
}

// 通知下拉样式
.notice-dropdown {
  width: 320px;
  padding: 0;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-weight: 500;
  color: var(--ep-text-color-primary);
}

.notice-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  width: 100%;
}

.notice-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.notice-text {
  flex: 1;
  font-size: 13px;
  color: var(--ep-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 12px;
  color: var(--ep-text-color-secondary);
}

.notice-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  color: var(--ep-text-color-secondary);
  font-size: 13px;
}

// 用户下拉样式
.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ep-text-color-primary);
}

.user-role {
  font-size: 12px;
  color: var(--ep-text-color-secondary);
}

.logout-icon {
  color: var(--ep-color-danger);
}

.logout-text {
  color: var(--ep-color-danger);
}
</style>
