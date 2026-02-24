import { api } from "./http";
import type { ListResponse } from "./types";

// 将 snake_case 转换为 camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// 深度转换对象的 key 为 camelCase
function keysToCamelCase<T>(obj: any): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamelCase(item)) as unknown as T;
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = toCamelCase(key);
    result[camelKey] = keysToCamelCase(obj[key]);
  }
  return result as T;
}

// 状态配置类型（响应）
export interface StatusConfig {
  id: number;
  bizType: string;
  code: number;
  label: string;
  sort: number;
  isDefault: number;
  isEnabled: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 分页响应
export interface StatusConfigPageResponse {
  items: StatusConfig[];
  total: number;
  page: number;
  pageSize: number;
}

// 列表响应（启用状态，按 sort 排序）
export interface StatusConfigListItem {
  id: number;
  bizType: string;
  code: number;
  label: string;
  sort: number;
}

export interface StatusConfigListResponse {
  items: StatusConfigListItem[];
  fromCache: boolean;
}

// 映射响应
export interface StatusConfigMapResponse {
  map: Record<string, string>;
  fromCache: boolean;
}

// 创建/更新请求
export interface StatusConfigPayload {
  bizType: string;
  code: number;
  label: string;
  sort?: number;
  isDefault?: boolean;
  isEnabled?: boolean;
  remark?: string;
}

// 获取所有业务类型
export const getBizTypes = () =>
  api.get<{ items: string[] }>("/base/status-config/biz-types");

// 分页查询
export const getStatusConfigs = async (params?: { bizType?: string; page?: number; pageSize?: number }) => {
  const res = await api.get<{ items: any[]; total: number; page: number; pageSize: number }>("/base/status-config", { params });
  return {
    items: keysToCamelCase<StatusConfig[]>(res.items),
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
  };
};

// 获取启用列表（缓存）
export const getStatusConfigList = async (bizType: string) => {
  const res = await api.get<{ items: any[]; fromCache: boolean }>("/base/status-config/list", {
    params: { bizType },
  });
  return {
    items: keysToCamelCase<StatusConfigListItem[]>(res.items),
    fromCache: res.fromCache,
  };
};

// 获取 code->label 映射（缓存）
export const getStatusConfigMap = async (bizType: string) => {
  const res = await api.get<StatusConfigMapResponse>("/base/status-config/map", {
    params: { bizType },
  });
  return res;
};

// 创建状态配置
export const createStatusConfig = async (payload: StatusConfigPayload) => {
  const res = await api.post<{ item: any }>("/base/status-config", payload);
  return {
    item: keysToCamelCase<StatusConfig>(res.item),
  };
};

// 更新状态配置
export const updateStatusConfig = async (id: number, payload: Partial<StatusConfigPayload>) => {
  const res = await api.put<{ item: any }>(`/base/status-config/${id}`, payload);
  return {
    item: keysToCamelCase<StatusConfig>(res.item),
  };
};

// 删除状态配置
export const deleteStatusConfig = (id: number) =>
  api.delete<{ ok: true }>(`/base/status-config/${id}`);
