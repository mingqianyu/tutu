<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { FeedingType } from '@/types'
import { FEEDING_TYPES, FEEDING_TYPE_LIST } from '@/data/feeding-types'

const emit = defineEmits<{
  select: [type: FeedingType]
}>()
</script>

<template>
  <div class="fixed bottom-[58px] left-0 right-0 z-40 quick-bar-wrap">
    <div class="flex h-[74px] items-center justify-around px-2 overflow-x-auto">
      <button
        v-for="type in FEEDING_TYPE_LIST"
        :key="type"
        class="quick-item touch-btn flex min-w-[56px] flex-col items-center justify-center gap-1 border-none bg-transparent px-1"
        @click="emit('select', type)"
      >
        <div
          class="quick-icon-wrap flex h-10 w-10 items-center justify-center rounded-full"
          :style="{ backgroundColor: FEEDING_TYPES[type].color + '14', boxShadow: `0 2px 8px ${FEEDING_TYPES[type].color}18` }"
        >
          <Icon
            :icon="FEEDING_TYPES[type].icon"
            class="text-[19px]"
            :style="{ color: FEEDING_TYPES[type].color }"
          />
        </div>
        <span class="whitespace-nowrap text-[10.5px] text-[#7a7e89]">
          {{ FEEDING_TYPES[type].label }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.quick-bar-wrap {
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--color-border-pink);
  box-shadow: 0 -4px 16px rgb(227 164 196 / 12%);
}

.quick-item {
  transition: transform 0.2s ease;
}

.quick-item:active {
  transform: scale(0.9);
}

.quick-icon-wrap {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
</style>
