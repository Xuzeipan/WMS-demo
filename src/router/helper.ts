import { AppRouteRecordRaw } from "./types";

// 侧边菜单 过滤 hidden: true 的路由
export function getVisibleMenus(
  routes: AppRouteRecordRaw[],
): AppRouteRecordRaw[] {
  const res: AppRouteRecordRaw[] = [];

  for (const route of routes) {
    if (route.meta?.hidden) continue;

    const newRoutes = { ...route };
    if (route.children?.length) {
      newRoutes.children = getVisibleMenus(route.children); // 递归扫描出子路由
    }
    res.push(newRoutes);
  }
  return res;
}

// 寻找父路由 用于面包屑
export function getParentRoutes(
  routes: AppRouteRecordRaw[],
  path: string,
): AppRouteRecordRaw[] {
  const parents: AppRouteRecordRaw[] = [];

  function findParent(list: AppRouteRecordRaw[], targetPath: string): boolean {
    for (const route of list) {
      if (route.path === targetPath) return true;

      if (route.children) {
        if (findParent(route.children, targetPath)) {
          parents.unshift(route);
          return true;
        }
      }
    }
    return false;
  }
  findParent(routes, path);
  return parents;
}
