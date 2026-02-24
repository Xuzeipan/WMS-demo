import { api } from "./http";
import type { ItemResponse, ListResponse, OkResponse } from "./types";

export interface Location {
  id: string;
  code: string;
  name: string;
  status?: string;
}

export interface LocationPayload {
  code: string;
  name: string;
  status?: string;
}

export const getLocations = (params?: { code?: string; status?: string }) =>
  api.get<ListResponse<Location>>("/locations", { params });

export const createLocation = (payload: LocationPayload) =>
  api.post<ItemResponse<Location>>("/locations", payload);

export const updateLocation = (id: string, payload: LocationPayload) =>
  api.put<ItemResponse<Location>>(`/locations/${id}`, payload);

export const deleteLocation = (id: string) =>
  api.delete<OkResponse>(`/locations/${id}`);
