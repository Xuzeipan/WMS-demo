import { api } from "./http";
import type { ListResponse, OrderItemsResponse } from "./types";

export interface OutboundOrder {
  id: string;
  code: string;
  status?: string;
  status_label?: string;
  createdAt?: string;
  created_at?: string;
  remark?: string;
}

export interface OutboundOrderItem {
  id: string;
  orderId: string;
  skuId: string;
  quantity: number;
  // 后端返回的映射字段
  sku_code?: string;
  sku_name?: string;
  location_id?: string;
  location_code?: string;
  location_name?: string;
}

export interface OutboundOrderItemInput {
  skuId: string;
  locationId: string;
  quantity: number;
}

export interface OutboundCreatePayload {
  code: string;
  items: OutboundOrderItemInput[];
}

export interface OutboundShipPayload {
  locationId: string;
}

export interface OutboundOrderQuery {
  code?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getOutboundOrders = (params?: OutboundOrderQuery) =>
  api.get<ListResponse<OutboundOrder>>("/outbound-orders", { params });

export const getOutboundOrder = (id: string) =>
  api.get<OrderItemsResponse<OutboundOrder, OutboundOrderItem>>(
    `/outbound-orders/${id}`
  );

export const createOutboundOrder = (payload: OutboundCreatePayload) =>
  api.post<OrderItemsResponse<OutboundOrder, OutboundOrderItem>>(
    "/outbound-orders",
    payload
  );

export const pickOutboundOrder = (id: string) =>
  api.put<{ order: OutboundOrder }>(`/outbound-orders/${id}/pick`);

export const shipOutboundOrder = (id: string, payload: OutboundShipPayload) =>
  api.put<{ order: OutboundOrder }>(`/outbound-orders/${id}/ship`, payload);

export const cancelOutboundOrder = (id: string) =>
  api.put<{ order: OutboundOrder }>(`/outbound-orders/${id}/cancel`);

export const readyToShipOutboundOrder = (id: string) =>
  api.put<{ order: OutboundOrder }>(`/outbound-orders/${id}/ready-to-ship`);
