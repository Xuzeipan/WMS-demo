# XU-WMS 仓库管理系统

> Vue 3 + Element Plus + TypeScript 实现的企业级仓储管理后台

## 项目简介

一套 **WMS（Warehouse Management System）仓库管理系统**，涵盖仓储业务的核心场景，包括库存管理、入库/出库作业、库位管理、SKU 管理等模块，并实现基于角色的权限控制（RBAC）。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.5 + Composition API + TypeScript |
| 构建工具 | Vite 7.x |
| UI 组件库 | Element Plus 2.10 |
| 状态管理 | Pinia |
| 路由管理 | Vue Router 4 |
| 样式方案 | SCSS + UnoCSS |
| HTTP 客户端 | Axios |

## 核心功能模块

### 📦 库存管理
- 库存实时查询与多维度筛选
- 库存明细查看（批次、效期、库位分布）
- 库存预警通知

### 📥 入库管理
- 入库订单创建与管理
- 收货作业与上架
- 入库单详情查看

### 📤 出库管理
- 出库订单管理
- 拣货任务分配
- 出库单详情查看

### 🏭 基础数据
- 库区/库位可视化配置
- SKU 货品档案管理
- 状态配置管理

### 🔐 系统设置
- 用户管理
- 角色与权限管理（RBAC）
- 菜单管理（支持 hidden 隐藏菜单）

## 项目亮点

### 1. 基于角色的权限控制（RBAC）
- 后端返回完整授权菜单树，前端直接渲染
- 使用路由守卫进行统一鉴权
- 支持 hidden 菜单（不显示在侧边栏，但允许访问）

```typescript
// 登录后缓存菜单
userStore.setMenus(data.menus)

// 路由守卫权限校验
const hasAccess = userStore.hasAccess(to.path)
```

### 2. 组件化与代码复用
- 封装 `BaseSide`、`BaseHeader` 等布局组件
- 递归菜单组件 `MenuTree` 支持多级菜单渲染
- 使用 Vue 3 Composition API 封装业务逻辑

### 3. 响应式设计
- 登录页采用左右分栏布局（PC 端），自适应移动端
- Element Plus 组件适配不同屏幕尺寸

### 4. 工程化实践
- **自动导入**: `unplugin-vue-components` 实现组件按需自动导入
- **类型安全**: TypeScript 全覆盖，定义扩展类型
- **路径别名**: `~/` 映射到 `src/`

## 项目结构

```
src/
├── api/               # API 接口封装
│   ├── admin.ts       # 系统管理接口
│   ├── auth.ts        # 认证接口
│   ├── http.ts        # Axios 配置
│   └── ...
├── components/        # 公共组件
│   ├── layouts/       # 布局组件
│   └── MenuTree.vue   # 递归菜单组件
├── views/             # 页面视图
│   ├── login/         # 登录页
│   ├── dashboard/     # 数据仪表盘
│   ├── inventory/     # 库存管理
│   ├── inbound/       # 入库管理
│   ├── outbound/      # 出库管理
│   ├── base/          # 基础数据
│   └── system/        # 系统设置
├── router/            # 路由配置
│   ├── index.ts       # 路由表定义
│   ├── guard.ts       # 路由守卫
│   └── helper.ts      # 路由辅助函数
├── stores/            # Pinia 状态管理
│   └── user.ts        # 用户状态、菜单缓存
├── types/             # TypeScript 类型定义
├── layouts/           # 页面布局
└── styles/            # 全局样式
```

## 环境配置

创建 `.env` 文件：

```bash
# API 基础地址
VITE_API_BASE_URL=http://127.0.0.1:4000/api
```

## 运行项目

```bash
# 安装依赖
pnpm install

# 启动开发服务器
npm run dev

# 构建生产环境
npm run build

# 类型检查
npm run typecheck
```

## 主要功能说明

### 菜单权限控制

系统采用后端返回完整菜单树的方式控制权限：

1. 登录成功后，后端返回 `menus` 树形结构
2. 前端将菜单缓存到 `localStorage` 和 Pinia store
3. 侧边栏使用 `getVisibleMenus` 过滤 `hidden` 菜单进行渲染
4. 路由守卫使用 `hasAccess(path)` 判断是否有权限访问

### Hidden 菜单

- 菜单管理中可设置 `hidden: true`
- hidden 菜单不显示在左侧侧边栏
- 但用户仍有权限访问（如通过详情页入口进入）

---

*本项目为个人学习作品*
