<script lang="ts" setup>
import {
  Box,
  DataLine,
  Document,
  Download,
  Grid,
  Location as LocationIcon,
  OfficeBuilding,
  Setting,
  Upload,
  User,
  Menu as MenuIcon,
} from "@element-plus/icons-vue";
import type { Component } from "vue";
import type { MenuItem } from "~/types/user";

// 图标映射表
const iconMap: Record<string, Component> = {
  DataLine,
  Box,
  Document,
  OfficeBuilding,
  Download,
  Upload,
  Setting,
  Grid,
  Location: LocationIcon,
  User,
  Menu: MenuIcon,
};

// 根据图标名称获取组件
function getIcon(iconName?: string): Component {
  if (!iconName) return MenuIcon;
  return iconMap[iconName] || MenuIcon;
}

defineProps<{
  items: MenuItem[];
}>();
</script>

<template>
  <template v-for="item in items" :key="item.path">
    <!-- 没有子菜单：渲染为菜单项 -->
    <el-menu-item :index="item.path" v-if="!item.children?.length">
      <el-icon>
        <component :is="getIcon(item.icon)" />
      </el-icon>
      <template #title>{{ item.name }}</template>
    </el-menu-item>

    <!-- 有子菜单：渲染为子菜单 -->
    <el-sub-menu :index="item.path" v-else>
      <template #title>
        <el-icon>
          <component :is="getIcon(item.icon)" />
        </el-icon>
        <span>{{ item.name }}</span>
      </template>
      <!-- 递归渲染子菜单 -->
      <MenuTree :items="item.children" />
    </el-sub-menu>
  </template>
</template>
