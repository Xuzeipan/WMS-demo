<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  getInboundOrder,
  receiveInboundOrder,
  cancelInboundOrder,
  putawayInboundOrder,
  type InboundOrder,
  type InboundOrderItem,
} from "~/api/inbound";
import { useStatusConfig } from "~/composables/useStatusConfig";
import { ArrowLeft } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const route = useRoute();
const router = useRouter();

// 状态配置
const { getLabel } = useStatusConfig("INBOUND_ORDER");

// 数据
const loading = ref(false);
const error = ref(false);
const order = ref<InboundOrder | null>(null);
const items = ref<InboundOrderItem[]>([]);

// 状态颜色映射（数字状态码）
const STATUS_COLOR_MAP: Record<
  string,
  "success" | "warning" | "danger" | "primary" | "info"
> = {
  "0": "warning",
  "1": "primary",
  "2": "success",
  "3": "info",
};

// 获取状态类型
function getStatusType(status?: string | number) {
  return STATUS_COLOR_MAP[String(status ?? "")] || "info";
}

// 汇总数据
const summary = computed(() => {
  const totalQuantity = items.value.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  return {
    totalCount: items.value.length,
    totalQuantity,
  };
});

// 加载数据
async function loadData() {
  const id = route.params.id as string;
  if (!id) {
    error.value = true;
    ElMessage.error("订单ID不存在");
    return;
  }

  loading.value = true;
  error.value = false;

  try {
    const res = await getInboundOrder(id);
    order.value = res.order;
    items.value = res.items || [];
  } catch (err: any) {
    error.value = true;
    ElMessage.error(err.message || "加载订单详情失败");
  } finally {
    loading.value = false;
  }
}

// 返回列表
function goBack() {
  router.back();
}

// 刷新
function refresh() {
  loadData();
}

// 取消订单
async function handleCancel() {
  if (!order.value) return;
  try {
    await ElMessageBox.confirm(
      `确认取消订单 ${order.value.code}？`,
      "确认取消",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await cancelInboundOrder(order.value.id);
    ElMessage.success("取消成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "取消失败");
    }
  }
}

// 收货中
async function handleReceive() {
  if (!order.value) return;
  try {
    await ElMessageBox.confirm(
      `确认开始收货订单 ${order.value.code}？`,
      "确认收货",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await receiveInboundOrder(order.value.id);
    ElMessage.success("收货成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "收货失败");
    }
  }
}

// 上架完成
async function handlePutaway() {
  if (!order.value) return;
  try {
    await ElMessageBox.confirm(
      `确认订单 ${order.value.code} 上架完成？`,
      "确认上架完成",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await putawayInboundOrder(order.value.id, { locationId: "" });
    ElMessage.success("上架完成");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "操作失败");
    }
  }
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="page detail-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span class="back-text">返回</span>
        </el-button>
        <div class="title-wrapper">
          <h1 class="page-title">入库详情</h1>
          <span v-if="order" class="order-code">{{ order.code }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button
          v-if="order?.status === '0'"
          type="warning"
          @click="handleReceive"
        >
          收货中
        </el-button>
        <el-button
          v-if="order?.status === '1'"
          type="success"
          @click="handlePutaway"
        >
          上架完成
        </el-button>
        <el-button
          v-if="order?.status === '0'"
          type="danger"
          @click="handleCancel"
        >
          取消
        </el-button>
        <el-button @click="refresh" :loading="loading">刷新</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="section">
      <el-skeleton :rows="3" animated />
      <el-skeleton :rows="5" animated style="margin-top: 16px" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="section">
      <el-empty description="加载失败" :image-size="120">
        <template #default>
          <p class="error-desc">无法获取订单详情，请稍后重试</p>
        </template>
        <template #footer>
          <el-button type="primary" @click="refresh">重新加载</el-button>
        </template>
      </el-empty>
    </div>

    <!-- 内容区域 -->
    <template v-else-if="order">
      <!-- 订单信息卡片 -->
      <el-card shadow="never" class="section info-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">订单信息</span>
            <el-tag
              :type="getStatusType(order.status)"
              effect="light"
              size="small"
              class="status-tag"
            >
              {{ order.status_label || getLabel(order.status || "") }}
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ order.code }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ order.created_at || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="SKU种类">
            {{ summary.totalCount }} 种
          </el-descriptions-item>
          <el-descriptions-item label="总数量">
            {{ summary.totalQuantity }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 明细表格 -->
      <el-card shadow="never" class="section items-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">商品明细</span>
            <div class="summary-info">
              <span class="summary-item">
                <label>SKU种类：</label>
                <span class="value">{{ summary.totalCount }}</span>
              </span>
              <span class="summary-item">
                <label>总数量：</label>
                <span class="value">{{ summary.totalQuantity }}</span>
              </span>
            </div>
          </div>
        </template>

        <el-table
          :data="items"
          border
          stripe
          v-loading="loading"
          empty-text="暂无明细数据"
        >
          <el-table-column
            type="index"
            width="60"
            label="序号"
            align="center"
          />
          <el-table-column prop="skuCode" label="SKU编码" min-width="150">
            <template #default="{ row }">
              {{ row.sku_code || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="skuName" label="SKU名称" min-width="200">
            <template #default="{ row }">
              {{ row.sku_name || "-" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="quantity"
            label="数量"
            width="120"
            align="right"
          >
            <template #default="{ row }">
              <span class="quantity">{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="locationCode" label="目标库位" min-width="150">
            <template #default="{ row }">
              {{ row.location_code || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="locationName" label="库位名称" min-width="150">
            <template #default="{ row }">
              {{ row.location_name || "-" }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="订单不存在"
      :image-size="120"
      class="section"
    />

    <div class="note">入库单详情页，展示订单基础信息与商品明细。</div>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  padding: 20px;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .back-text {
      margin-left: 4px;
    }
  }

  .title-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--ep-text-color-primary);
      margin: 0;
    }

    .order-code {
      font-size: 14px;
      color: var(--ep-text-color-secondary);
      font-family: "Fira Code", monospace;
    }
  }
}

.section {
  margin-bottom: 16px;
}

.info-card {
  :deep(.ep-card__header) {
    padding: 12px 20px;
    border-bottom: 1px solid var(--ep-border-color-light);
  }

  :deep(.ep-card__body) {
    padding: 20px;
  }
}

.items-card {
  :deep(.ep-card__header) {
    padding: 12px 20px;
    border-bottom: 1px solid var(--ep-border-color-light);
  }

  :deep(.ep-card__body) {
    padding: 0;
  }

  :deep(.ep-table) {
    border-radius: 0;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--ep-text-color-primary);
  }

  .summary-info {
    display: flex;
    gap: 24px;

    .summary-item {
      font-size: 14px;
      color: var(--ep-text-color-secondary);

      label {
        color: var(--ep-text-color-regular);
      }

      .value {
        font-weight: 600;
        color: var(--ep-text-color-primary);
        font-family: "Fira Code", monospace;
      }
    }
  }
}

.status-tag {
  font-weight: 500;
}

.quantity {
  font-weight: 600;
  font-family: "Fira Code", monospace;
  color: var(--ep-text-color-primary);
}

.error-desc {
  color: var(--ep-text-color-secondary);
  font-size: 14px;
  margin-top: 8px;
}

.note {
  margin-top: 20px;
  padding: 12px 16px;
  background-color: var(--ep-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  color: var(--ep-text-color-secondary);
}
</style>
