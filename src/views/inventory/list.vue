<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getInventory,
  getInventorySummary,
  type InventoryItem,
} from "~/api/inventory";
import { getSkus, type Sku } from "~/api/skus";
import { getLocations, type Location } from "~/api/locations";

// 统计数据
const stats = ref([
  { label: "在库SKU数", value: 0 },
  { label: "库存总量", value: 0 },
  { label: "低库存预警", value: 0 },
  { label: "冻结库存", value: 0 },
]);

// 数据列表
const loading = ref(false);
const tableData = ref<InventoryItem[]>([]);

// 搜索下拉框用
const skuList = ref<Sku[]>([]);
const locationList = ref<Location[]>([]);

// 搜索表单
const searchForm = ref({
  skuCode: "",
  locationCode: "",
});

// 加载 SKU 列表（搜索下拉框用）
async function loadSkuList() {
  try {
    const res = await getSkus();
    skuList.value = res.items || [];
  } catch (error: any) {
    ElMessage.error(error.message || "加载SKU失败");
  }
}

// 加载库位列表（搜索下拉框用）
async function loadLocationList() {
  try {
    const res = await getLocations();
    locationList.value = res.items || [];
  } catch (error: any) {
    ElMessage.error(error.message || "加载库位失败");
  }
}

// 加载统计数据
async function loadSummary() {
  try {
    const res = await getInventorySummary();
    stats.value = [
      { label: "在库SKU数", value: res.skuCount ?? 0 },
      { label: "库存总量", value: res.totalQuantity ?? 0 },
      { label: "低库存预警", value: res.lowStockAlert ?? 0 },
      { label: "冻结库存", value: res.frozenStock ?? 0 },
    ];
  } catch (error: any) {
    // 接口失败时兜底为 0
    stats.value = [
      { label: "在库SKU数", value: 0 },
      { label: "库存总量", value: 0 },
      { label: "低库存预警", value: 0 },
      { label: "冻结库存", value: 0 },
    ];
  }
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const params: { skuCode?: string; locationCode?: string } = {};
    if (searchForm.value.skuCode) {
      params.skuCode = searchForm.value.skuCode;
    }
    if (searchForm.value.locationCode) {
      params.locationCode = searchForm.value.locationCode;
    }
    const res = await getInventory(params);
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
    skuCode: "",
    locationCode: "",
  };
  loadData();
}

onMounted(async () => {
  // 加载统计数据
  loadSummary();
  // 加载搜索下拉框数据
  await Promise.all([loadSkuList(), loadLocationList()]);
  // 加载表格数据
  loadData();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">库存看板</div>
      <div class="actions">
        <el-button>导出</el-button>
      </div>
    </div>

    <el-row :gutter="16" class="section">
      <el-col :span="6" v-for="item in stats" :key="item.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="section">
      <el-form inline label-width="72px">
        <el-form-item label="SKU">
          <el-select
            v-model="searchForm.skuCode"
            placeholder="选择SKU"
            clearable
            filterable
          >
            <el-option
              v-for="sku in skuList"
              :key="sku.id"
              :label="`${sku.code} - ${sku.name}`"
              :value="sku.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库位">
          <el-select
            v-model="searchForm.locationCode"
            placeholder="选择库位"
            clearable
            filterable
          >
            <el-option
              v-for="loc in locationList"
              :key="loc.id"
              :label="loc.code"
              :value="loc.code"
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
        <el-table-column label="SKU编码" prop="skuCode">
          <template #default="{ row }">
            {{ row.skuCode || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="SKU名称" prop="skuName">
          <template #default="{ row }">
            {{ row.skuName || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="库位" prop="locationCode">
          <template #default="{ row }">
            {{ row.locationCode || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存数量" />
      </el-table>
    </el-card>

    <div class="note">库存为快照数据，展示当前可用与冻结情况。</div>
  </div>
</template>

<style scoped></style>
