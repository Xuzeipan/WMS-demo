export interface RoleInfo {
  id: string;
  name: string;
  code?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  hidden?: boolean;
  permission?: string;
  parentId?: string | null;
  sort?: number;
  children?: MenuItem[];
}

export interface User {
  id: string;
  username: string;
  roleId?: string;
  roles?: RoleInfo[];
  token: string;
  avatar?: string;
  menus?: MenuItem[];
}
