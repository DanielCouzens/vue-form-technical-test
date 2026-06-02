<template>
  <div class="space-y-1">
    <label :for="inputId" class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="inputId"
      :value="modelValue"
      type="date"
      :max="today"
      :class="[
        'w-full border rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2',
        error
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-brand focus:border-brand',
      ]"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
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

defineOptions({ inheritAttrs: false })

defineProps<{
  label: string
  modelValue: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()

const today = new Date().toISOString().split('T')[0]
</script>
