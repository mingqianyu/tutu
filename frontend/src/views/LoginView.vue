<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { useBabyStore } from '@/stores/baby'

const router = useRouter()
const userStore = useUserStore()
const babyStore = useBabyStore()

// 预填账号密码
const username = ref(import.meta.env.DEV ? 'tutu' : '')
const password = ref(import.meta.env.DEV ? 'tutu0725' : '')
const loading = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    showToast('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const res = await userStore.login({
      username: username.value,
      password: password.value,
    })

    // 如果有宝宝，设置当前宝宝
    if (res.baby) {
      babyStore.setCurrentBaby(res.baby)
      router.replace('/')
    } else {
      // 没有宝宝，引导添加
      router.replace('/baby/add')
    }
  } catch {
    showToast('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page min-h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden">
    <!-- 装饰背景 -->
    <div class="login-bg-circle login-bg-circle--1"></div>
    <div class="login-bg-circle login-bg-circle--2"></div>
    <div class="login-bg-circle login-bg-circle--3"></div>

    <!-- Logo 区域 -->
    <div class="mb-10 text-center relative z-10">
      <div class="login-logo-wrap mx-auto mb-5">
        <div class="login-logo-inner">
          <span class="text-3xl">👶</span>
        </div>
        <div class="login-logo-ring"></div>
      </div>
      <h1 class="text-[22px] font-bold text-[#3a3a4a]">宝宝日常</h1>
      <p class="text-[13px] text-[#b5b5c3] mt-1.5 tracking-wide">记录宝宝的每一天</p>
    </div>

    <!-- 登录表单 -->
    <div class="w-full max-w-sm relative z-10">
      <div class="login-field-wrap mb-3">
        <van-field
          v-model="username"
          label="账号"
          placeholder="请输入用户名"
          :border="false"
          class="login-field"
        />
      </div>
      <div class="login-field-wrap mb-7">
        <van-field
          v-model="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :border="false"
          class="login-field"
        />
      </div>
      <van-button
        type="primary"
        block
        round
        :loading="loading"
        loading-text="登录中..."
        color="var(--color-primary)"
        class="login-submit-btn"
        @click="handleLogin"
      >
        登录
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: linear-gradient(165deg, #fff5f9 0%, #fef0f4 30%, #f8f0ff 60%, #ffffff 100%);
}

/* 装饰浮动圆 */
.login-bg-circle {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(40px);
}

.login-bg-circle--1 {
  top: -40px;
  right: -30px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, #ffd6e7 0%, transparent 70%);
  opacity: 0.7;
  animation: float-up 6s ease-in-out infinite;
}

.login-bg-circle--2 {
  bottom: 15%;
  left: -50px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, #e0d4ff 0%, transparent 70%);
  opacity: 0.5;
  animation: float-up 8s ease-in-out infinite 1s;
}

.login-bg-circle--3 {
  top: 35%;
  right: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #d4f0ff 0%, transparent 70%);
  opacity: 0.5;
  animation: float-up 7s ease-in-out infinite 2s;
}

/* Logo */
.login-logo-wrap {
  position: relative;
  width: 88px;
  height: 88px;
}

.login-logo-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 999px;
  background: linear-gradient(145deg, #f9a0c0, #f35f93);
  box-shadow: 0 8px 24px rgb(243 95 147 / 30%), inset 0 1px 0 rgb(255 255 255 / 25%);
}

.login-logo-ring {
  position: absolute;
  inset: -6px;
  z-index: 1;
  border-radius: 999px;
  border: 2px dashed rgb(243 95 147 / 20%);
  animation: gentle-breathe 4s ease-in-out infinite;
}

/* 输入框 */
.login-field-wrap {
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #fff;
  border: 1.5px solid var(--color-border-pink);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.login-field-wrap:focus-within {
  border-color: #f9b4cf;
  box-shadow: 0 0 0 3px rgb(243 95 147 / 8%);
}
</style>
