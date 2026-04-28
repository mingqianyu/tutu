<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { showToast } from 'vant'
import dayjs from 'dayjs'
import type { FeedingRecord } from '@/types'
import { useFeedingForm } from '@/composables/useFeedingForm'

const props = defineProps<{
  record: FeedingRecord | null
}>()

const emit = defineEmits<{
  saved: []
}>()

const { lastTimeLabel, saving, loadLastRecord, handleSave } =
  useFeedingForm('sleep')

// 模式
const mode = ref<'timer' | 'manual'>('timer')

// 计时器
const seconds = ref(0)
const isRunning = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

// 手动输入
const manualHours = ref(1)
const manualMinutes = ref(0)
const startTime = ref(dayjs().format('YYYY-MM-DD HH:mm'))

// 备注
const note = ref('')

// 编辑模式
const isEdit = ref(false)

onMounted(() => {
  if (props.record) {
    isEdit.value = true
    mode.value = 'manual'
    const dur = props.record.duration ?? 0
    manualHours.value = Math.floor(dur / 3600)
    manualMinutes.value = Math.floor((dur % 3600) / 60)
    startTime.value = dayjs(props.record.start_time).format('YYYY-MM-DD HH:mm')
    note.value = props.record.note ?? ''
  } else {
    loadLastRecord()
  }
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

function toggleTimer() {
  if (isRunning.value) {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isRunning.value = false
  } else {
    isRunning.value = true
    timerInterval = setInterval(() => {
      seconds.value++
    }, 1000)
  }
}

// 格式化秒数
function formatTimerDisplay(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// 保存（进行中 / 已完成）
async function onSave(ongoing = false) {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  isRunning.value = false

  let duration: number
  let start: string
  let end: string | null = null

  if (mode.value === 'timer') {
    duration = seconds.value
    if (duration === 0 && !ongoing) {
      showToast('请先开始计时')
      return
    }
    start = dayjs().subtract(duration, 'second').format('YYYY-MM-DD HH:mm:ss')
    if (!ongoing) {
      end = dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  } else {
    duration = (manualHours.value * 60 + manualMinutes.value) * 60
    start = dayjs(startTime.value).format('YYYY-MM-DD HH:mm:ss')
    if (!ongoing) {
      end = dayjs(startTime.value).add(duration, 'second').format('YYYY-MM-DD HH:mm:ss')
    }
  }

  await handleSave(
    {
      start_time: start,
      end_time: end,
      duration,
      is_ongoing: ongoing,
      note: note.value || null,
    },
    props.record?.id
  )

  emit('saved')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- 标题栏 -->
    <div class="text-center py-3">
      <div class="text-lg font-bold" style="color: #9B7FD4">
        {{ isEdit ? '编辑睡眠' : '睡眠' }}
      </div>
      <div v-if="lastTimeLabel && !isEdit" class="text-xs text-gray-400 mt-1">
        {{ lastTimeLabel }}
      </div>
    </div>

    <!-- 模式切换（新建模式才显示） -->
    <div v-if="!isEdit" class="flex justify-center gap-4 mb-4">
      <button
        class="segment-btn"
        :class="mode === 'timer' ? 'text-white' : 'bg-gray-100 text-gray-600'"
        :style="mode === 'timer' ? { backgroundColor: '#9B7FD4' } : {}"
        @click="mode = 'timer'"
      >
        计时
      </button>
      <button
        class="segment-btn"
        :class="mode === 'manual' ? 'text-white' : 'bg-gray-100 text-gray-600'"
        :style="mode === 'manual' ? { backgroundColor: '#9B7FD4' } : {}"
        @click="mode = 'manual'"
      >
        手动
      </button>
    </div>

    <!-- 计时模式 -->
    <div v-if="mode === 'timer' && !isEdit" class="flex-1 flex flex-col items-center justify-center gap-6">
      <!-- 月亮装饰 -->
      <div class="relative">
        <div
          class="w-32 h-32 rounded-full flex items-center justify-center transition-all"
          :class="isRunning ? 'animate-pulse' : ''"
          :style="{
            background: isRunning
              ? 'radial-gradient(circle, #E8DAFF 0%, #D4C0F7 50%, #B89BE6 100%)'
              : 'radial-gradient(circle, #F3EDFF 0%, #E8DAFF 100%)'
          }"
        >
          <Icon icon="mdi:weather-night" class="text-5xl" style="color: #9B7FD4" />
        </div>
      </div>

      <!-- 计时显示 -->
      <div class="text-3xl font-mono font-bold text-gray-700">
        {{ formatTimerDisplay(seconds) }}
      </div>

      <!-- 操作按钮 -->
      <button
        class="form-primary-btn px-8 text-base text-white"
        :style="{ backgroundColor: isRunning ? '#ccc' : '#9B7FD4' }"
        @click="toggleTimer"
      >
        {{ isRunning ? '暂停' : (seconds > 0 ? '继续' : '睡了') }}
      </button>
    </div>

    <!-- 手动模式 / 编辑模式 -->
    <div v-if="mode === 'manual' || isEdit" class="flex-1 px-6 pt-4">
      <div class="mb-4">
        <label class="text-sm text-gray-500 mb-2 block">睡眠时长</label>
        <div class="flex items-center gap-3">
          <van-stepper v-model="manualHours" :min="0" :max="23" integer />
          <span class="text-sm text-gray-500">小时</span>
          <van-stepper v-model="manualMinutes" :min="0" :max="59" :step="5" integer />
          <span class="text-sm text-gray-500">分钟</span>
        </div>
      </div>

      <div class="mb-4">
        <label class="text-sm text-gray-500 mb-2 block">开始时间</label>
        <input
          v-model="startTime"
          type="datetime-local"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
        />
      </div>
    </div>

    <!-- 备注 -->
    <div class="px-6 mb-4">
      <input
        v-model="note"
        type="text"
        placeholder="添加备注..."
        class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
      />
    </div>

    <!-- 保存按钮 -->
    <div class="px-6 pb-6 flex gap-3">
      <button
        v-if="mode === 'timer' && seconds > 0 && !isEdit"
        class="form-secondary-btn flex-1 border-2 bg-white"
        style="border-color: #9B7FD4; color: #9B7FD4; background: white"
        :disabled="saving"
        @click="onSave(true)"
      >
        还在睡
      </button>
      <button
        class="form-primary-btn flex-1"
        style="background-color: #9B7FD4"
        :disabled="saving"
        @click="onSave(false)"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>
