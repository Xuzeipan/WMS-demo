import { api } from "./http";
import type { MenuItem } from "~/types/user";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RoleInfo {
  id: string;
  name: string;
  code?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  roleId?: string;
  roles?: RoleInfo[];
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
  menus: MenuItem[];
}

export interface MeResponse {
  user: UserInfo;
  menus: MenuItem[];
}

export const login = (payload: LoginPayload) =>
  api.post<LoginResponse>("/auth/login", payload);

export const getMe = () => api.get<MeResponse>("/auth/me");
