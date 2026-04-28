<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { showConfirmDialog, showToast } from 'vant'
import { useFeedingStore } from '@/stores/feeding'
import { useBabyStore } from '@/stores/baby'
import type { FeedingRecord, FeedingType } from '@/types'
import FeedingNavBar from '@/components/feeding/FeedingNavBar.vue'
import DaySummaryCard from '@/components/feeding/DaySummaryCard.vue'
import FeedingTimeline from '@/components/feeding/FeedingTimeline.vue'
import FeedingQuickBar from '@/components/feeding/FeedingQuickBar.vue'
import FilterPopup from '@/components/feeding/FilterPopup.vue'
import FeedingFormPopup from '@/components/feeding/FeedingFormPopup.vue'

const feedingStore = useFeedingStore()
const babyStore = useBabyStore()

// 筛选弹窗
const showFilter = ref(false)
// 录入弹窗
const showForm = ref(false)
const formType = ref<FeedingType | null>(null)
// 编辑中的记录（null 表示新建模式）
const editingRecord = ref<FeedingRecord | null>(null)

// 当前日期标签
const dateLabel = computed(() => {
  const date = feedingStore.currentDate
  const today = dayjs().format('YYYY-MM-DD')
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

  if (date === today) return '今天'
  if (date === yesterday) return '昨天'
  return dayjs(date).format('M月D日')
})

// 加载数据
async function loadData() {
  if (!babyStore.currentBaby) return

  const babyId = babyStore.currentBaby.id
  const date = feedingStore.currentDate

  // 并行加载列表和汇总
  await Promise.all([
    feedingStore.fetchRecords({
      baby_id: babyId,
      date,
      type: feedingStore.currentFilter ?? undefined,
      page_size: 100,
    }),
    feedingStore.fetchSummary(babyId, date),
  ])
}

onMounted(() => {
  loadData()
})

// 筛选类型或日期变化时重新加载
watch(
  [() => feedingStore.currentFilter, () => feedingStore.currentDate],
  () => loadData()
)

// 打开新建弹窗
function openForm(type: FeedingType) {
  editingRecord.value = null
  formType.value = type
  showForm.value = true
}

// 录入完成后刷新
function onFormSaved() {
  loadData()
}

// 筛选选择
function onFilterSelect(type: FeedingType | null) {
  feedingStore.currentFilter = type
}

// 日历切换日期
function onCalendar() {
  const today = dayjs().format('YYYY-MM-DD')
  const current = feedingStore.currentDate

  if (current === today) {
    feedingStore.currentDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  } else {
    feedingStore.currentDate = today
  }
}

// 编辑记录
function onEditRecord(record: FeedingRecord) {
  editingRecord.value = record
  formType.value = record.type
  showForm.value = true
}

// 删除记录
async function onDeleteRecord(record: FeedingRecord) {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '删除后无法恢复，确认删除这条记录吗？',
    })

    await feedingStore.deleteRecord(record.id)
    showToast('已删除')
    loadData()
  } catch {
    // 用户取消
  }
}

// 宝宝醒了
async function onWakeUp(record: FeedingRecord) {
  const now = dayjs()
  const start = dayjs(record.start_time)
  const duration = now.diff(start, 'second')

  await feedingStore.updateRecord(record.id, {
    end_time: now.format('YYYY-MM-DD HH:mm:ss'),
    duration,
    is_ongoing: false,
  })

  showToast('宝宝醒啦！')
  loadData()
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-[#fef8fb] to-[#fcf2f8] pb-[148px]">
    <!-- 顶部导航 -->
    <FeedingNavBar
      :title="dateLabel"
      :current-filter="feedingStore.currentFilter"
      @filter="showFilter = true"
      @calendar="onCalendar"
    />

    <!-- 日汇总卡片 -->
    <DaySummaryCard
      :date-label="dateLabel"
      :month-age="babyStore.monthAge"
      :summary-list="feedingStore.daySummary"
    />

    <!-- 时间轴记录列表 -->
    <FeedingTimeline
      :records="feedingStore.records"
      @edit="onEditRecord"
      @delete="onDeleteRecord"
      @wake-up="onWakeUp"
    />

    <!-- 底部快捷录入栏 -->
    <FeedingQuickBar @select="openForm" />

    <!-- 筛选弹窗 -->
    <FilterPopup
      v-model:show="showFilter"
      :current="feedingStore.currentFilter"
      @select="onFilterSelect"
    />

    <!-- 录入弹窗 -->
    <FeedingFormPopup
      v-model:show="showForm"
      :type="formType"
      :record="editingRecord"
      @saved="onFormSaved"
    />
  </div>
</template>
