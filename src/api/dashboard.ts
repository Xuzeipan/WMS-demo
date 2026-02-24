import { api } from "./http";

export interface LocationStatusSummary {
  statusCounts: Record<string, number>;
  total: number;
  updatedAt: string;
}

export interface LocationSku {
  skuCode: string;
  skuName?: string;
  quantity?: number;
}

export interface DashboardLocation {
  code: string;
  status: string;
  quantity?: number;      // 库位总数量
  skuList?: LocationSku[] | null;  // SKU 列表
}

export interface DashboardLocationsResponse {
  items: DashboardLocation[];
  updatedAt?: string;
}

// KPI 对比数据
export interface KpiCompare {
  yesterday: number;
  trend: number;
  trendUp: boolean;
}

// KPI 响应
export interface DashboardKpi {
  inboundToday: number;
  outboundToday: number;
  inventoryTotal: number;
  alerts: number;
  updatedAt: string;
  compare?: {
    inboundToday?: KpiCompare;
    outboundToday?: KpiCompare;
    inventoryTotal?: KpiCompare;
    alerts?: KpiCompare;
  };
}

export const getLocationStatusSummary = () =>
  api.get<LocationStatusSummary>("/dashboard/location-status");

export const getDashboardLocations = () =>
  api.get<DashboardLocationsResponse>("/dashboard/locations");

export const getDashboardKpi = () =>
  api.get<DashboardKpi>("/dashboard/kpi");

// 运营指标项
export interface DashboardMetricItem {
  key: string;
  label: string;
  value: number;
  unit: string;
  percent: number;
}

// 运营指标响应
export interface DashboardMetrics {
  updatedAt: string;
  items: DashboardMetricItem[];
}

export const getDashboardMetrics = () =>
  api.get<DashboardMetrics>("/dashboard/metrics");
