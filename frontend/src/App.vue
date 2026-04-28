<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomTabBar from '@/components/BottomTabBar.vue'

const route = useRoute()

// 根据路由 meta 控制底部导航显隐
const showTabBar = computed(() => {
  return !route.meta.hideTabBar && route.path !== '/login'
})
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <BottomTabBar v-if="showTabBar" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>
