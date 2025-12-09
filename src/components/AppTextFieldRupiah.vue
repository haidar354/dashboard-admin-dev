<script setup lang="ts">
import { watch } from 'vue'
import { useCurrencyInput } from 'vue-currency-input'

const props = defineProps({
  modelValue: Number,
})

const { inputRef, formattedValue, setValue } = useCurrencyInput({
  currency: 'IDR',
  hideCurrencySymbolOnFocus: false,
  hideGroupingSeparatorOnFocus: false,
  precision: 0,
  valueRange: { min: 0 },
  locale: 'ID',
})

watch(
  () => props.modelValue,
  value => {
    setValue(value || null)
  },
)
</script>

<template>
  <VTextField
    ref="inputRef"
    v-model="formattedValue"
  />
</template>
