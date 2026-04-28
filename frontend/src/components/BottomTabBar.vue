<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const route = useRoute()
const router = useRouter()

// 底部导航项
const tabs = [
  { name: 'home', path: '/', label: '宝宝', icon: 'mdi:baby-face-outline', activeIcon: 'mdi:baby-face' },
  { name: 'feeding', path: '/feeding', label: '喂养', icon: 'mdi:baby-bottle-outline', activeIcon: 'mdi:baby-bottle' },
  { name: 'me', path: '/me', label: '我', icon: 'mdi:account-outline', activeIcon: 'mdi:account' },
]

const activePath = computed(() => route.path)

function isActive(path: string): boolean {
  if (path === '/') return activePath.value === '/'
  return activePath.value.startsWith(path)
}

function handleTabClick(path: string) {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<template>
  <div class="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 tab-bar-wrap">
    <div class="flex h-[58px] items-center justify-around">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        class="tab-item touch-btn relative flex h-full flex-1 flex-col items-center justify-center border-none bg-transparent"
        :class="isActive(tab.path) ? 'is-active' : 'text-[#a0a1a8]'"
        @click="handleTabClick(tab.path)"
      >
        <!-- 激活指示条 -->
        <span v-if="isActive(tab.path)" class="tab-indicator"></span>
        <Icon
          :icon="isActive(tab.path) ? tab.activeIcon : tab.icon"
          class="tab-icon text-[22px]"
        />
        <span class="mt-[2px] text-[10.5px] font-medium">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tab-bar-wrap {
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -2px 12px rgb(0 0 0 / 3%);
}

.tab-item {
  transition: color 0.25s ease;
}

.tab-item.is-active {
  color: var(--color-primary);
}

.tab-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, #f9a0c0, #f35f93);
}

.tab-icon {
  transition: transform 0.25s ease;
}

.tab-item.is-active .tab-icon {
  transform: scale(1.08);
}
</style>
