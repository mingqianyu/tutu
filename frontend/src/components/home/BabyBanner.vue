<script setup lang="ts">
import { useBabyStore } from '@/stores/baby'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const babyStore = useBabyStore()
const router = useRouter()

function goToBabyInfo() {
  router.push('/baby/info')
}
</script>

<template>
  <div class="banner-wrap relative h-[248px] overflow-hidden shadow-[0_10px_28px_rgba(0,0,0,0.1)]">
    <!-- 默认渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-pink-300 via-pink-200 to-rose-100"></div>
    <!-- 背景图 -->
    <img
      v-if="babyStore.currentBaby?.background"
      :src="babyStore.currentBaby.background"
      class="absolute inset-0 w-full h-full object-cover"
      alt=""
    />
    <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50"></div>

    <!-- 宝宝信息 -->
    <div
      class="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8"
      @click="goToBabyInfo"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- 头像 -->
          <div class="banner-avatar relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full">
            <img
              v-if="babyStore.currentBaby?.avatar"
              :src="babyStore.currentBaby.avatar"
              class="h-full w-full object-cover"
              alt=""
            />
            <div v-else class="flex h-full w-full items-center justify-center text-2xl bg-white/80">👶</div>
          </div>

          <div class="text-white drop-shadow-md">
            <div class="text-[28px] font-bold leading-[1.1]">{{ babyStore.babyName }}</div>
            <div class="mt-1 text-[13px] opacity-90">{{ babyStore.monthAge }}</div>
          </div>
        </div>

        <div class="banner-badge rounded-full px-3 py-1.5 text-xs font-semibold text-[#ef6f9b]">
          <Icon icon="mdi:heart" class="mr-0.5 inline-block text-sm" />
          2位亲友
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner-wrap {
  border-radius: 0 0 24px 24px;
}

.banner-avatar {
  border: 2.5px solid rgb(255 255 255 / 85%);
  background: rgb(255 255 255 / 80%);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.banner-badge {
  background: rgb(255 255 255 / 88%);
  border: 1px solid rgb(255 255 255 / 50%);
  box-shadow: 0 3px 10px rgb(0 0 0 / 10%);
  backdrop-filter: blur(8px);
}
</style>
