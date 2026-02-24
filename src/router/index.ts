import MainLayout from "~/layouts/MainLayout.vue";
import { AppRouteRecordRaw } from "./types";
import { createRouter, createWebHistory } from "vue-router";

const routes: AppRouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("~/views/login/index.vue"),
    meta: { title: "登录", hidden: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("~/views/register/index.vue"),
    meta: { title: "注册", hidden: true },
  },
  {
    path: "/",
    component: MainLayout,
    redirect: "/dashboard",
    meta: { title: "数据仪表盘", icon: "DataLine" },
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        component: () => import("~/views/dashboard/index.vue"),
        meta: { title: "数据仪表盘", icon: "DataLine", affix: true },
      },
    ],
  },
  {
    path: "/base",
    component: MainLayout,
    redirect: "/base",
    meta: { title: "基础数据", icon: "Grid" },
    children: [
      {
        path: "/base/sku",
        name: "SKU",
        component: () => import("~/views/base/sku.vue"),
        meta: { title: "SKU管理", icon: "Box", affix: true },
      },
      {
        path: "/base/location",
        name: "Location",
        component: () => import("~/views/base/location.vue"),
        meta: { title: "库位管理", icon: "Location", affix: true },
      },
      {
        path: "/base/status-config",
        name: "StatusConfig",
        component: () => import("~/views/base/statusConfig.vue"),
        meta: { title: "状态配置", icon: "Setting", permission: ["base:status-config"] },
      },
    ],
  },

  {
    path: "/inventory",
    component: MainLayout,
    redirect: "/inventory/list",
    meta: { title: "库存管理", icon: "Box" },
    children: [
      {
        path: "/inventory/list",
        name: "InventoryList",
        component: () => import("~/views/inventory/list.vue"),
        meta: { title: "库存看板", icon: "DataLine", keepAlive: true },
      },
      // {
      //   path: "/inventory/query",
      //   name: "InventoryQuery",
      //   component: () => import("~/views/inventory/query.vue"),
      //   meta: { title: "库存查询" },
      // },
      // {
      //   path: "/inventory/detail/:id",
      //   name: "InventoryDetail",
      //   component: () => import("~/views/inventory/detail.vue"),
      //   meta: { title: "库存详情", hidden: true },
      // },
    ],
  },

  {
    path: "/inbound",
    component: MainLayout,
    redirect: "/inbound/order",
    meta: { title: "入库管理", icon: "Download", permission: ["inbound:view"] },
    children: [
      {
        path: "/inbound/order",
        name: "InboundOrder",
        component: () => import("~/views/inbound/order.vue"),
        meta: { title: "入库订单", icon: "Document", permission: ["inbound:order"] },
      },
      // {
      //   path: "/inbound/receive",
      //   name: "InboundReceive",
      //   component: () => import("~/views/inbound/receive.vue"),
      //   meta: { title: "收货作业", permission: ["inbound:receive"] },
      // },
      {
        path: "/inbound/receive/:id",
        name: "InboundReceiveDetail",
        component: () => import("~/views/inbound/receiveDetail.vue"),
        meta: { title: "收货详情", hidden: true },
      },
    ],
  },

  {
    path: "/outbound",
    component: MainLayout,
    redirect: "/outbound/order",
    meta: { title: "出库管理", icon: "Upload", permission: ["outbound:view"] },
    children: [
      {
        path: "/outbound/order",
        name: "OutboundOrder",
        component: () => import("~/views/outbound/order.vue"),
        meta: { title: "出库订单", icon: "Document", keepAlive: true },
      },
      // {
      //   path: "/outbound/pick",
      //   name: "OutboundPick",
      //   component: () => import("~/views/outbound/pick.vue"),
      //   meta: { title: "拣货作业" },
      // },
      {
        path: "/outbound/pick/:id",
        name: "OutboundPickTask",
        component: () => import("~/views/outbound/pickTask.vue"),
        meta: { title: "拣货任务", hidden: true },
      },
    ],
  },

  // {
  //   path: "/warehouse",
  //   component: MainLayout,
  //   redirect: "/warehouse/area",
  //   meta: { title: "仓库基础", icon: "OfficeBuilding" },
  //   children: [
  //     {
  //       path: "area",
  //       name: "WarehouseArea",
  //       component: () => import("~/views/warehouse/area.vue"),
  //       meta: { title: "库区管理", keepAlive: true },
  //     },
  //     {
  //       path: "location",
  //       name: "WarehouseLocation",
  //       component: () => import("~/views/warehouse/location.vue"),
  //       meta: { title: "库位管理", keepAlive: true },
  //     },
  //     {
  //       path: "goods",
  //       name: "WarehouseGoods",
  //       component: () => import("~/views/warehouse/goods.vue"),
  //       meta: { title: "货品档案" },
  //     },
  //   ],
  // },

  {
    path: "/system",
    component: MainLayout,
    redirect: "/system/user",
    meta: { title: "系统设置", icon: "Setting", permission: ["system:admin"] },
    children: [
      {
        path: "/system/user",
        name: "SystemUser",
        component: () => import("~/views/system/user.vue"),
        meta: { title: "用户管理", icon: "User", permission: ["system:user"] },
      },
      {
        path: "/system/role",
        name: "SystemRole",
        component: () => import("~/views/system/role.vue"),
        meta: { title: "角色管理", icon: "UserFilled", permission: ["system:role"] },
      },
      // {
      //   path: "/system/role",
      //   name: "SystemRole",
      //   component: () => import("~/views/system/role.vue"),
      //   meta: { title: "角色权限", permission: ["system:role"] },
      // },
      {
        path: "/system/menu",
        name: "SystemMenu",
        component: () => import("~/views/system/menu.vue"),
        meta: { title: "菜单管理", icon: "Menu", permission: ["system:menu"] },
      },
    ],
  },

  // {
  //   path: "/:pathMatch(.*)*",
  //   name: "NotFound",
  //   component: () => import("~/views/error/404.vue"),
  //   meta: { title: "404", hidden: true },
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes as any,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
