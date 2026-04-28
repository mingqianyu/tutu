<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { Icon } from '@iconify/vue'
import { useBabyStore } from '@/stores/baby'
import request from '@/utils/request'
import dayjs from 'dayjs'

const router = useRouter()
const babyStore = useBabyStore()

const nickname = ref('')
const gender = ref('')
const birthday = ref('')
const birthMethod = ref('')
const avatarUrl = ref('')
const agreed = ref(false)
const loading = ref(false)
const canSubmit = computed(() => {
  return nickname.value.trim().length > 0 && birthday.value.length > 0 && agreed.value
})

// 性别选项
const showGenderPicker = ref(false)
const genderOptions = [
  { text: '小王子', value: 'male' },
  { text: '小公主', value: 'female' },
]
const genderLabel: Record<string, string> = { male: '小王子', female: '小公主' }

// 出生日期选择
const showDatePicker = ref(false)
const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

// 生产方式
const showBirthMethodPicker = ref(false)
const birthMethodOptions = [
  { text: '顺产', value: 'natural' },
  { text: '剖腹产', value: 'cesarean' },
]
const birthMethodLabel: Record<string, string> = { natural: '顺产', cesarean: '剖腹产' }

function onGenderConfirm({ selectedOptions }: { selectedOptions: Array<{ value: string }> }) {
  gender.value = selectedOptions[0]?.value ?? ''
  showGenderPicker.value = false
}

function onDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  birthday.value = selectedValues.join('-')
  showDatePicker.value = false
}

function onBirthMethodConfirm({ selectedOptions }: { selectedOptions: Array<{ value: string }> }) {
  birthMethod.value = selectedOptions[0]?.value ?? ''
  showBirthMethodPicker.value = false
}

// 上传头像
async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await request.post<unknown, { url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    avatarUrl.value = res.url
  } catch {
    showToast('头像上传失败')
  }
}

// 提交
async function handleSubmit() {
  const nicknameValue = nickname.value.trim()

  if (!nicknameValue) {
    showToast('请输入宝宝小名')
    return
  }
  if (!birthday.value) {
    showToast('请选择出生日期')
    return
  }
  if (!agreed.value) {
    showToast('请阅读并同意协议')
    return
  }

  loading.value = true
  try {
    await babyStore.addBaby({
      nickname: nicknameValue,
      gender: (gender.value || 'unknown') as 'male' | 'female' | 'unknown',
      birthday: birthday.value,
      birth_method: (birthMethod.value || 'natural') as 'natural' | 'cesarean',
      avatar: avatarUrl.value || null,
    })
    showToast('添加成功')
    router.replace('/')
  } catch {
    showToast('添加失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="baby-add-page flex min-h-screen flex-col bg-gradient-to-b from-[#faf5f7] to-[#f5f0f3]">
    <!-- 顶部导航 -->
    <div class="px-4 pb-2 pt-[calc(env(safe-area-inset-top)+6px)]">
      <div class="relative flex h-10 items-center justify-between">
        <button class="touch-btn border-none bg-transparent text-[16px] text-[#7a7e89] transition-transform active:scale-90" @click="goBack">
          取消
        </button>
        <span class="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold text-[#2f3138]">
          添加宝宝
        </span>
        <button
          class="baby-submit-btn"
          :class="{ 'is-disabled': !canSubmit || loading }"
          :disabled="!canSubmit || loading"
          type="button"
          :aria-busy="loading"
          :aria-disabled="!canSubmit || loading"
          @click="handleSubmit"
        >
          完成
        </button>
      </div>
    </div>

    <div class="flex flex-1 flex-col">
      <!-- 头像上传区 -->
      <div class="baby-panel mx-3 mt-1 flex h-[190px] items-center justify-center">
        <label class="relative cursor-pointer">
          <div
            v-if="avatarUrl"
            class="h-[88px] w-[88px] overflow-hidden rounded-full shadow-[0_4px_14px_rgba(243,95,147,0.2)]"
          >
            <img :src="avatarUrl" class="h-full w-full object-cover" alt="" />
          </div>
          <div v-else class="avatar-placeholder flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full">
            <Icon icon="mdi:camera-outline" class="text-[32px] text-[#d0c4d4]" />
            <span class="mt-1 text-[10px] text-[#c0b6c5]">添加头像</span>
          </div>
          <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
        </label>
      </div>

      <!-- 表单 -->
      <div class="baby-panel form-card mx-3 mt-3 overflow-hidden">
        <van-field
          v-model="nickname"
          class="baby-field"
          label="宝宝小名"
          placeholder="请输入宝宝小名"
          input-align="right"
        />
        <van-field
          class="baby-field"
          label="宝宝性别"
          :model-value="genderLabel[gender] || ''"
          placeholder="未选择"
          input-align="right"
          readonly
          is-link
          @click="showGenderPicker = true"
        />
        <van-field
          class="baby-field"
          label="宝宝出生日"
          :model-value="birthday ? dayjs(birthday).format('YYYY年MM月DD日') : ''"
          placeholder="未选择"
          input-align="right"
          readonly
          is-link
          @click="showDatePicker = true"
        />
        <van-field
          class="baby-field"
          label="生产方式"
          :model-value="birthMethodLabel[birthMethod] || ''"
          placeholder="未选择"
          input-align="right"
          readonly
          is-link
          @click="showBirthMethodPicker = true"
        />
      </div>

      <!-- 协议 -->
      <div class="baby-agree mt-auto px-6 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-10">
        <van-checkbox v-model="agreed" icon-size="14">
          <span class="text-[12px] text-[#b0b2ba]">
            请阅读<span class="text-[#8f97ad]">《儿童个人信息保护规则》</span>并同意使用你的宝宝信息
          </span>
        </van-checkbox>
      </div>
    </div>

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

    <!-- 生产方式选择器 -->
    <van-popup v-model:show="showBirthMethodPicker" position="bottom" round>
      <van-picker
        :columns="birthMethodOptions"
        @confirm="onBirthMethodConfirm"
        @cancel="showBirthMethodPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.baby-add-page {
  color: #2f3138;
}

.baby-panel {
  border-radius: var(--radius-card);
  background: #fff;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.avatar-placeholder {
  background: linear-gradient(145deg, #f8f0f5, #f0eaf2);
  border: 2px dashed #e4d8e8;
  transition: transform 0.2s ease;
}

.avatar-placeholder:active {
  transform: scale(0.95);
}

.baby-submit-btn {
  height: 34px;
  min-width: 64px;
  border: none;
  border-radius: 17px;
  background: linear-gradient(135deg, #f9a0c0 0%, #f35f93 100%);
  padding: 0 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease;
  box-shadow: 0 3px 10px rgb(243 95 147 / 25%);
}

.baby-submit-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.baby-submit-btn.is-disabled {
  background: #ececef;
  color: #b9bbc3;
  box-shadow: none;
}

.baby-submit-btn:disabled {
  cursor: not-allowed;
}

.form-card :deep(.baby-field.van-cell) {
  min-height: 54px;
  padding: 0 14px;
  background: #fff;
}

.form-card :deep(.baby-field .van-field__label) {
  display: flex;
  align-items: center;
  margin-right: 16px;
  color: #2f3138;
  font-size: 15px;
  font-weight: 500;
}

.form-card :deep(.baby-field .van-field__value) {
  display: flex;
  align-items: center;
}

.form-card :deep(.baby-field .van-field__control) {
  color: #30323a;
  font-size: 15px;
}

.form-card :deep(.baby-field .van-field__control::placeholder) {
  color: #c4c6cf;
}

.form-card :deep(.baby-field .van-field__right-icon) {
  color: #cbced6;
}

.form-card :deep(.van-cell:after) {
  left: 14px;
  right: 14px;
  border-bottom-color: #ececf1;
}

.baby-agree :deep(.van-checkbox__label) {
  margin-left: 6px;
  line-height: 1.5;
}

.baby-agree :deep(.van-checkbox__icon .van-icon) {
  border-color: #cfd2da;
}
</style>
