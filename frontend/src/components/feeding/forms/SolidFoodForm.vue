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

const { lastTimeLabel, saving, loadLastRecord, handleSave } =
  useFeedingForm('solid_food')

// 食材名称
const foodName = ref('')
// 重量（g）
const amount = ref(30)
// 是否过敏
const isAllergic = ref(false)
// 开始时间
const startTime = ref(dayjs().format('YYYY-MM-DD HH:mm'))
// 备注
const note = ref('')
// 编辑模式
const isEdit = ref(false)

onMounted(() => {
  if (props.record) {
    isEdit.value = true
    foodName.value = props.record.food_name ?? ''
    amount.value = props.record.amount ?? 30
    isAllergic.value = (props.record.allergies?.length ?? 0) > 0
    startTime.value = dayjs(props.record.start_time).format('YYYY-MM-DD HH:mm')
    note.value = props.record.note ?? ''
  } else {
    loadLastRecord()
  }
})

// 常见辅食
const commonFoods = ['米糊', '蛋黄', '南瓜泥', '胡萝卜泥', '苹果泥', '香蕉泥', '土豆泥', '西兰花泥']

async function onSave() {
  if (!foodName.value.trim()) {
    foodName.value = '辅食'
  }

  await handleSave(
    {
      start_time: dayjs(startTime.value).format('YYYY-MM-DD HH:mm:ss'),
      food_name: foodName.value,
      amount: amount.value,
      unit: 'g',
      allergies: isAllergic.value ? [foodName.value] : null,
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
      <div class="text-lg font-bold" style="color: #FFA64D">
        {{ isEdit ? '编辑辅食' : '辅食' }}
      </div>
      <div v-if="lastTimeLabel && !isEdit" class="text-xs text-gray-400 mt-1">
        {{ lastTimeLabel }}
      </div>
    </div>

    <div class="flex-1 px-6 pt-2 overflow-y-auto">
      <!-- 食材名称 -->
      <div class="mb-4">
        <label class="text-sm text-gray-500 mb-2 block">食材名称</label>
        <input
          v-model="foodName"
          type="text"
          placeholder="输入食材名称"
          class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
        />
      </div>

      <!-- 常见辅食快选 -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="food in commonFoods"
          :key="food"
          class="segment-btn h-8 px-3 text-xs"
          :class="foodName === food ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'"
          @click="foodName = food"
        >
          {{ food }}
        </button>
      </div>

      <!-- 重量 -->
      <div class="mb-4">
        <label class="text-sm text-gray-500 mb-2 block">重量（克）</label>
        <van-stepper v-model="amount" :min="1" :max="500" :step="5" integer />
      </div>

      <!-- 过敏标记 -->
      <div class="flex items-center justify-between mb-4 py-2">
        <span class="text-sm text-gray-700">是否过敏</span>
        <van-switch v-model="isAllergic" size="20px" active-color="#FF6B6B" />
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
        style="background-color: #FFA64D"
        :disabled="saving"
        @click="onSave"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>
