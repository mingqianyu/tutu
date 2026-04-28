<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Icon } from '@iconify/vue'
import { useBabyStore } from '@/stores/baby'
import type { Baby } from '@/types'
import request from '@/utils/request'
import dayjs from 'dayjs'

const router = useRouter()
const babyStore = useBabyStore()

const baby = computed(() => babyStore.currentBaby)

// 编辑弹窗
const showNicknamePicker = ref(false)
const showGenderPicker = ref(false)
const showDatePicker = ref(false)
const showRelationPicker = ref(false)
const editNickname = ref(baby.value?.nickname || '')

const genderOptions = [
  { text: '小王子', value: 'male' },
  { text: '小公主', value: 'female' },
]
const genderLabel: Record<string, string> = { male: '小王子', female: '小公主', unknown: '未设置' }

const relationOptions = [
  { text: '妈妈', value: '妈妈' },
  { text: '爸爸', value: '爸爸' },
  { text: '奶奶', value: '奶奶' },
  { text: '爷爷', value: '爷爷' },
]

const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

function goBack() {
  router.back()
}

async function updateField(field: string, value: string) {
  if (!baby.value) return
  try {
    await babyStore.updateBaby(baby.value.id, { [field]: value } as Record<string, string>)
    showToast('更新成功')
  } catch {
    showToast('更新失败')
  }
}

function onNicknameConfirm() {
  if (editNickname.value.trim()) {
    updateField('nickname', editNickname.value.trim())
  }
  showNicknamePicker.value = false
}

function onGenderConfirm({ selectedOptions }: { selectedOptions: Array<{ value: string }> }) {
  updateField('gender', selectedOptions[0]?.value ?? '')
  showGenderPicker.value = false
}

function onDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  updateField('birthday', selectedValues.join('-'))
  showDatePicker.value = false
}

function onRelationConfirm({ selectedOptions }: { selectedOptions: Array<{ value: string }> }) {
  updateField('relation', selectedOptions[0]?.value ?? '')
  showRelationPicker.value = false
}

// 上传头像
async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !baby.value) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await request.post<unknown, Baby>(`/babies/${baby.value.id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    // 拦截器已解包，res 就是 Baby 对象
    if (res) {
      babyStore.setCurrentBaby(res)
    }
    showToast('头像更新成功')
  } catch {
    showToast('头像上传失败')
  } finally {
    input.value = ''
  }
}

// 上传背景图
async function handleBgUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !baby.value) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await request.post<unknown, Baby>(`/babies/${baby.value.id}/background`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    // 拦截器已解包，res 就是 Baby 对象
    if (res) {
      babyStore.setCurrentBaby(res)
    }
    showToast('背景图更新成功')
  } catch {
    showToast('背景图上传失败')
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="baby-info-page min-h-screen bg-[var(--color-bg-secondary)]">
    <!-- 顶部导航 -->
    <div class="info-nav relative flex h-12 items-center justify-center px-4">
      <button class="touch-btn absolute left-1 flex items-center justify-center border-none bg-transparent transition-transform active:scale-90" @click="goBack">
        <Icon icon="mdi:chevron-left" class="text-[26px] text-[#575b65]" />
      </button>
      <span class="text-[18px] font-bold text-[#2f3139]">宝宝信息</span>
    </div>

    <!-- 背景图 + 头像 -->
    <div class="info-banner relative mx-3 mt-3 h-52 overflow-hidden bg-gradient-to-br from-pink-200 via-pink-100 to-rose-50">
      <img
        v-if="baby?.background"
        :src="baby.background"
        class="absolute inset-0 w-full h-full object-cover"
        alt=""
      />
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>

      <!-- 换背景按钮 -->
      <label class="absolute right-3 top-3 flex cursor-pointer items-center gap-1 rounded-full bg-black/30 px-2.5 py-1.5 text-[11px] text-white backdrop-blur-sm transition-transform active:scale-95">
        <Icon icon="mdi:image-outline" class="text-[12px]" />
        换背景
        <input type="file" accept="image/*" class="hidden" @change="handleBgUpload" />
      </label>

      <!-- 头像 -->
      <label class="absolute bottom-3 left-3 cursor-pointer">
        <div class="info-avatar relative h-[68px] w-[68px] overflow-hidden rounded-full bg-gray-100">
          <img
            v-if="baby?.avatar"
            :src="baby.avatar"
            class="w-full h-full object-cover"
            alt=""
          />
          <div v-else class="w-full h-full flex items-center justify-center text-3xl">👶</div>
          <div class="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
            <Icon icon="mdi:camera" class="text-[11px] text-[#9b9ea8]" />
          </div>
        </div>
        <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
      </label>
    </div>

    <!-- 信息列表 -->
    <div class="info-card mx-3 mt-3 overflow-hidden bg-white">
      <van-cell
        title="宝宝小名"
        :value="baby?.nickname || ''"
        is-link
        @click="editNickname = baby?.nickname || ''; showNicknamePicker = true"
      />
      <van-cell
        title="宝宝性别"
        :value="genderLabel[baby?.gender || 'unknown']"
        is-link
        @click="showGenderPicker = true"
      />
      <van-cell
        title="宝宝出生日"
        :value="baby?.birthday ? dayjs(baby.birthday).format('YYYY年MM月DD日') : ''"
        is-link
        @click="showDatePicker = true"
      />
      <van-cell
        title="我是宝宝的"
        :value="baby?.relation || ''"
        is-link
        @click="showRelationPicker = true"
      />
    </div>

    <!-- 退出亲友团 -->
    <div class="mx-3 mt-3">
      <van-button block plain color="#ee0a24" class="exit-btn rounded-[20px]">
        退出亲友团
      </van-button>
    </div>

    <!-- 小名编辑弹窗 -->
    <van-dialog
      v-model:show="showNicknamePicker"
      title="修改小名"
      show-cancel-button
      @confirm="onNicknameConfirm"
    >
      <div class="px-4 py-2">
        <van-field v-model="editNickname" placeholder="请输入宝宝小名" />
      </div>
    </van-dialog>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" position="bottom" round>
      <van-picker
        :columns="genderOptions"
        @confirm="onGenderConfirm"
        @cancel="showGenderPicker = false"
      />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 关系选择器 -->
    <van-popup v-model:show="showRelationPicker" position="bottom" round>
      <van-picker
        :columns="relationOptions"
        @confirm="onRelationConfirm"
        @cancel="showRelationPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.info-nav {
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
}

.info-banner {
  border-radius: var(--radius-banner);
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%), 0 1px 4px rgb(0 0 0 / 4%);
}

.info-avatar {
  border: 2.5px solid rgb(255 255 255 / 90%);
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
}

.info-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.info-card :deep(.van-cell) {
  min-height: 56px;
  padding: 0 16px;
}

.info-card :deep(.van-cell__title) {
  display: flex;
  align-items: center;
  color: #2f3139;
  font-size: 15px;
  font-weight: 500;
}

.info-card :deep(.van-cell__value) {
  display: flex;
  align-items: center;
  color: #9095a1;
  font-size: 15px;
}

.info-card :deep(.van-cell:after) {
  left: 16px;
  right: 16px;
  border-bottom-color: #f0eaf2;
}

.exit-btn :deep(.van-button__text) {
  color: #de5e68;
  font-size: 15px;
  font-weight: 500;
}
</style>
