import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录', hideTabBar: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '宝宝主页' },
    },
    {
      path: '/feeding',
      name: 'feeding',
      component: () => import('@/views/FeedingView.vue'),
      meta: { title: '喂养记录' },
    },
    {
      path: '/feeding/stats',
      name: 'feedingStats',
      component: () => import('@/views/FeedingStatsView.vue'),
      meta: { title: '喂养统计', hideTabBar: true },
    },
    {
      path: '/album',
      name: 'album',
      component: () => import('@/views/AlbumView.vue'),
      meta: { title: '云相册', hideTabBar: true },
    },
    {
      path: '/me',
      name: 'me',
      component: () => import('@/views/MeView.vue'),
      meta: { title: '我' },
    },
    {
      path: '/baby/add',
      name: 'babyAdd',
      component: () => import('@/views/BabyAddView.vue'),
      meta: { title: '添加宝宝', hideTabBar: true },
    },
    {
      path: '/baby/info',
      name: 'babyInfo',
      component: () => import('@/views/BabyInfoView.vue'),
      meta: { title: '宝宝信息', hideTabBar: true },
    },
  ],
})

// 导航守卫 — 未登录跳转登录页
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')

  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
