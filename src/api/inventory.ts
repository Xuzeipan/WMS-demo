import { api } from "./http";
import type { ListResponse } from "./types";

export interface InventoryItem {
  id: string;
  skuId: string;
  locationId: string;
  quantity: number;
  // 后端已返回的映射字段
  skuCode?: string;
  skuName?: string;
  locationCode?: string;
}

export interface InventoryLog {
  id: string;
  skuId: string;
  locationId: string;
  bizId?: string;
  quantity: number;
  createdAt?: string;
}

export interface InventoryQuery {
  skuCode?: string;
  locationCode?: string;
}

export interface InventoryLogQuery {
  skuId?: string;
  locationId?: string;
  bizId?: string;
}

export interface InventorySummary {
  skuCount: number;      // 在库SKU数
  totalQuantity: number; // 库存总量
  lowStockAlert: number; // 低库存预警
  frozenStock: number;   // 冻结库存
}

export const getInventory = (params?: InventoryQuery) =>
  api.get<ListResponse<InventoryItem>>("/inventory", { params });

export const getInventoryLogs = (params?: InventoryLogQuery) =>
  api.get<ListResponse<InventoryLog>>("/inventory/logs", { params });

export const getInventorySummary = () =>
  api.get<InventorySummary>("/inventory/summary");
