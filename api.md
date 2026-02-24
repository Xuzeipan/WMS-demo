# WMS Server API 文档（简版）

## 通用约定

- Base URL: `http://127.0.0.1:4000/api`
- 认证：除健康检查外全部需要 `Authorization: Bearer <token>`
- 错误格式：`{ error: { message, code } }`

---

## 健康检查

1. `GET /health`
- 响应：`{ ok: true }`

---

## 认证

1. `POST /auth/login`
- 入参：`{ "username": "admin", "password": "admin123" }`
- 成功：`{ token, user: { id, username, roleId }, menus }`

2. `GET /auth/me`
- Header：Bearer
- 成功：`{ user: { id, username, roleId } }`

---

## 基础数据 / SKU

1. `GET /skus`
- 查询参数：`status?`, `code?`, `name?`
- 成功：`{ items: [...] }`

2. `POST /skus`
- 入参：`{ code, name, unit, status? }`
- 成功：`{ item }`

3. `PUT /skus/:id`
- 入参：`{ code, name, unit, status? }`
- 成功：`{ item }`

4. `DELETE /skus/:id`
- 成功：`{ ok: true }`

---

## 基础数据 / 库位

1. `GET /locations`
- 查询参数：`code?`, `status?`
- 成功：`{ items: [...] }`

2. `POST /locations`
- 入参：`{ code, name, status? }`
- 成功：`{ item }`

3. `PUT /locations/:id`
- 入参：`{ code, name, status }`
- 成功：`{ item }`

4. `DELETE /locations/:id`
- 成功：`{ ok: true }`

---

## 入库

1. `GET /inbound-orders`
- 查询参数：`code?`, `status?`, `dateFrom?`, `dateTo?`
- 成功：`{ items: [...] }`

2. `GET /inbound-orders/:id`
- 成功：`{ order, items }`

3. `POST /inbound-orders`
- 入参：`{ code, items: [{ skuId, quantity }] }`
- 成功：`{ order, items }`

4. `PUT /inbound-orders/:id/receive`
- 成功：`{ order }`

5. `PUT /inbound-orders/:id/putaway`
- 入参：`{ locationId }`
- 成功：`{ order }`

---

## 库存

1. `GET /inventory`
- 查询参数：`skuCode?`, `locationCode?`
- 成功：`{ items: [...] }`

2. `GET /inventory/logs`
- 查询参数：`skuId?`, `locationId?`, `bizId?`
- 成功：`{ items: [...] }`

---

## 系统管理（仅 SYSTEM_ADMIN）

### 角色

1. `GET /roles`
- 成功：`{ items }`

### 用户

1. `GET /users`
- 成功：`{ items }`

2. `POST /users`
- 入参：`{ username, password, roleId }`
- 成功：`{ item }`

3. `PUT /users/:id`
- 入参：`{ username, roleId, password? }`
- 成功：`{ item }`

4. `DELETE /users/:id`
- 成功：`{ ok: true }`

### 菜单

1. `GET /menus`
- 成功：`{ items }`

2. `POST /menus`
- 入参：`{ name, path, parentId?, sort? }`
- 成功：`{ item }`

3. `PUT /menus/:id`
- 入参：`{ name, path, parentId?, sort? }`
- 成功：`{ item }`

4. `DELETE /menus/:id`
- 成功：`{ ok: true }`

### 角色菜单

1. `GET /roles/:id/menus`
- 成功：`{ items: [menuId...] }`

2. `PUT /roles/:id/menus`
- 入参：`{ menuIds: [...] }`
- 成功：`{ ok: true }`

---

## 出库

1. `GET /outbound-orders`
- 查询参数：`code?`, `status?`, `dateFrom?`, `dateTo?`
- 成功：`{ items: [...] }`

2. `GET /outbound-orders/:id`
- 成功：`{ order, items }`

3. `POST /outbound-orders`
- 入参：`{ code, items: [{ skuId, quantity }] }`
- 成功：`{ order, items }`

4. `PUT /outbound-orders/:id/pick`
- 成功：`{ order }`

5. `PUT /outbound-orders/:id/ship`
- 入参：`{ locationId }`
- 成功：`{ order }`
