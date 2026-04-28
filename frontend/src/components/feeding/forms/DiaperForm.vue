<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
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
  useFeedingForm('diaper')

// 尿布状态
const diaperStatus = ref<'pee' | 'poop' | 'poop_pee'>('pee')
// 红屁屁
const hasRash = ref(false)
// 时间
const startTime = ref(dayjs().format('YYYY-MM-DD HH:mm'))
// 备注
const note = ref('')
// 编辑模式
const isEdit = ref(false)

onMounted(() => {
  if (props.record) {
    isEdit.value = true
    diaperStatus.value = props.record.diaper_status ?? 'pee'
    hasRash.value = !!props.record.has_rash
    startTime.value = dayjs(props.record.start_time).format('YYYY-MM-DD HH:mm')
    note.value = props.record.note ?? ''
  } else {
    loadLastRecord()
  }
})

const statusOptions = [
  { value: 'pee' as const, label: '小便', icon: 'mdi:water-outline', color: '#5DADE2' },
  { value: 'poop' as const, label: '大便', icon: 'mdi:emoticon-poop-outline', color: '#D4A76A' },
  { value: 'poop_pee' as const, label: '大小便', icon: 'mdi:water-plus-outline', color: '#FFB800' },
]

async function onSave() {
  await handleSave(
    {
      start_time: dayjs(startTime.value).format('YYYY-MM-DD HH:mm:ss'),
      diaper_status: diaperStatus.value,
      has_rash: hasRash.value,
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
      <div class="text-lg font-bold" style="color: #FFB800">
        {{ isEdit ? '编辑换尿布' : '换尿布' }}
      </div>
      <div v-if="lastTimeLabel && !isEdit" class="text-xs text-gray-400 mt-1">
        {{ lastTimeLabel }}
      </div>
    </div>

    <div class="flex-1 px-6 pt-4">
      <!-- 尿布状态选择 -->
      <div class="mb-6">
        <label class="text-sm text-gray-500 mb-3 block">尿布状态</label>
        <div class="flex gap-4 justify-center">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            class="flex w-24 flex-col items-center gap-2 rounded-xl border-2 bg-white py-4 transition-all"
            :class="diaperStatus === opt.value
              ? 'border-amber-400 shadow-sm'
              : 'border-gray-100'"
            @click="diaperStatus = opt.value"
          >
            <Icon
              :icon="opt.icon"
              class="text-3xl"
              :style="{ color: diaperStatus === opt.value ? opt.color : '#ccc' }"
            />
            <span
              class="text-sm"
              :class="diaperStatus === opt.value ? 'text-gray-800 font-bold' : 'text-gray-400'"
            >
              {{ opt.label }}
            </span>
          </button>
        </div>
      </div>

      <!-- 红屁屁 -->
      <div class="flex items-center justify-between mb-6 py-2 px-1">
        <div class="flex items-center gap-2">
          <Icon icon="mdi:alert-circle-outline" class="text-lg text-red-400" />
          <span class="text-sm text-gray-700">有红屁屁</span>
        </div>
        <van-switch v-model="hasRash" size="20px" active-color="#FF6B6B" />
      </div>

      <!-- 时间 -->
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
        style="background-color: #FFB800"
        :disabled="saving"
        @click="onSave"
      >
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
  </div>
</template>
