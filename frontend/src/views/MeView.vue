<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog } from 'vant'
import { Icon } from '@iconify/vue'
import { useUserStore } from '@/stores/user'
import { useBabyStore } from '@/stores/baby'
import { getMonthAge } from '@/utils/month-age'
import type { Baby } from '@/types'

const router = useRouter()
const userStore = useUserStore()
const babyStore = useBabyStore()

// 进入页面时获取宝宝列表，确保列表数据最新
onMounted(() => {
  babyStore.fetchBabyList()
})

function goToBabyAdd() {
  router.push('/baby/add')
}

function goToBabyInfo(baby: Baby) {
  babyStore.setCurrentBaby(baby)
  router.push('/baby/info')
}

async function handleLogout() {
  try {
    await showDialog({
      title: '提示',
      message: '确定要退出登录吗？',
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      confirmButtonColor: 'var(--color-primary)',
    })
    userStore.logout()
    babyStore.clear()
    router.replace('/login')
  } catch {
    // 取消
  }
}
</script>

<template>
  <div class="me-page min-h-screen bg-[var(--color-bg-secondary)] pb-[84px]">
    <div class="me-shell mx-auto w-full max-w-[430px] px-[15px] pt-[calc(env(safe-area-inset-top)+10px)]">
      <!-- 用户信息区域 -->
      <div class="profile-card surface-card">
        <div class="flex items-center gap-3">
          <div class="avatar-wrap">
            <img
              v-if="userStore.userInfo?.avatar"
              :src="userStore.userInfo.avatar"
              class="h-full w-full object-cover"
              alt=""
            />
            <div v-else class="flex h-full w-full items-center justify-center text-2xl">😊</div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1 text-[24px] font-semibold leading-none text-[#2f3139]">
              <span class="truncate">{{ userStore.userName || '未设置昵称' }}</span>
              <Icon icon="mdi:chevron-right" class="text-[20px] text-[#b8bcc7]" />
            </div>
          </div>
          <button class="setting-btn touch-btn" @click="handleLogout">
            <Icon icon="mdi:cog-outline" class="text-[22px] text-[#60656f]" />
          </button>
        </div>
      </div>

      <!-- 操作按钮区 -->
      <div class="action-card surface-card mt-[15px] flex rounded-2xl bg-white">
        <button
          class="action-btn touch-btn action-btn--split"
          @click="goToBabyAdd"
        >
          <Icon icon="mdi:plus-circle-outline" class="text-[20px] text-[#5f6470]" />
          <span class="text-[18px] text-[#4f5460]">添加我的宝宝</span>
        </button>
        <button
          class="action-btn touch-btn"
        >
          <Icon icon="mdi:heart-plus-outline" class="text-[20px] text-[#5f6470]" />
          <span class="text-[18px] text-[#4f5460]">关注宝宝/伴侣</span>
        </button>
      </div>

      <!-- 关注的宝宝 -->
      <div class="follow-card surface-card mt-[15px] rounded-2xl bg-white p-4">
        <h3 class="mb-3 text-[20px] font-semibold text-[#2f3139]">关注的宝宝</h3>

        <div v-if="babyStore.babyList.length > 0">
          <div
            v-for="baby in babyStore.babyList"
            :key="baby.id"
            class="follow-row"
            @click="goToBabyInfo(baby)"
          >
            <div class="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
              <img
                v-if="baby.avatar"
                :src="baby.avatar"
                class="h-full w-full object-cover"
                alt=""
              />
              <div v-else class="flex h-full w-full items-center justify-center text-xl">👶</div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-[18px] font-medium leading-none text-[#30323a]">{{ baby.nickname }}</div>
              <div class="mt-1 text-[14px] text-[#999ca6]">{{ getMonthAge(baby.birthday) }}</div>
            </div>
            <Icon icon="mdi:chevron-right" class="text-[22px] text-[#c8cbd3]" />
          </div>
        </div>

        <div v-else class="py-6 text-center">
          <Icon icon="mdi:baby-face-outline" class="mb-1 text-[30px] text-[#c4c8d2]" />
          <p class="text-sm text-gray-400">暂无关注的宝宝</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.me-page {
  position: relative;
}

.me-page::before {
  position: absolute;
  top: -30px;
  right: -60px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(circle, #ffd8e6 0%, rgb(255 216 230 / 0%) 72%);
  content: "";
  filter: blur(40px);
  opacity: 0.5;
  pointer-events: none;
  animation: float-up 8s ease-in-out infinite;
}

.me-shell {
  position: relative;
  z-index: 2;
}

.profile-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  background: linear-gradient(165deg, #ffffff 0%, #fdfafc 100%);
  padding: 16px;
}

.surface-card {
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%), 0 6px 20px rgb(243 95 147 / 6%);
}

.avatar-wrap {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 999px;
  border: 2.5px solid #fff;
  background: linear-gradient(135deg, #fef0f5, #f3f4f8);
  box-shadow: 0 4px 12px rgb(243 95 147 / 12%), 0 2px 4px rgb(0 0 0 / 6%);
}

.setting-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f0eaf2;
  border-radius: 999px;
  background: #fafbfe;
  transition: transform 0.2s ease;
}

.setting-btn:active {
  transform: scale(0.9);
}

.action-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}

.action-btn {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: transparent;
  padding: 14px 8px;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.action-btn--split {
  border-right: 1px solid #f0f1f4;
}

.action-btn:active {
  background: #f8f9fc;
  transform: scale(0.985);
}

.follow-card {
  border: 1px solid var(--color-border);
}

.follow-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 14px;
  padding: 10px 6px;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.follow-row:active {
  background: #f8f9fc;
  transform: scale(0.99);
}
</style>
