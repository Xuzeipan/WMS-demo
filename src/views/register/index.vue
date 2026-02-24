<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { User, Lock, Phone, Message } from "@element-plus/icons-vue";
import loginBg from "~/assets/login_bg.png";

const router = useRouter();

const form = ref({
  username: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  agree: false,
});

const loading = ref(false);

const leftStyle = computed(() => ({
  backgroundImage: `url(${loginBg})`,
}));

function handleRegister() {
  // 注册逻辑由用户自行实现
  console.log("注册", form.value);
}

function goToLogin() {
  router.push("/login");
}
</script>

<template>
  <div class="register-page">
    <el-container class="register-container">
      <!-- <el-aside class="register-left" :style="leftStyle">
        <div class="left-overlay" />
        <div class="left-content">
          <div class="brand">
            <div class="brand-icon">X</div>
            <span class="brand-text">XU-WMS</span>
          </div>

          <h1 class="headline">
            开启 <span class="accent">智能</span> 仓储体验
          </h1>
          <p class="subtitle">立即注册，体验高效协同与全流程可视化管理。</p>

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
      </el-aside> -->
      <el-aside class="register-left" :style="leftStyle">
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

      <el-main class="register-right">
        <div class="register-card">
          <div class="register-header">
            <h2>创建账户</h2>
            <p>填写以下信息完成注册</p>
          </div>

          <el-form
            :model="form"
            class="register-form"
            label-position="top"
            @keyup.enter="handleRegister"
          >
            <el-form-item label="账号">
              <el-input
                v-model="form.username"
                placeholder="输入账号"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>

            <el-form-item label="手机号">
              <el-input
                v-model="form.phone"
                placeholder="输入手机号"
                size="large"
                :prefix-icon="Phone"
              />
            </el-form-item>

            <el-form-item label="邮箱（选填）">
              <el-input
                v-model="form.email"
                placeholder="输入邮箱"
                size="large"
                :prefix-icon="Message"
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

            <el-form-item label="确认密码">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="再次输入密码"
                size="large"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>

            <div class="register-agreement">
              <el-checkbox v-model="form.agree">我已阅读并同意</el-checkbox>
              <el-link type="primary" :underline="false">用户协议</el-link>
              <span>和</span>
              <el-link type="primary" :underline="false">隐私政策</el-link>
            </div>

            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="register-button"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form>

          <div class="register-footer">
            <span>已有账户?</span>
            <el-link type="primary" :underline="false" @click="goToLogin">
              立即登录
            </el-link>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

.register-page {
  min-height: 100vh;
  background: #0b1a24;
  overflow: hidden;
}

.register-container {
  min-height: 100vh;
  height: 100vh;
  display: flex;
}

/*.register-left {
  flex: 2;
  position: relative;
  background-size: cover;
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
  padding: 72px 64px;
  color: #e6f1ff;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  font-size: 48px;
  line-height: 1.1;
  margin: 0;
  color: #fff;
}

.accent {
  color: #4ea1ff;
}

.subtitle {
  margin: 0;
  max-width: 520px;
  opacity: 0.85;
  font-size: 16px;
}

.stats {
  display: flex;
  gap: 36px;
}

.stat-value {
  font-size: 28px;
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
}*/
.register-left {
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

.register-right {
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

.register-card {
  width: 360px;
  padding: 0;
}

.register-header {
  margin-bottom: 18px;
}

.register-header h2 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 600;
  color: #0f172a;
}

.register-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.register-form :deep(.el-form-item__label) {
  padding-bottom: 6px;
  font-weight: 600;
  color: #111827;
  text-align: left;
  width: 100%;
}

.register-form :deep(.el-form-item__content) {
  width: 100%;
}

.register-form :deep(.el-input) {
  width: 100%;
}

.register-form :deep(.el-input__prefix) {
  margin-right: 8px;
}

.register-form :deep(.el-icon) {
  font-size: 16px;
}

.register-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 0 14px;
}

.register-form :deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
}

.register-agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 16px;
  font-size: 13px;
  color: #6b7280;
}

.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
}

.register-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.register-footer .el-link {
  margin-left: 6px;
  font-weight: 600;
}

@media (max-width: 480px) {
  .register-right {
    padding: 32px 20px;
  }
  .register-card {
    width: 100%;
  }
}
</style>
