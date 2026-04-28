<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useBabyStore } from '@/stores/baby'
import BabyBanner from '@/components/home/BabyBanner.vue'
import TodayChanges from '@/components/home/TodayChanges.vue'
import FeatureGrid from '@/components/home/FeatureGrid.vue'
import Timeline from '@/components/home/Timeline.vue'

const router = useRouter()
const babyStore = useBabyStore()

onMounted(async () => {
  // 如果没有宝宝信息，尝试拉取
  if (!babyStore.currentBaby) {
    try {
      await babyStore.fetchBabyList()
    } catch {
      // 忽略
    }
  } else {
    // currentBaby 已存在，后台同步宝宝列表
    babyStore.fetchBabyList()
  }

  // 仍然没有宝宝，引导添加
  if (!babyStore.currentBaby) {
    router.replace('/baby/add')
  }
})

function handleUpload() {
  router.push('/album')
}
</script>

<template>
  <div class="home-page min-h-screen bg-[var(--color-bg)] pb-[88px]">
    <div class="home-bg-orb home-bg-orb--pink"></div>
    <div class="home-bg-orb home-bg-orb--blue"></div>

    <div class="home-shell mx-auto w-full max-w-[430px]">
      <div class="relative">
        <BabyBanner />

        <!-- 顶部导航栏 -->
        <div class="absolute inset-x-0 top-0 z-20 px-4 pt-[calc(env(safe-area-inset-top)+6px)]">
          <div class="flex items-center justify-between">
            <button class="touch-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur-sm">
              <Icon icon="mdi:magnify" class="text-[22px]" />
            </button>
            <div class="flex flex-col items-center text-white">
              <span class="text-[22px] font-semibold leading-none">{{ babyStore.babyName }}</span>
              <span class="mt-1 h-[3px] w-6 rounded-full bg-white/90"></span>
            </div>
            <button
              class="touch-btn flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur-sm"
              @click="handleUpload"
            >
              <Icon icon="mdi:camera-plus-outline" class="block text-[22px] leading-none text-white" />
            </button>
          </div>
        </div>
      </div>

      <div class="home-core">
        <div>
          <!-- 今日变化卡片 -->
          <TodayChanges />
        </div>

        <div>
          <!-- 功能入口宫格 -->
          <FeatureGrid />
        </div>

        <div>
          <!-- 时间线 -->
          <Timeline />
        </div>
      </div>
    </div>

    <!-- 右下角浮窗上传按钮 -->
    <div class="fixed bottom-[92px] right-4 z-40">
      <div class="fab-pulse-ring"></div>
      <button
        class="fab-btn touch-btn flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white"
        @click="handleUpload"
      >
        <Icon icon="mdi:camera-plus" class="block text-[24px] leading-none text-white" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  position: relative;
  overflow-x: hidden;
}

.home-shell {
  position: relative;
  z-index: 2;
}

.home-core > div {
  margin-top: 14px;
  margin-bottom: 14px;
}

.home-core {
  box-sizing: border-box;
  padding: 15px;
}

.home-bg-orb {
  position: absolute;
  z-index: 1;
  border-radius: 999px;
  filter: blur(50px);
  opacity: 0.45;
  pointer-events: none;
}

.home-bg-orb--pink {
  top: -60px;
  right: -40px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, #ffc1d7 0%, rgb(255 193 215 / 0%) 72%);
  animation: float-up 8s ease-in-out infinite;
}

.home-bg-orb--blue {
  top: 200px;
  left: -70px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, #cbefff 0%, rgb(203 239 255 / 0%) 72%);
  animation: float-up 10s ease-in-out infinite 2s;
}

/* 浮动按钮 */
.fab-btn {
  position: relative;
  z-index: 2;
  box-shadow: 0 6px 20px rgb(243 95 147 / 35%), 0 2px 6px rgb(243 95 147 / 15%);
  border: 2px solid rgb(255 255 255 / 40%);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fab-btn:active {
  transform: scale(0.92);
}

.fab-pulse-ring {
  position: absolute;
  inset: -4px;
  z-index: 1;
  border-radius: 999px;
  background: rgb(243 95 147 / 20%);
  animation: pulse-ring 2.5s ease-out infinite;
}
</style>
