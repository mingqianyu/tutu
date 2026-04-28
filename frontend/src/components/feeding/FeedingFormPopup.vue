<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import type { FeedingRecord, FeedingType } from '@/types'
import BreastMilkForm from './forms/BreastMilkForm.vue'
import BottleMilkForm from './forms/BottleMilkForm.vue'
import FormulaForm from './forms/FormulaForm.vue'
import SolidFoodForm from './forms/SolidFoodForm.vue'
import WaterForm from './forms/WaterForm.vue'
import DiaperForm from './forms/DiaperForm.vue'
import SleepForm from './forms/SleepForm.vue'

const props = defineProps<{
  show: boolean
  type: FeedingType | null
  record: FeedingRecord | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: []
}>()

// 表单组件映射
const formComponents: Record<FeedingType, Component> = {
  breast_milk: BreastMilkForm,
  bottle_milk: BottleMilkForm,
  formula: FormulaForm,
  solid_food: SolidFoodForm,
  water: WaterForm,
  diaper: DiaperForm,
  sleep: SleepForm,
}

const currentForm = computed(() => {
  if (!props.type) return null
  return formComponents[props.type]
})

function onSaved() {
  emit('update:show', false)
  emit('saved')
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    :style="{ height: '90%', background: 'linear-gradient(180deg, #fff9fc 0%, #fff5f9 100%)' }"
    @update:show="emit('update:show', $event)"
  >
    <component
      :is="currentForm"
      v-if="currentForm"
      :record="record"
      @saved="onSaved"
    />
  </van-popup>
</template>
