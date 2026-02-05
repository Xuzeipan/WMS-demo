import type { RouteRecordRaw } from "vue-router";

export interface RouteMeta {
  title: string; // 菜单标题
  icon?: string; // 图标名
  hidden?: boolean; // 是否在菜单中隐藏
  keepAlive?: boolean; // 是否缓存页面
  premission?: string[]; // 所需权限
  affix?: boolean; // 是否固定在菜单栏
}

export type AppRouteRecordRaw = RouteRecordRaw & {
  meta?: RouteMeta;
  children?: AppRouteRecordRaw[];
};
