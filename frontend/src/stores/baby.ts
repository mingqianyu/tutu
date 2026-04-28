import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showToast } from 'vant'
import type { Baby } from '@/types'
import request from '@/utils/request'
import { getMonthAge, getMonthAgeNumber } from '@/utils/month-age'

export const useBabyStore = defineStore('baby', () => {
  // state
  const currentBaby = ref<Baby | null>(null)
  const babyList = ref<Baby[]>([])

  // getters
  const hasBaby = computed(() => !!currentBaby.value)
  const babyName = computed(() => currentBaby.value?.nickname || '')
  const monthAge = computed(() => {
    if (!currentBaby.value) return ''
    return getMonthAge(currentBaby.value.birthday)
  })
  const monthAgeNumber = computed(() => {
    if (!currentBaby.value) return 0
    return getMonthAgeNumber(currentBaby.value.birthday)
  })

  // actions
  async function fetchBabyList(): Promise<void> {
    try {
      const res = await request.get<unknown, Baby[]>('/babies')
      babyList.value = res ?? []
      // 默认选中第一个宝宝
      if (babyList.value.length > 0 && !currentBaby.value) {
        currentBaby.value = babyList.value[0] ?? null
      }
    } catch {
      showToast('获取宝宝列表失败')
    }
  }

  async function fetchBabyDetail(id: number): Promise<Baby | null> {
    try {
      const res = await request.get<unknown, Baby>(`/babies/${id}`)
      return res ?? null
    } catch {
      showToast('获取宝宝信息失败')
      return null
    }
  }

  async function addBaby(data: Partial<Baby>): Promise<Baby> {
    const res = await request.post<unknown, Baby>('/babies', data)
    babyList.value = [...babyList.value, res]
    currentBaby.value = res
    return res
  }

  async function updateBaby(id: number, data: Partial<Baby>): Promise<Baby> {
    const res = await request.put<unknown, Baby>(`/babies/${id}`, data)
    // 更新列表和当前宝宝（不可变更新）
    babyList.value = babyList.value.map((b) => (b.id === id ? res : b))
    if (currentBaby.value?.id === id) {
      currentBaby.value = res
    }
    return res
  }

  function setCurrentBaby(baby: Baby): void {
    currentBaby.value = baby
  }

  function clear(): void {
    currentBaby.value = null
    babyList.value = []
  }

  return {
    currentBaby,
    babyList,
    hasBaby,
    babyName,
    monthAge,
    monthAgeNumber,
    fetchBabyList,
    fetchBabyDetail,
    addBaby,
    updateBaby,
    setCurrentBaby,
    clear,
  }
}, {
  persist: {
    pick: ['currentBaby'],
  },
})
