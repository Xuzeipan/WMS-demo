<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";
import MenuTree from "~/components/MenuTree.vue";

const userStore = useUserStore();
const route = useRoute();

// 从 store 获取可见菜单（已过滤 hidden）
const menus = computed(() => userStore.getVisibleMenus);

function handleOpen(key: string, keyPath: string[]) {
  // eslint-disable-next-line no-console
  console.log(key, keyPath);
}
function handleClose(key: string, keyPath: string[]) {
  // eslint-disable-next-line no-console
  console.log(key, keyPath);
}
</script>

<template>
  <el-menu
    router
    :default-active="route.path"
    class="el-menu-vertical-demo"
    @open="handleOpen"
    @close="handleClose"
  >
    <!-- 递归渲染菜单树 -->
    <MenuTree :items="menus" />
  </el-menu>
</template>

<style scoped>
.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
  background-color: var(--wms-bg-surface);
}
</style>
