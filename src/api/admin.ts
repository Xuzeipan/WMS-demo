import { api } from "./http";
import type { ItemResponse, ListResponse, OkResponse } from "./types";

export interface Role {
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: number; // 1=启用, 0=禁用
  menuIds?: string[];
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  role_id: string;
}

export interface Menu {
  id: string;
  name: string;
  path: string;
  permission?: string;
  parentId?: string | null;
  sort?: number;
  hidden?: boolean;
  children?: Menu[];
}

export interface CreateUserPayload {
  username: string;
  password: string;
  roleId: string;
}

export interface UpdateUserPayload {
  username: string;
  roleId: string;
  password?: string;
}

export interface CreateMenuPayload {
  name: string;
  path: string;
  parentId?: string | null;
  sort?: number;
  hidden?: boolean;
}

export interface UpdateMenuPayload extends CreateMenuPayload {}

export interface UpdateRoleMenusPayload {
  menuIds: string[];
}

export const getRoles = (params?: { status?: number }) =>
  api.get<ListResponse<Role>>("/roles", { params });

export const getUsers = () => api.get<ListResponse<User>>("/users");

export const createUser = (payload: CreateUserPayload) =>
  api.post<ItemResponse<User>>("/users", payload);

export const updateUser = (id: string, payload: UpdateUserPayload) =>
  api.put<ItemResponse<User>>(`/users/${id}`, payload);

export const deleteUser = (id: string) =>
  api.delete<OkResponse>(`/users/${id}`);

export const getMenus = () => api.get<ListResponse<Menu>>("/menus");

export const createMenu = (payload: CreateMenuPayload) =>
  api.post<ItemResponse<Menu>>("/menus", payload);

export const updateMenu = (id: string, payload: UpdateMenuPayload) =>
  api.put<ItemResponse<Menu>>(`/menus/${id}`, payload);

export const deleteMenu = (id: string) =>
  api.delete<OkResponse>(`/menus/${id}`);

export const getRoleMenus = (roleId: string) =>
  api.get<{ items: string[] }>(`/roles/${roleId}/menus`);

export const updateRoleMenus = (roleId: string, payload: UpdateRoleMenusPayload) =>
  api.put<OkResponse>(`/roles/${roleId}/menus`, payload);

// 获取角色详情
export const getRoleDetail = (id: string) =>
  api.get<ItemResponse<Role>>(`/roles/${id}`);

// 创建角色
export const createRole = (payload: Omit<Role, "id" | "updatedAt">) =>
  api.post<ItemResponse<Role>>("/roles", payload);

// 更新角色
export const updateRole = (id: string, payload: Partial<Role>) =>
  api.put<ItemResponse<Role>>(`/roles/${id}`, payload);

// 删除角色
export const deleteRole = (id: string) =>
  api.delete<OkResponse>(`/roles/${id}`);
