import { api } from "./http";

export interface HealthResponse {
  ok: true;
}

export const healthCheck = () => api.get<HealthResponse>("/health");
