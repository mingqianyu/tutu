<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  useFeedingForm('formula')

// 奶量（ml）
const amount = ref(120)
// 开始时间
const startTime = ref(dayjs().format('YYYY-MM-DD HH:mm'))
// 备注
const note = ref('')
// 输入模式
const inputMode = ref<'slider' | 'keyboard'>('slider')
// 是否编辑模式
const isEdit = ref(false)

onMounted(async () => {
  if (props.record) {
    isEdit.value = true
    amount.value = props.record.amount ?? 120
    startTime.value = dayjs(props.record.start_time).format('YYYY-MM-DD HH:mm')
    note.value = props.record.note ?? ''
  } else {
    await loadLastRecord()
    if (lastRecord.value?.amount) {
      amount.value = lastRecord.value.amount
    }
  }
})

const quickAmounts = [60, 90, 120, 150, 180, 210]

async function onSave() {
  await handleSave(
    {
      start_time: dayjs(startTime.value).format('YYYY-MM-DD HH:mm:ss'),
      amount: amount.value,
      unit: 'ml',
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
      <div class="text-lg font-bold" style="color: #FF8FA0">
        {{ isEdit ? '编辑配方奶' : '配方奶' }}
      </div>
      <div v-if="lastTimeLabel && !isEdit" class="text-xs text-gray-400 mt-1">
        {{ lastTimeLabel }}
      </div>
    </div>

    <div class="flex-1 px-6 pt-2">
      <!-- 奶量显示 -->
      <div class="text-center mb-6">
        <span class="text-5xl font-bold text-gray-800">{{ amount }}</span>
        <span class="text-lg text-gray-400 ml-1">ml</span>
      </div>

      <!-- 滑动输入 -->
      <div v-if="inputMode === 'slider'" class="mb-4">
        <van-slider
          v-model="amount"
          :min="0"
          :max="500"
          :step="5"
          active-color="#FF8FA0"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>0ml</span>
          <span>500ml</span>
        </div>
      </div>

      <!-- 键盘输入 -->
      <div v-else class="mb-4">
        <van-field
          v-model.number="amount"
          type="digit"
          placeholder="请输入奶量"
          suffix="ml"
          class="rounded-lg"
        />
      </div>

      <!-- 模式切换 -->
      <div class="flex justify-center mb-4">
        <button
          class="text-xs text-gray-400 bg-transparent border-none underline"
          @click="inputMode = inputMode === 'slider' ? 'keyboard' : 'slider'"
        >
          {{ inputMode === 'slider' ? '切换为键盘输入' : '切换为滑动输入' }}
        </button>
      </div>

      <!-- 快速选择 -->
      <div class="flex flex-wrap gap-2 justify-center mb-4">
        <button
          v-for="a in quickAmounts"
          :key="a"
          class="segment-btn px-3"
          :class="amount === a ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'"
          @click="amount = a"
        >
          {{ a }}ml
        </button>
      </div>

      <!-- 开始时间 -->
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
        style="background-color: #FF8FA0"
        :disabled="saving"
        @click="onSave"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>
