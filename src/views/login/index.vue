<script setup lang="ts">
import { ref, computed, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";
import { User, Lock } from "@element-plus/icons-vue";
import loginBg from "~/assets/login_bg.png";
import { login } from "~/api/auth";
import { useUserStore } from "~/stores/user";
import type { User as UserEntity } from "~/types/user";

const router = useRouter();
const instance = getCurrentInstance();
const proxy = instance?.proxy;
const userStore = useUserStore();

const form = ref({
  username: "",
  password: "",
});

const loading = ref(false);

const leftStyle = computed(() => ({
  backgroundImage: `url(${loginBg})`,
}));

async function handleLogin() {
  // 表单验证
  if (!form.value.username.trim()) {
    proxy?.$message.warning("请输入账号");
    return;
  }
  if (!form.value.password) {
    proxy?.$message.warning("请输入密码");
    return;
  }
  loading.value = true;
  try {
    // 1. 登录获取 token、用户信息和 menus
    const data = await login({
      username: form.value.username.trim(),
      password: form.value.password,
    });

    // 2. 保存 token 和用户信息
    const user: UserEntity = {
      ...data.user,
      token: data.token,
    };
    userStore.setAuth({
      user,
      token: data.token,
    });

    // 3. 缓存 menus（从登录响应中获取）
    if (data.menus) {
      userStore.setMenus(data.menus);
    }

    proxy?.$message.success("登录成功");
    router.push("/");
  } catch (error) {
    proxy?.$message.error("登录失败，请检查账号密码");
  } finally {
    loading.value = false;
  }
}

function goToRegister() {
  router.push("/register");
}
</script>

<template>
  <div class="login-page">
    <el-container class="login-container">
      <el-aside class="login-left" :style="leftStyle">
        <div class="left-overlay" />
        <div class="left-content">
          <div class="brand">
            <div class="brand-icon">X</div>
            <span class="brand-text">XU-WMS</span>
          </div>

          <h1 class="headline">
            智能 <span class="accent">仓库</span> 解决方案
          </h1>
          <p class="subtitle">
            利用实时智能和自动化优化物流 工作流程和全球供应链可视性。
          </p>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">99.9%</div>
              <div class="stat-label">运行时间精度</div>
            </div>
            <div class="stat">
              <div class="stat-value">24/7</div>
              <div class="stat-label">实时监控</div>
            </div>
          </div>

          <div class="copyright">© 2026 XU-WMS. All rights reserved.</div>
        </div>
      </el-aside>

      <el-main class="login-right">
        <div class="login-card">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>请输入您的账号密码以访问系统。</p>
          </div>

          <el-form
            :model="form"
            class="login-form"
            label-position="top"
            @keyup.enter="handleLogin"
          >
            <el-form-item label="账号">
              <el-input
                v-model="form.username"
                placeholder="输入账号"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item label="密码">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="输入密码"
                size="large"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>

            <div class="login-options">
              <el-link type="primary" :underline="false">忘记密码?</el-link>
            </div>

            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form>

          <!-- <div class="login-footer">
            <span>还没有账号?</span>
            <el-link type="primary" :underline="false" @click="goToRegister">
              立即注册
            </el-link>
          </div> -->
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

.login-page {
  min-height: 100vh;
  background: #0b1a24;
  overflow: hidden;
}

.login-container {
  min-height: 100vh;
  height: 100vh;
  display: flex;
}

.login-left {
  flex: 2;
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: stretch;
}

.left-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(8, 20, 30, 0.6),
    rgba(8, 20, 30, 0.8)
  );
}

.left-content {
  position: relative;
  z-index: 1;
  padding: 80px 72px;
  color: #e6f1ff;
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: 100%;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #4ea1ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.brand-text {
  font-size: 18px;
}

.headline {
  font-size: 52px;
  line-height: 1.08;
  margin: 0;
  color: #fff;
}

.accent {
  color: #4ea1ff;
}

.subtitle {
  margin: 4px 0 0;
  max-width: 520px;
  opacity: 0.85;
  font-size: 17px;
  line-height: 1.8;
}

.stats {
  display: flex;
  gap: 40px;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  opacity: 0.75;
}

.copyright {
  margin-top: auto;
  font-size: 12px;
  opacity: 0.6;
}

.login-right {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 48px;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.login-card {
  width: 360px;
  padding: 0;
}

.login-header {
  margin-bottom: 18px;
}

.login-header h2 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 600;
  color: #0f172a;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.login-form :deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-weight: 600;
  color: #111827;
  text-align: left;
  width: 100%;
}

.login-form :deep(.el-form-item__content) {
  width: 100%;
}

.login-form :deep(.el-input) {
  width: 100%;
}

.login-form :deep(.el-input__prefix) {
  margin-right: 8px;
}

.login-form :deep(.el-icon) {
  font-size: 16px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 0 14px;
}

.login-form :deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 16px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.login-footer .el-link {
  margin-left: 6px;
  font-weight: 600;
}

@media (max-width: 480px) {
  .login-right {
    padding: 32px 20px;
  }
  .login-card {
    width: 100%;
  }
}
</style>
