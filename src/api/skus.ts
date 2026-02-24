import { api } from "./http";
import type { ItemResponse, ListResponse, OkResponse } from "./types";

export interface Sku {
  id: string;
  code: string;
  name: string;
  unit: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkuPayload {
  code: string;
  name: string;
  unit: string;
  status?: string;
}

export const getSkus = (params?: { code?: string; name?: string; status?: string }) =>
  api.get<ListResponse<Sku>>("/skus", { params });

export const createSku = (payload: SkuPayload) =>
  api.post<ItemResponse<Sku>>("/skus", payload);

export const updateSku = (id: string, payload: SkuPayload) =>
  api.put<ItemResponse<Sku>>(`/skus/${id}`, payload);

export const deleteSku = (id: string) =>
  api.delete<OkResponse>(`/skus/${id}`);
