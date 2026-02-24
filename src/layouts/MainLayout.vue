<script setup lang="ts"></script>

<template>
  <el-config-provider namespace="ep">
    <div class="layout">
      <BaseHeader />
      <div class="main-container">
        <BaseSide />
        <main class="content">
          <RouterView v-slot="{ Component, route }">
            <keep-alive v-if="route.meta?.keepAlive">
              <component :is="Component" :key="route.path" />
            </keep-alive>
            <component :is="Component" v-else :key="route.path" />
          </RouterView>
        </main>
      </div>
    </div>
  </el-config-provider>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--wms-bg-page);
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow: auto;
  background-color: var(--wms-bg-page);
}
</style>
