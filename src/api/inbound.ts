import { api } from "./http";
import type { ListResponse, OrderItemsResponse } from "./types";

export interface InboundOrder {
  id: string;
  code: string;
  status?: string;
  status_label?: string;
  createdAt?: string;
  created_at?: string;
  remark?: string;
}

export interface InboundOrderItem {
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

export interface InboundOrderItemInput {
  skuId: string;
  locationId: string;
  quantity: number;
}

export interface InboundCreatePayload {
  code: string;
  items: InboundOrderItemInput[];
}

export interface InboundPutawayPayload {
  locationId: string;
}

export interface InboundOrderQuery {
  code?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const getInboundOrders = (params?: InboundOrderQuery) =>
  api.get<ListResponse<InboundOrder>>("/inbound-orders", { params });

export const getInboundOrder = (id: string) =>
  api.get<OrderItemsResponse<InboundOrder, InboundOrderItem>>(
    `/inbound-orders/${id}`
  );

export const createInboundOrder = (payload: InboundCreatePayload) =>
  api.post<OrderItemsResponse<InboundOrder, InboundOrderItem>>(
    "/inbound-orders",
    payload
  );

export const receiveInboundOrder = (id: string) =>
  api.put<{ order: InboundOrder }>(`/inbound-orders/${id}/receive`);

export const putawayInboundOrder = (id: string, payload: InboundPutawayPayload) =>
  api.put<{ order: InboundOrder }>(`/inbound-orders/${id}/putaway`, payload);

export const cancelInboundOrder = (id: string) =>
  api.put<{ order: InboundOrder }>(`/inbound-orders/${id}/cancel`);
