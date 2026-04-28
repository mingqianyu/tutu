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
  useFeedingForm('water')

// 水量（ml）
const amount = ref(30)
// 开始时间
const startTime = ref(dayjs().format('YYYY-MM-DD HH:mm'))
// 备注
const note = ref('')
// 编辑模式
const isEdit = ref(false)

onMounted(async () => {
  if (props.record) {
    isEdit.value = true
    amount.value = props.record.amount ?? 30
    startTime.value = dayjs(props.record.start_time).format('YYYY-MM-DD HH:mm')
    note.value = props.record.note ?? ''
  } else {
    await loadLastRecord()
    if (lastRecord.value?.amount) {
      amount.value = lastRecord.value.amount
    }
  }
})

const quickAmounts = [10, 20, 30, 50, 80, 100]

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
      <div class="text-lg font-bold" style="color: #5DADE2">
        {{ isEdit ? '编辑喝水' : '喝水' }}
      </div>
      <div v-if="lastTimeLabel && !isEdit" class="text-xs text-gray-400 mt-1">
        {{ lastTimeLabel }}
      </div>
    </div>

    <div class="flex-1 px-6 pt-2">
      <!-- 水量显示 -->
      <div class="text-center mb-6">
        <span class="text-5xl font-bold text-gray-800">{{ amount }}</span>
        <span class="text-lg text-gray-400 ml-1">ml</span>
      </div>

      <!-- 滑动输入 -->
      <div class="mb-4">
        <van-slider
          v-model="amount"
          :min="0"
          :max="200"
          :step="5"
          active-color="#5DADE2"
        />
        <div class="flex justify-between text-xs text-gray-400 mt-1">
          <span>0ml</span>
          <span>200ml</span>
        </div>
      </div>

      <!-- 快速选择 -->
      <div class="flex flex-wrap gap-2 justify-center mb-4">
        <button
          v-for="a in quickAmounts"
          :key="a"
          class="segment-btn px-3"
          :class="amount === a ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
          @click="amount = a"
        >
          {{ a }}ml
        </button>
      </div>

      <!-- 开始时间 -->
      <div class="mb-4">
        <label class="text-sm text-gray-500 mb-2 block">时间</label>
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
        style="background-color: #5DADE2"
        :disabled="saving"
        @click="onSave"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>
