<template>
  <div class="space-y-1">
    <label :for="inputId" class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <select
      v-bind="$attrs"
      :id="inputId"
      :value="modelValue"
      :class="[
        'w-full border rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2',
        error
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-brand focus:border-brand',
      ]"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span
      v-if="error"
      :id="`${inputId}-error`"
      role="alert"
      data-testid="error"
      class="text-sm text-red-600"
      >{{ error }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import type { SelectOption } from '@/types'

defineOptions({ inheritAttrs: false })

defineProps<{
  label: string
  modelValue: string
  options: SelectOption[]
  error?: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
</script>

<style scoped></style>
