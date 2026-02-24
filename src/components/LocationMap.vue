<template>
  <div class="location-map">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="toolbar">
      <slot name="toolbar-prefix" />
      <el-radio-group v-if="showFilter" v-model="filterStatus" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="empty">空闲</el-radio-button>
        <el-radio-button label="occupied">占用</el-radio-button>
        <el-radio-button v-if="showLocked" label="locked">锁定</el-radio-button>
        <el-radio-button v-if="showDisabled" label="disabled"
          >禁用</el-radio-button
        >
      </el-radio-group>
      <slot name="toolbar-suffix" />
    </div>

    <!-- 库位网格 -->
    <div
      class="location-grid"
      :style="gridStyle"
      :class="{ clickable: clickable }"
    >
      <el-tooltip
        v-for="loc in displayLocations"
        :key="loc.id || loc.code"
        :content="getTooltip(loc)"
        :disabled="!getTooltip(loc)"
        placement="top"
        effect="dark"
        raw-content
      >
        <div
          class="location-cell"
          :class="[loc.status, { 'is-active': activeCode === loc.code }]"
          :style="cellStyle"
          @click="handleClick(loc)"
        >
          <slot name="cell" :location="loc">
            <span v-if="showCode" class="cell-code">{{ loc.code }}</span>
            <span v-else class="cell-dot" />
          </slot>
        </div>
      </el-tooltip>
    </div>

    <!-- 图例 -->
    <div v-if="showLegend" class="legend">
      <div class="legend-item">
        <span class="dot empty" />
        <span>{{ mergedStatusText.empty }}</span>
      </div>
      <div class="legend-item">
        <span class="dot occupied" />
        <span>{{ mergedStatusText.occupied }}</span>
      </div>
      <div v-if="showLocked" class="legend-item">
        <span class="dot locked" />
        <span>{{ mergedStatusText.locked }}</span>
      </div>
      <div v-if="showDisabled" class="legend-item">
        <span class="dot disabled" />
        <span>{{ mergedStatusText.disabled }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

/** 库位状态类型 */
export type LocationStatus = "empty" | "occupied" | "locked" | "disabled";

/** 库位数据项 */
export interface LocationItem {
  /** 唯一标识 */
  id?: string;
  /** 库位编码（必填） */
  code: string;
  /** 状态 */
  status: LocationStatus;
  /** 行号（用于布局） */
  row?: number;
  /** 列号（用于布局） */
  col?: number;
  /** 额外数据 */
  [key: string]: any;
}

/** 组件属性 */
interface Props {
  /** 库位数据列表 */
  locations: LocationItem[];
  /** 每行显示的库位数 */
  cols?: number;
  /** 格子大小（px） */
  cellSize?: number;
  /** 格子间距（px） */
  gap?: number;
  /** 是否显示库位编码 */
  showCode?: boolean;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示筛选 */
  showFilter?: boolean;
  /** 是否显示锁定状态 */
  showLocked?: boolean;
  /** 是否显示禁用状态 */
  showDisabled?: boolean;
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 当前激活的库位编码 */
  activeCode?: string;
  /** 自定义状态文本 */
  statusText?: Partial<Record<LocationStatus, string>>;
  /** 自定义提示文本生成函数 */
  tooltipFormatter?: (location: LocationItem) => string;
}

const props = withDefaults(defineProps<Props>(), {
  cols: 10,
  cellSize: 60,
  gap: 8,
  showCode: true,
  showToolbar: true,
  showFilter: true,
  showLocked: true,
  showDisabled: true,
  showLegend: true,
  clickable: true,
  activeCode: "",
  statusText: () => ({
    empty: "空闲",
    occupied: "占用",
    locked: "锁定",
    disabled: "禁用",
  }),
  tooltipFormatter: undefined,
});

/** 事件定义 */
const emit = defineEmits<{
  /** 点击库位 */
  (e: "click", location: LocationItem): void;
  /** 筛选变化 */
  (e: "filter-change", status: string): void;
}>();

/** 筛选状态 */
const filterStatus = ref("all");

/** 合并后的状态文本 */
const mergedStatusText = computed(() => ({
  empty: props.statusText.empty ?? "空闲",
  occupied: props.statusText.occupied ?? "占用",
  locked: props.statusText.locked ?? "锁定",
  disabled: props.statusText.disabled ?? "禁用",
}));

/** 显示的库位列表 */
const displayLocations = computed(() => {
  if (filterStatus.value === "all") {
    return props.locations;
  }
  return props.locations.filter((loc) => loc.status === filterStatus.value);
});

/** 网格样式 */
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, ${props.cellSize}px)`,
  gap: `${props.gap}px`,
}));

/** 格子样式 */
const cellStyle = computed(() => ({
  width: `${props.cellSize}px`,
  height: `${props.cellSize}px`,
  fontSize: `${Math.max(10, props.cellSize / 4)}px`,
}));

/** 获取提示文本 */
function getTooltip(loc: LocationItem): string {
  if (props.tooltipFormatter) {
    return props.tooltipFormatter(loc);
  }
  return `${loc.code} - ${mergedStatusText.value[loc.status]}`;
}

/** 处理点击 */
function handleClick(loc: LocationItem) {
  if (!props.clickable) return;
  emit("click", loc);
}

/** 监听筛选变化 */
watch(filterStatus, (val) => {
  emit("filter-change", val);
});
</script>

<style scoped>
.location-map {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--wms-bg-surface-soft);
  border: 1px solid var(--wms-border-color);
  border-radius: 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.location-grid {
  display: grid;
  justify-content: center;
}

.location-grid.clickable .location-cell {
  cursor: pointer;
}

.location-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.location-cell:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.location-cell.is-active {
  box-shadow:
    0 0 0 2px #409eff,
    0 0 0 4px rgba(64, 158, 255, 0.3);
}

/* 状态颜色 */
.location-cell.empty {
  background: #67c23a;
  color: #fff;
}

.location-cell.occupied {
  background: #f56c6c;
  color: #fff;
}

.location-cell.locked {
  background: #e6a23c;
  color: #fff;
}

.location-cell.disabled {
  background: #909399;
  color: #fff;
  opacity: 0.6;
}

.cell-code {
  font-size: inherit;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}

.cell-dot {
  width: 30%;
  height: 30%;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.8;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--wms-text-secondary);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.dot.empty {
  background: #67c23a;
}
.dot.occupied {
  background: #f56c6c;
}
.dot.locked {
  background: #e6a23c;
}
.dot.disabled {
  background: #909399;
}
</style>
