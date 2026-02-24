import { Router } from "vue-router";
import { useUserStore } from "~/stores/user";

// 白名单路径（无需登录即可访问）
const whiteList = ["/login", "/404"];

// 需要登录但不需要校验菜单权限的路径（如首页、个人中心等通用页面）
const publicPaths = ["/", "/profile"];

export function setupRouterGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const token = userStore.getToken;

    // 1. 未登录状态
    if (!token) {
      if (whiteList.includes(to.path)) {
        next();
      } else {
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
      }
      return;
    }

    // 2. 已登录状态
    // 已登录访问登录页，重定向到首页
    if (to.path === "/login") {
      next("/");
      return;
    }

    // 3. 权限校验（基于后端返回的 menus 树）
    // 公共路径直接放行
    if (publicPaths.includes(to.path)) {
      next();
      return;
    }

    // 检查路径是否在授权的 menus 中
    // 后端已返回完整授权菜单树（包含 hidden），只需判断 path 是否存在
    const hasAccess = userStore.hasAccess(to.path);
    if (!hasAccess) {
      // 无权限访问，跳转到 404
      next("/404");
      return;
    }

    // 有权限，放行
    next();
  });
}
