<script setup lang="ts">
import { useTransition, useNow, useDateFormat } from "@vueuse/core";
import { computed, onMounted, ref } from "vue";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Box,
  Download,
  Upload,
  Warning,
  CircleCheck,
  Timer,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getLocationStatusSummary, getDashboardLocations, getDashboardKpi, getDashboardMetrics } from "~/api/dashboard";
import { getRecent, markRead, type NotificationItem } from "~/api/notifications";
import type { LocationSku } from "~/api/dashboard";
import { useStatusConfig } from "~/composables/useStatusConfig";

const router = useRouter();
const now = useNow();
const updatedAt = useDateFormat(now, "YYYY-MM-DD HH:mm:ss");

// 状态配置
const { statusMap, options: statusOptions, loadStatusMap } = useStatusConfig("LOCATION");

// 库位统计数据
const locationStatusData = ref<{
  statusCounts: Record<string, number>;
  total: number;
  updatedAt: string;
} | null>(null);

const locationStatsLoading = ref(false);

const STATUS_LABEL_MAP: Record<string, "empty" | "occupied" | "locked" | "disabled"> = {
  空闲: "empty",
  占用: "occupied",
  锁定: "locked",
  禁用: "disabled",
};

const STATUS_CODE_MAP: Record<string, "empty" | "occupied" | "locked" | "disabled"> = {
  empty: "empty",
  occupied: "occupied",
  locked: "locked",
  disabled: "disabled",
};

function normalizeLocationStatus(code: string, label: string) {
  return (
    STATUS_CODE_MAP[String(code).toLowerCase()] ||
    STATUS_LABEL_MAP[label] ||
    "disabled"
  );
}

// 加载库位状态统计
async function loadLocationStats() {
  locationStatsLoading.value = true;
  try {
    // 并行请求库位列表和统计数据
    const [locationsRes, statusRes] = await Promise.all([
      getDashboardLocations(),
      getLocationStatusSummary(),
    ]);

    // 设置库位数据
    locations.value = locationsRes.items || [];

    // 设置统计数据
    locationStatusData.value = statusRes;

    // 更新时间显示（优先使用 locations 的更新时间）
    const updateTime = locationsRes.updatedAt || statusRes.updatedAt;
    if (updateTime) {
      now.value = new Date(updateTime);
    }
  } catch (error: any) {
    ElMessage.error(error.message || "加载库位数据失败");
    // 兜底：空数据
    locations.value = [];
    locationStatusData.value = {
      statusCounts: {},
      total: 0,
      updatedAt: new Date().toISOString(),
    };
  } finally {
    locationStatsLoading.value = false;
  }
}

// 库位统计（按状态配置顺序，颜色与 LocationMap 一致）
const locationStats = computed(() => {
  const stats: { label: string; value: number; color: string; code: string }[] = [];

  // 按状态配置的顺序构建统计，颜色与 LocationMap 一致
  statusOptions.value.forEach((opt) => {
    const count = locationStatusData.value?.statusCounts[opt.value] ?? 0;
    const statusKey = normalizeLocationStatus(opt.value, opt.label);
    const colorMap: Record<string, string> = {
      empty: "#67c23a",    // 绿色 - 空闲
      occupied: "#f56c6c",  // 红色 - 占用
      locked: "#e6a23c",   // 橙色 - 锁定
      disabled: "#909399",  // 灰色 - 禁用
    };
    stats.push({
      code: opt.value,
      label: opt.label,
      value: count,
      color: colorMap[statusKey] || "#909399",
    });
  });

  return stats;
});

// 库位数据（用于 LocationMap，从接口获取）
const locations = ref<
  { code: string; status: string; quantity?: number; skuList?: LocationSku[] | null }[]
>([]);

// KPI 统计数据
const kpiLoading = ref(false);
const kpiData = ref({
  inboundToday: 0,
  outboundToday: 0,
  inventoryTotal: 0,
  alerts: 0,
  compare: {} as Record<string, { yesterday: number; trend: number; trendUp: boolean }>,
});

// KPI 配置
const kpiConfig = [
  { key: "inboundToday", label: "今日入库单", icon: Download, color: "#10B981" },
  { key: "outboundToday", label: "今日出库单", icon: Upload, color: "#3B82F6" },
  { key: "inventoryTotal", label: "库存总量", icon: Box, color: "#8B5CF6" },
  { key: "alerts", label: "低库存预警", icon: Warning, color: "#EF4444" },
];

// 格式化趋势
function formatTrend(trend: number, trendUp: boolean): string {
  if (trend === 0) return "持平";
  const percent = (Math.abs(trend) * 100).toFixed(1);
  return trend > 0 ? `+${percent}%` : `-${percent}%`;
}

// 加载 KPI 数据
async function loadKpiData() {
  kpiLoading.value = true;
  try {
    const res = await getDashboardKpi();
    kpiData.value = {
      inboundToday: res.inboundToday ?? 0,
      outboundToday: res.outboundToday ?? 0,
      inventoryTotal: res.inventoryTotal ?? 0,
      alerts: res.alerts ?? 0,
      compare: res.compare || {},
    };
    // 更新时间
    if (res.updatedAt) {
      now.value = new Date(res.updatedAt);
    }
  } catch (error: any) {
    ElMessage.error(error.message || "加载KPI数据失败");
    // 兜底为 0
    kpiData.value = {
      inboundToday: 0,
      outboundToday: 0,
      inventoryTotal: 0,
      alerts: 0,
      compare: {},
    };
  } finally {
    kpiLoading.value = false;
  }
}

// 生成 KPI 统计数据（用于模板渲染）
const kpiStats = computed(() => {
  return kpiConfig.map((config) => {
    const value = kpiData.value[config.key as keyof typeof kpiData.value] as number;
    const compare = kpiData.value.compare?.[config.key];
    return {
      label: config.label,
      value: value,
      icon: config.icon,
      color: config.color,
      trend: compare?.trend ?? 0,
      trendUp: compare?.trendUp ?? false,
    };
  });
});

// 动画数值
const statAnimated = kpiStats.value.map((item) => {
  const source = ref(0);
  const output = useTransition(source, {
    duration: 1200,
  });
  return { source, output, target: item.value };
});

// 运营指标
const metricsLoading = ref(false);
const operationMetrics = ref<{
  key: string;
  label: string;
  value: number;
  unit: string;
  percent: number;
}[]>([]);

// 加载运营指标数据
async function loadMetricsData() {
  metricsLoading.value = true;
  try {
    const res = await getDashboardMetrics();
    operationMetrics.value = res.items || [];
  } catch (error: any) {
    ElMessage.error(error.message || "加载运营指标失败");
    operationMetrics.value = [];
  } finally {
    metricsLoading.value = false;
  }
}

// 快捷入口
const quickLinks = ref([
  { label: "入库订单", path: "/inbound/order", icon: Download, color: "#10B981" },
  { label: "出库订单", path: "/outbound/order", icon: Upload, color: "#3B82F6" },
  { label: "库存看板", path: "/inventory/list", icon: Box, color: "#8B5CF6" },
  { label: "库位管理", path: "/base/location", icon: Box, color: "#F59E0B" },
]);

// 最近活动
const recentActivities = ref<NotificationItem[]>([]);

// 加载最近活动（只显示5条）
async function loadRecentActivities() {
  try {
    const res = await getRecent(5);
    // 按 createdAt 倒序排序
    recentActivities.value = (res.items || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error: any) {
    ElMessage.error(error.message || "加载最近活动失败");
    recentActivities.value = [];
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

// 跳转映射规则
function getNotificationPath(item: NotificationItem): string | null {
  if (!item.relatedType) return null;

  // 需要 relatedId 的类型
  const needIdTypes = ['inbound_order', 'outbound_order'];
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

// 点击活动：标记已读并跳转
async function handleActivityClick(item: NotificationItem) {
  // 标记已读
  if (!item.read) {
    try {
      await markRead(item.id);
      item.read = true;
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

// 启动动画
onMounted(async () => {
  // 加载状态配置
  await loadStatusMap();
  // 并行加载 KPI 数据、库位统计、运营指标和最近活动
  await Promise.all([loadKpiData(), loadLocationStats(), loadMetricsData(), loadRecentActivities()]);
  // 启动数字动画
  statAnimated.forEach((item, index) => {
    item.source.value = kpiStats.value[index].value;
  });
});

// 导航到指定页面
function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">数据仪表盘</h1>
        <p class="dashboard-subtitle">
          实时数据监控 | 最后更新：{{ updatedAt }}
        </p>
      </div>
    </div>

    <!-- KPI 统计卡片 -->
    <el-row :gutter="16" class="section">
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
        v-for="(item, index) in kpiStats"
        :key="item.label"
      >
        <el-card
          v-loading="kpiLoading"
          shadow="hover"
          class="kpi-card"
          :style="{ borderLeft: `4px solid ${item.color}` }"
        >
          <div class="kpi-content">
            <div class="kpi-main">
              <div class="kpi-value" :style="{ color: item.color }">
                {{ Math.round(statAnimated[index].output.value) }}
              </div>
              <div class="kpi-label">{{ item.label }}</div>
            </div>
            <div class="kpi-icon" :style="{ backgroundColor: `${item.color}15` }">
              <el-icon :size="24" :color="item.color">
                <component :is="item.icon" />
              </el-icon>
            </div>
          </div>
          <div class="kpi-trend">
            <el-icon v-if="item.trend !== 0" :size="14" :color="item.trendUp ? '#10B981' : '#EF4444'">
              <ArrowUp v-if="item.trendUp" />
              <ArrowDown v-else />
            </el-icon>
            <span
              :style="{ color: item.trendUp ? '#10B981' : item.trend === 0 ? '#9CA3AF' : '#EF4444' }"
            >
              {{ formatTrend(item.trend, item.trendUp) }}
            </span>
            <span class="trend-label">较昨日</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间区域：左侧列（库位地图+最近活动）+ 右侧列（运营指标+快捷入口） -->
    <el-row :gutter="16" class="section" align="top">
      <!-- 左侧列：库位地图 + 最近活动 -->
      <el-col :xs="24" :lg="16">
        <!-- 库位地图 -->
        <el-card shadow="hover" class="location-card">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon :size="18"><Box /></el-icon>
                <span>库位状态监控</span>
              </div>
              <div class="location-legend">
                <div
                  v-for="stat in locationStats"
                  :key="stat.label"
                  class="legend-item"
                >
                  <span
                    class="legend-dot"
                    :style="{ backgroundColor: stat.color }"
                  />
                  <span class="legend-label" :style="{ color: stat.color }">{{ stat.label }}</span>
                  <span class="legend-value" :style="{ color: stat.color }">{{ stat.value }}</span>
                </div>
              </div>
            </div>
          </template>
          <div class="location-map-wrapper" v-loading="locationStatsLoading">
            <!-- LocationMap 组件保留，展示库位地图 -->
            <LocationMap
              :locations="
                locations.map((loc) => ({
                  code: loc.code,
                  status: loc.status as 'empty' | 'occupied' | 'locked' | 'disabled',
                  sku: loc.skuList?.[0]?.skuCode,
                }))
              "
              :cols="8"
              :cell-size="44"
              :gap="8"
              :tooltip-formatter="(loc) => {
                const info = locations.find(l => l.code === loc.code);
                if (!info?.skuList || info.skuList.length === 0) {
                  return loc.code + ' | 无SKU';
                }
                // 多行显示，每行格式：SKU编码 SKU名称 (数量)，用 <br> 换行
                const lines = info.skuList.map(sku => {
                  const qty = sku.quantity ?? 0;
                  return sku.skuCode + ' ' + (sku.skuName || '') + ' (' + qty + ')';
                });
                return loc.code + '<br/>' + lines.join('<br/>');
              }"
            />
          </div>
        </el-card>

        <!-- 最近活动（紧跟库位监控，无间隙） -->
        <el-card shadow="hover" class="activity-card" style="margin-top: 16px;">
          <template #header>
            <div class="card-title">
              <el-icon :size="18"><Timer /></el-icon>
              <span>最近活动</span>
            </div>
          </template>
          <div v-if="recentActivities.length > 0" class="activity-list">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
              @click="handleActivityClick(activity)"
            >
              <div
                class="activity-dot"
                :class="activity.level"
              />
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ formatRelativeTime(activity.createdAt) }}</div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无最近活动" :image-size="60" />
        </el-card>
      </el-col>

      <!-- 右侧列：运营指标 + 快捷入口 -->
      <el-col :xs="24" :lg="8">
        <!-- 运营指标 -->
        <el-card v-loading="metricsLoading" shadow="hover" class="metrics-card">
          <template #header>
            <div class="card-title">
              <el-icon :size="18"><ArrowUp /></el-icon>
              <span>运营指标</span>
            </div>
          </template>
          <div class="metrics-list">
            <div
              v-for="metric in operationMetrics"
              :key="metric.key"
              class="metric-item"
            >
              <div class="metric-info">
                <span class="metric-label">{{ metric.label }}</span>
              </div>
              <div class="metric-value">
                <el-progress
                  :percentage="Math.min(metric.percent, 100)"
                  :stroke-width="8"
                  class="metric-progress"
                />
                <span class="metric-number">
                  {{ metric.value }}{{ metric.unit }}
                </span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 快捷入口（紧跟运营指标，无间隙） -->
        <el-card shadow="hover" class="quick-card" style="margin-top: 16px;">
          <template #header>
            <div class="card-title">
              <el-icon :size="18"><ArrowRight /></el-icon>
              <span>快捷入口</span>
            </div>
          </template>
          <div class="quick-grid">
            <div
              v-for="link in quickLinks"
              :key="link.path"
              class="quick-item"
              :style="{ backgroundColor: `${link.color}10`, borderColor: `${link.color}30` }"
              @click="navigateTo(link.path)"
            >
              <el-icon :size="24" :color="link.color">
                <component :is="link.icon" />
              </el-icon>
              <span class="quick-label">{{ link.label }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  min-height: 100%;
}

.dashboard-header {
  margin-bottom: 20px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--ep-text-color-primary);
  margin: 0 0 8px 0;
}

.dashboard-subtitle {
  font-size: 13px;
  color: var(--ep-text-color-secondary);
  margin: 0;
}

.section {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

// KPI 卡片
.kpi-card {
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  :deep(.ep-card__body) {
    padding: 20px;
  }
}

.kpi-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.kpi-main {
  flex: 1;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  font-family: 'Fira Code', monospace;
}

.kpi-label {
  font-size: 13px;
  color: var(--ep-text-color-secondary);
  margin-top: 4px;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;

  .trend-label {
    color: var(--ep-text-color-secondary);
    font-weight: normal;
    margin-left: 4px;
  }
}

// 卡片头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--ep-text-color-primary);
}

// 库位图例
.location-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-label {
  color: var(--ep-text-color-secondary);
}

.legend-value {
  font-weight: 600;
  color: var(--ep-text-color-primary);
}

.location-map-wrapper {
  padding: 8px;
}

.location-card {
  // height: 100%; // 移除固定高度，让内容自适应

  :deep(.ep-card__body) {
    padding: 16px;
  }
}

// 运营指标
.metrics-card {
  :deep(.ep-card__body) {
    padding: 16px;
  }
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-icon {
  color: var(--ep-text-color-secondary);
}

.metric-label {
  font-size: 13px;
  color: var(--ep-text-color-secondary);
}

.metric-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-progress {
  flex: 1;
}

.metric-number {
  font-size: 14px;
  font-weight: 600;
  color: var(--ep-text-color-primary);
  font-family: 'Fira Code', monospace;
  min-width: 80px;
  text-align: right;
}

// 快捷入口
.quick-card {
  :deep(.ep-card__body) {
    padding: 16px;
  }
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.quick-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--ep-text-color-primary);
}

// 最近活动
.activity-card {
  :deep(.ep-card__body) {
    padding: 12px 16px;
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ep-border-color-lighter);
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--ep-fill-color-light);
  }
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;

  &.success {
    background-color: #10B981;
  }

  &.warning {
    background-color: #F59E0B;
  }

  &.info {
    background-color: #9CA3AF;
  }

  &.error {
    background-color: #EF4444;
  }
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 13px;
  color: var(--ep-text-color-primary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  font-size: 12px;
  color: var(--ep-text-color-secondary);
  margin-top: 2px;
}

// 响应式
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }

  .dashboard-title {
    font-size: 20px;
  }

  .kpi-value {
    font-size: 24px;
  }

  .location-legend {
    gap: 8px;
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
