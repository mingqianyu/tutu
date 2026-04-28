<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Icon } from '@iconify/vue'

const router = useRouter()

// 10 宫格功能入口
const features = [
  { label: '喂养记录', icon: 'mdi:baby-bottle-outline', color: '#f48caf', route: '/feeding' },
  { label: '云相册', icon: 'mdi:image-multiple', color: '#62c4ea', route: '/album' },
  { label: '记身高体重', icon: 'mdi:ruler', color: '#7bcf7a', route: '' },
  { label: '宝宝辅食', icon: 'mdi:bowl-mix-outline', color: '#f4a768', route: '' },
  { label: '能不能吃', icon: 'mdi:crown-outline', color: '#f3b35f', route: '' },
  { label: '儿歌故事', icon: 'mdi:music-circle-outline', color: '#ed9f58', route: '' },
  { label: '疫苗接种', icon: 'mdi:needle', color: '#73d2a8', route: '' },
  { label: '在家早教', icon: 'mdi:home-heart', color: '#f0c95f', route: '' },
  { label: '制作MV', icon: 'mdi:movie-open-star-outline', color: '#9d84e6', route: '' },
  { label: '长牙换牙', icon: 'mdi:cup-outline', color: '#f3c95f', route: '' },
]

function handleClick(item: typeof features[number]) {
  if (item.route) {
    router.push(item.route)
  } else {
    showToast('敬请期待')
  }
}
</script>

<template>
  <div class="home-card border border-[var(--color-border)] px-3 py-4">
    <div class="grid grid-cols-5 gap-y-4">
      <button
        v-for="item in features"
        :key="item.label"
        class="feature-item touch-btn flex flex-col items-center gap-1.5 rounded-xl border-none bg-transparent px-1 py-1"
        @click="handleClick(item)"
      >
        <div
          class="feature-icon-wrap flex h-11 w-11 items-center justify-center rounded-2xl"
          :style="{ backgroundColor: item.color + '14', boxShadow: `0 3px 10px ${item.color}15` }"
        >
          <Icon :icon="item.icon" class="text-[21px]" :style="{ color: item.color }" />
        </div>
        <span class="text-[11.5px] leading-tight text-[#5a5e6a]">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.feature-item {
  transition: transform 0.2s ease;
}

.feature-item:active {
  transform: scale(0.92);
}

.feature-icon-wrap {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
</style>
