import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginRequest, LoginResponse } from '@/types'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  // state
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '')

  // actions
  async function login(params: LoginRequest): Promise<LoginResponse> {
    const res = await request.post<unknown, LoginResponse>('/auth/login', params)
    token.value = res.token
    userInfo.value = res.user
    localStorage.setItem('token', res.token)
    return res
  }

  async function fetchProfile(): Promise<void> {
    if (!token.value) return
    const res = await request.get<unknown, UserInfo>('/auth/profile')
    userInfo.value = res
  }

  function logout(): void {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    userName,
    login,
    fetchProfile,
    logout,
  }
}, {
  persist: {
    pick: ['token'],
  },
})
