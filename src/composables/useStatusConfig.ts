import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import {
  getStatusConfigMap,
  getStatusConfigList,
  getStatusConfigs,
  getBizTypes,
  type StatusConfig,
} from "~/api/statusConfig";

/**
 * 状态配置 composable
 * @param bizType - 业务类型，如 SKU, LOCATION, INBOUND_ORDER, OUTBOUND_ORDER
 */
export function useStatusConfig(bizType: string) {
  const loading = ref(false);
  const statusMap = ref<Record<string, string>>({});
  const options = ref<{ label: string; value: string }[]>([]);

  // 加载状态映射
  async function loadStatusMap() {
    if (!bizType) return;
    loading.value = true;
    try {
      const res = await getStatusConfigMap(bizType);
      statusMap.value = res.map;
      // 构建 options（code 是 number，转为 string）
      options.value = Object.entries(res.map)
        .filter(
          ([value, label]) => value !== "" && value !== null && label !== "",
        )
        .map(([value, label]) => ({
          value: String(value),
          label,
        }));
    } catch (error: any) {
      ElMessage.error(error.message || "加载状态配置失败");
    } finally {
      loading.value = false;
    }
  }

  // 刷新数据
  function refresh() {
    loadStatusMap();
  }

  // 根据 code 获取 label
  function getLabel(code: string | number): string {
    return statusMap.value[String(code)] || "-";
  }

  // 初始化
  onMounted(() => {
    if (bizType) {
      loadStatusMap();
    }
  });

  return {
    loading: computed(() => loading.value),
    statusMap: computed(() => statusMap.value),
    options: computed(() => options.value),
    refresh,
    getLabel,
    loadStatusMap,
  };
}

/**
 * 状态配置管理 composable（用于状态配置管理页面）
 */
export function useStatusConfigManager() {
  const loading = ref(false);
  const tableData = ref<StatusConfig[]>([]);
  const bizTypes = ref<string[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(20);

  const searchForm = ref({
    bizType: "",
  });

  // 加载业务类型列表
  async function loadBizTypes() {
    try {
      const res = await getBizTypes();
      bizTypes.value = res.items || [];
    } catch (error: any) {
      ElMessage.error(error.message || "加载业务类型失败");
    }
  }

  // 加载状态配置列表
  async function loadData() {
    loading.value = true;
    try {
      const params: Record<string, any> = {
        page: page.value,
        pageSize: pageSize.value,
      };
      if (searchForm.value.bizType) {
        params.bizType = searchForm.value.bizType;
      }
      const res = await getStatusConfigs(params);
      // 按 sort 排序
      tableData.value = (res.items || []).sort((a, b) => a.sort - b.sort);
      total.value = res.total;
    } catch (error: any) {
      ElMessage.error(error.message || "加载数据失败");
    } finally {
      loading.value = false;
    }
  }

  // 分页变化
  function handlePageChange(newPage: number) {
    page.value = newPage;
    loadData();
  }

  function handlePageSizeChange(newSize: number) {
    pageSize.value = newSize;
    page.value = 1;
    loadData();
  }

  // 搜索
  function handleSearch() {
    page.value = 1;
    loadData();
  }

  // 重置
  function handleReset() {
    searchForm.value.bizType = "";
    page.value = 1;
    loadData();
  }

  // 刷新
  function refresh() {
    loadData();
  }

  return {
    loading: computed(() => loading.value),
    tableData: computed(() => tableData.value),
    bizTypes,
    total: computed(() => total.value),
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
  };
}
