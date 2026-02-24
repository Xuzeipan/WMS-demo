# XU-WMS 仓库管理系统

> Vue3 + Element Plus 实现的企业级仓储管理后台

## 项目简介

这是我独立开发的一套 **WMS（Warehouse Management System）仓库管理系统** Demo，旨在通过实践掌握 Vue3 生态及企业级中后台开发流程。系统覆盖了仓储业务的核心场景，包括库存管理、入库/出库作业、库位管理等模块，并实现了基于角色的权限控制。

**在线预览**: https://wms-demo.xuzepeng.com (可部署到 GitHub Pages)

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.5 + Composition API + TypeScript |
| 构建工具 | Vite 7.x |
| UI 组件库 | Element Plus 2.10 |
| 状态管理 | Pinia |
| 路由管理 | Vue Router 4 |
| 样式方案 | SCSS + UnoCSS |
| 代码规范 | ESLint + @antfu/eslint-config |

## 核心功能模块

### 📦 库存管理
- 库存实时查询与多维度筛选
- 库存明细查看（批次、效期、库位分布）
- 库存预警提醒

### 📥 入库管理
- 入库订单创建与审核流程
- 收货作业扫码录入
- 上架分配策略

### 📤 出库管理
- 出库订单管理与波次分配
- 智能拣货路径规划
- 复核打包流程

### 🏭 仓库基础
- 库区/库位可视化配置
- 货品档案管理（SKU、条码、规格）

### 🔐 系统设置
- 用户管理与角色权限分配
- 操作日志审计

## 项目亮点

### 1. 基于角色的权限控制（RBAC）
- 实现三级权限体系：菜单权限 → 页面权限 → 操作权限
- 使用路由守卫 `beforeEach` 进行统一鉴权
- 支持动态路由渲染，无权限菜单自动隐藏

```typescript
// 路由配置示例
{
  path: '/inbound',
  meta: {
    title: '入库管理',
    permission: ['inbound:view', 'inbound:admin']
  },
  children: [...]
}
```

### 2. 组件化与代码复用
- 封装 `SideMenu`、`BaseHeader` 等布局组件
- 使用 Vue3 Composition API 封装 `useAuth`、`usePermission` 等逻辑复用函数
- 表单组件二次封装，统一校验规则和交互体验

### 3. 响应式设计
- 登录页采用左右分栏布局（PC 端），移动端自适应为全屏表单
- 使用 Element Plus 的 Grid 系统适配不同屏幕尺寸

### 4. 工程化实践
- **自动导入**: 使用 `unplugin-vue-components` 实现组件按需自动导入
- **类型安全**: 全项目 TypeScript 覆盖，定义 `AppRouteRecordRaw` 等扩展类型
- **代码规范**: ESLint + Prettier 统一代码风格，Git 提交前自动校验

## 项目结构

```
src/
├── components/        # 公共组件
│   ├── layouts/       # 布局组件（侧边栏、顶部导航）
│   └── Menu/          # 菜单组件（支持递归渲染）
├── views/             # 页面视图
│   ├── login/         # 登录页（自定义样式）
│   ├── dashboard/     # 数据仪表盘
│   ├── inventory/     # 库存管理
│   ├── inbound/       # 入库管理
│   ├── outbound/      # 出库管理
│   ├── warehouse/     # 仓库基础
│   └── system/        # 系统设置
├── router/            # 路由配置
│   ├── index.ts       # 路由表定义
│   ├── guard.ts       # 路由守卫
│   └── helper.ts      # 菜单生成工具函数
├── stores/            # Pinia 状态管理
├── composables/       # 组合式函数
├── styles/            # 全局样式
│   └── element/       # Element Plus 主题定制
└── utils/             # 工具函数
```

## 运行项目

```bash
# 安装依赖
pnpm install

# 启动开发服务器
npm run dev

# 构建生产环境
npm run build

# 代码检查
npm run lint
npm run typecheck
```

## 我的收获

通过这个项目，我深入掌握了：

1. **Vue3 生态实践**: 熟练使用 Composition API、`<script setup>` 语法，理解响应式原理
2. **企业级路由设计**: 掌握动态路由、嵌套路由、路由守卫在实际业务中的应用
3. **权限方案设计**: 理解 RBAC 模型的前端实现，包括路由级权限和按钮级权限控制
4. **工程化能力**: 学习使用 Vite 构建工具，配置 ESLint、TypeScript 等工具链
5. **组件封装思维**: 从业务中抽象可复用组件，提升开发效率

## 待优化方向

- [ ] 接入后端 API，实现真实数据交互
- [ ] 增加数据可视化图表（ECharts 展示库存趋势）
- [ ] 实现 WebSocket 实时推送库存预警
- [ ] 单元测试覆盖（Vitest + Vue Test Utils）

---

**联系我**: xuzepeng@example.com | [GitHub](https://github.com/xuzepeng)

*本项目为个人学习作品，欢迎交流指正*
