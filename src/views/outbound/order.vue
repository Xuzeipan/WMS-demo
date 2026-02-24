<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getOutboundOrders,
  createOutboundOrder,
  pickOutboundOrder,
  readyToShipOutboundOrder,
  shipOutboundOrder,
  cancelOutboundOrder,
  type OutboundOrder,
  type OutboundOrderItem,
  type OutboundOrderQuery,
} from "~/api/outbound";
import { getSkus, type Sku } from "~/api/skus";
import { getLocations, type Location } from "~/api/locations";
import { useStatusConfig } from "~/composables/useStatusConfig";
import { useRouter } from "vue-router";

const router = useRouter();

// 状态配置
const {
  statusMap,
  options: statusOptions,
  getLabel,
} = useStatusConfig("OUTBOUND_ORDER");

// 数据列表
const loading = ref(false);
const tableData = ref<OutboundOrder[]>([]);

// 搜索表单
const searchForm = ref({
  code: "",
  status: null as string | null,
  dateRange: [] as string[],
});

// 状态颜色映射（数字状态码）
const STATUS_COLOR_MAP: Record<
  string,
  "success" | "warning" | "danger" | "primary" | "info"
> = {
  // 0 = 待拣货 - 黄色
  "0": "warning",
  // 1 = 拣货中 - 蓝色
  "1": "primary",
  // 2 = 待发货 - 橙色
  "2": "warning",
  // 3 = 已完成 - 绿色
  "3": "success",
  // 4 = 已取消 - 灰色
  "4": "info",
};

// 获取状态类型
function getStatusType(status?: string | number) {
  return STATUS_COLOR_MAP[String(status ?? "")] || "info";
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const params: OutboundOrderQuery = {};
    if (searchForm.value.code) {
      params.code = searchForm.value.code;
    }
    if (searchForm.value.status) {
      params.status = searchForm.value.status;
    }
    if (searchForm.value.dateRange?.length === 2) {
      params.dateFrom = searchForm.value.dateRange[0];
      params.dateTo = searchForm.value.dateRange[1];
    }
    const res = await getOutboundOrders(params);
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
    dateRange: [],
  };
  loadData();
}

// 新建出库单弹窗
const dialogVisible = ref(false);
const dialogLoading = ref(false);
const skuList = ref<Sku[]>([]);
const locationList = ref<Location[]>([]);
const orderForm = ref({
  code: "",
  items: [] as { skuId: string; locationId: string; quantity: number }[],
});

// 打开新建弹窗
async function openCreateDialog() {
  orderForm.value = {
    code: generateOrderCode(),
    items: [{ skuId: "", locationId: "", quantity: 1 }],
  };
  dialogVisible.value = true;
  // 加载 SKU 列表和库位列表
  try {
    const [skuRes, locRes] = await Promise.all([getSkus(), getLocations()]);
    skuList.value = skuRes.items || [];
    // 只显示状态为 0(空闲) 或 1(占用) 的库位
    locationList.value = (locRes.items || []).filter(
      (loc) => loc.status === "0" || loc.status === "1"
    );
  } catch (error: any) {
    ElMessage.error(error.message || "加载数据失败");
  }
}

// 生成订单号
function generateOrderCode() {
  const date = new Date();
  const prefix = "OUT";
  const timestamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}-${timestamp}-${random}`;
}

// 添加行
function addItem() {
  orderForm.value.items.push({ skuId: "", locationId: "", quantity: 1 });
}

// 删除行
function removeItem(index: number) {
  orderForm.value.items.splice(index, 1);
}

// 提交订单
async function submitOrder() {
  if (!orderForm.value.code) {
    ElMessage.warning("请输入订单号");
    return;
  }
  if (orderForm.value.items.length === 0) {
    ElMessage.warning("请至少添加一项商品");
    return;
  }
  if (
    orderForm.value.items.some(
      (item) => !item.skuId || !item.locationId || item.quantity <= 0
    )
  ) {
    ElMessage.warning("请完善商品信息（SKU、库位、数量必填）");
    return;
  }

  dialogLoading.value = true;
  try {
    await createOutboundOrder({
      code: orderForm.value.code,
      items: orderForm.value.items,
    });
    ElMessage.success("创建成功");
    dialogVisible.value = false;
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || "创建失败");
  } finally {
    dialogLoading.value = false;
  }
}

// 取消订单
async function handleCancel(row: OutboundOrder) {
  try {
    await ElMessageBox.confirm(`确认取消订单 ${row.code}？`, "确认取消", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await cancelOutboundOrder(row.id);
    ElMessage.success("取消成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "取消失败");
    }
  }
}

// 拣货中
async function handlePick(row: OutboundOrder) {
  try {
    await ElMessageBox.confirm(`确认开始拣货订单 ${row.code}？`, "确认拣货", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await pickOutboundOrder(row.id);
    ElMessage.success("拣货成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "拣货失败");
    }
  }
}

// 待发货
async function handleReadyToShip(row: OutboundOrder) {
  try {
    await ElMessageBox.confirm(
      `确认订单 ${row.code} 进入待发货状态？`,
      "确认待发货",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await readyToShipOutboundOrder(row.id);
    ElMessage.success("状态更新成功");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "操作失败");
    }
  }
}

// 发货完成
async function handleShip(row: OutboundOrder) {
  try {
    await ElMessageBox.confirm(`确认订单 ${row.code} 发货完成？`, "确认发货", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });
    await shipOutboundOrder(row.id, { locationId: "" });
    ElMessage.success("发货完成");
    loadData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error.message || "发货失败");
    }
  }
}

// 查看详情
function handleDetail(row: OutboundOrder) {
  router.push(`/outbound/pick/${row.id}`);
}

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">出库订单</div>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog"
          >新建出库单</el-button
        >
        <el-button>导出</el-button>
      </div>
    </div>

    <el-card shadow="never" class="section">
      <el-form inline label-width="72px">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入订单号"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            :value-on-clear="null"
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
        <el-form-item label="日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" plain @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="section">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="code" label="出库单号" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="light"
              size="small"
              class="status-tag"
            >
              {{ row.status_label || getLabel(row.status || "") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
              <el-button
                v-if="row.status === '0'"
                link
                type="success"
                @click="handlePick(row)"
              >
                拣货中
              </el-button>
              <el-button
                v-if="row.status === '1'"
                link
                type="success"
                @click="handleReadyToShip(row)"
              >
                待发货
              </el-button>
              <el-button
                v-if="row.status === '2'"
                link
                type="success"
                @click="handleShip(row)"
              >
                发货完成
              </el-button>
              <el-button
                v-if="row.status === '0'"
                link
                type="danger"
                @click="handleCancel(row)"
              >
                取消
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建出库单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="新建出库单"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="订单号">
          <el-input v-model="orderForm.code" placeholder="请输入订单号" />
        </el-form-item>

        <el-divider />

        <div class="items-header">
          <span>商品明细</span>
          <el-button type="primary" link @click="addItem">+ 添加商品</el-button>
        </div>

        <div
          v-for="(item, index) in orderForm.items"
          :key="index"
          class="item-row"
        >
          <el-select
            v-model="item.skuId"
            placeholder="选择SKU"
            style="width: 180px"
          >
            <el-option
              v-for="sku in skuList"
              :key="sku.id"
              :label="`${sku.code} - ${sku.name}`"
              :value="sku.id"
            />
          </el-select>
          <el-select
            v-model="item.locationId"
            placeholder="选择库位"
            style="width: 150px"
          >
            <el-option
              v-for="loc in locationList"
              :key="loc.id"
              :label="loc.code"
              :value="loc.id"
            />
          </el-select>
          <el-input-number
            v-model="item.quantity"
            :min="1"
            :precision="0"
            style="width: 100px"
          />
          <el-button type="danger" link @click="removeItem(index)"
            >删除</el-button
          >
        </div>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="dialogLoading" @click="submitOrder">
          确认创建
        </el-button>
      </template>
    </el-dialog>

    <div class="note">状态说明：待拣货 / 拣货中 / 待发货 / 已完成 / 取消。</div>
  </div>
</template>

<style scoped>
.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
}

.item-row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
</style>
