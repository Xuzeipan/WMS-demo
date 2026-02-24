import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, MenuItem } from "~/types/user";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const MENUS_KEY = "user_menus";

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const menus = ref<MenuItem[]>([]);

  const getUser = computed(() => user.value);
  const getToken = computed(() => token.value);
  const getMenus = computed(() => menus.value);

  // 获取可见菜单（过滤 hidden: true）
  const getVisibleMenus = computed(() => {
    const filterHidden = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter((item) => !item.hidden)
        .map((item) => ({
          ...item,
          children: item.children ? filterHidden(item.children) : undefined,
        }));
    };
    return filterHidden(menus.value);
  });

  // 获取所有允许访问的路径（从 menus 树中提取所有 path）
  const getAccessiblePaths = computed(() => {
    const paths: string[] = [];
    const collect = (items: MenuItem[]) => {
      for (const item of items) {
        if (item.path) paths.push(item.path);
        if (item.children) collect(item.children);
      }
    };
    collect(menus.value);
    return new Set(paths);
  });

  function setAuth(payload: { user: User; token: string }) {
    user.value = payload.user;
    token.value = payload.token;
    // 登录时始终保存到 localStorage
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }

  function setMenus(userMenus: MenuItem[]) {
    menus.value = userMenus;
    localStorage.setItem(MENUS_KEY, JSON.stringify(userMenus));
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    menus.value = [];
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(MENUS_KEY);
  }

  function hydrateFromCache() {
    const cachedToken = localStorage.getItem(TOKEN_KEY);
    const cachedUser = localStorage.getItem(USER_KEY);
    const cachedMenus = localStorage.getItem(MENUS_KEY);
    if (!cachedToken || !cachedUser) return;
    try {
      const parsed = JSON.parse(cachedUser) as User;
      user.value = parsed;
      token.value = cachedToken;
      if (cachedMenus) {
        menus.value = JSON.parse(cachedMenus) as MenuItem[];
      }
    } catch {
      clearAuth();
    }
  }

  // 检查是否有权限访问某个路径（基于 menus 树中的 path）
  function hasAccess(path: string): boolean {
    const paths = getAccessiblePaths.value;
    return paths.has(path);
  }

  hydrateFromCache();

  return {
    user,
    token,
    menus,
    getUser,
    getToken,
    getMenus,
    getVisibleMenus,
    getAccessiblePaths,
    setAuth,
    setMenus,
    clearAuth,
    hydrateFromCache,
    hasAccess,
  };
});
