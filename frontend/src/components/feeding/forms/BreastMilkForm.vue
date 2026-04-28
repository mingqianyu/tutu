<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

const { lastRecord, lastTimeLabel, saving, loadLastRecord, handleSave } =
  useFeedingForm('breast_milk')

// 计时模式 / 手动模式
const mode = ref<'timer' | 'manual'>('timer')

// 左右乳房计时
const leftSeconds = ref(0)
const rightSeconds = ref(0)
const activeSide = ref<'left' | 'right' | null>(null)
let timerInterval: ReturnType<typeof setInterval> | null = null

// 手动输入时长（分钟）
const manualMinutes = ref(15)
const manualSide = ref<'left' | 'right' | 'both'>('left')

// 开始时间
const startTime = ref(dayjs().format('YYYY-MM-DD HH:mm'))

// 备注
const note = ref('')

// 编辑模式：是否有已有记录
const isEdit = ref(false)

onMounted(() => {
  if (props.record) {
    // 编辑模式：回填数据
    isEdit.value = true
    mode.value = 'manual'
    manualMinutes.value = Math.ceil((props.record.duration ?? 0) / 60)
    manualSide.value = props.record.side ?? 'left'
    startTime.value = dayjs(props.record.start_time).format('YYYY-MM-DD HH:mm')
    note.value = props.record.note ?? ''
  } else {
    loadLastRecord()
  }
})

onUnmounted(() => {
  stopTimer()
})

// 开始/暂停计时
function toggleTimer(side: 'left' | 'right') {
  if (activeSide.value === side) {
    stopTimer()
    return
  }

  stopTimer()
  activeSide.value = side
  timerInterval = setInterval(() => {
    if (side === 'left') leftSeconds.value++
    else rightSeconds.value++
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  activeSide.value = null
}

// 格式化秒数显示
function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// 保存
async function onSave() {
  stopTimer()

  let duration: number
  let side: 'left' | 'right' | 'both'
  let leftDur = 0
  let rightDur = 0

  if (mode.value === 'timer') {
    duration = leftSeconds.value + rightSeconds.value
    if (duration === 0) {
      showToast('请先开始计时')
      return
    }
    leftDur = leftSeconds.value
    rightDur = rightSeconds.value
    if (leftSeconds.value > 0 && rightSeconds.value > 0) side = 'both'
    else if (leftSeconds.value > 0) side = 'left'
    else side = 'right'
  } else {
    duration = manualMinutes.value * 60
    side = manualSide.value
    // 手动模式下根据侧分配时长
    if (side === 'left') leftDur = duration
    else if (side === 'right') rightDur = duration
    else { leftDur = Math.floor(duration / 2); rightDur = duration - leftDur }
  }

  await handleSave(
    {
      start_time: dayjs(startTime.value).format('YYYY-MM-DD HH:mm:ss'),
      duration,
      side,
      left_duration: leftDur,
      right_duration: rightDur,
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
      <div class="text-lg font-bold" style="color: #FF6B8A">
        {{ isEdit ? '编辑母乳' : '母乳' }}
      </div>
      <div v-if="lastTimeLabel && !isEdit" class="text-xs text-gray-400 mt-1">
        {{ lastTimeLabel }}
      </div>
    </div>

    <!-- 模式切换（新建模式才显示） -->
    <div v-if="!isEdit" class="flex justify-center gap-4 mb-4">
      <button
        class="segment-btn"
        :class="mode === 'timer' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'"
        @click="mode = 'timer'"
      >
        计时
      </button>
      <button
        class="segment-btn"
        :class="mode === 'manual' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'"
        @click="mode = 'manual'"
      >
        手动
      </button>
    </div>

    <!-- 计时模式 -->
    <div v-if="mode === 'timer' && !isEdit" class="flex-1 flex flex-col items-center justify-center gap-8 px-8">
      <div class="flex items-center justify-center gap-12 w-full">
        <!-- 左侧 -->
        <div class="flex flex-col items-center gap-2">
          <button
            class="flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all"
            :class="activeSide === 'left'
              ? 'bg-pink-500 border-pink-500 text-white scale-110'
              : 'bg-pink-50 border-pink-200 text-pink-500'"
            @click="toggleTimer('left')"
          >
            <span class="text-lg font-bold">左</span>
          </button>
          <span class="text-xl font-mono font-bold text-gray-700">
            {{ formatSeconds(leftSeconds) }}
          </span>
          <span v-if="lastRecord?.side === 'left'" class="text-xs text-gray-400">上次</span>
        </div>

        <!-- 右侧 -->
        <div class="flex flex-col items-center gap-2">
          <button
            class="flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all"
            :class="activeSide === 'right'
              ? 'bg-pink-500 border-pink-500 text-white scale-110'
              : 'bg-pink-50 border-pink-200 text-pink-500'"
            @click="toggleTimer('right')"
          >
            <span class="text-lg font-bold">右</span>
          </button>
          <span class="text-xl font-mono font-bold text-gray-700">
            {{ formatSeconds(rightSeconds) }}
          </span>
          <span v-if="lastRecord?.side === 'right'" class="text-xs text-gray-400">上次</span>
        </div>
      </div>
    </div>

    <!-- 手动模式 / 编辑模式 -->
    <div v-if="mode === 'manual' || isEdit" class="flex-1 px-6 pt-4">
      <div class="mb-4">
        <label class="text-sm text-gray-500 mb-2 block">时长（分钟）</label>
        <van-stepper v-model="manualMinutes" :min="1" :max="120" integer />
      </div>

      <div class="mb-4">
        <label class="text-sm text-gray-500 mb-2 block">哺乳侧</label>
        <div class="flex gap-3">
          <button
            v-for="s in (['left', 'right', 'both'] as const)"
            :key="s"
            class="flex-1 rounded-xl border-none py-2.5 text-sm"
            :class="manualSide === s ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'"
            @click="manualSide = s"
          >
            {{ s === 'left' ? '左侧' : s === 'right' ? '右侧' : '双侧' }}
          </button>
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
    <div class="px-6 pb-6">
      <button
        class="form-primary-btn w-full"
        style="background-color: #FF6B8A"
        :disabled="saving"
        @click="onSave"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>
