export interface ListResponse<T> {
  items: T[];
}

export interface ItemResponse<T> {
  item: T;
}

export interface OkResponse {
  ok: true;
}

export interface OrderItemsResponse<TOrder, TItem> {
  order: TOrder;
  items: TItem[];
}
