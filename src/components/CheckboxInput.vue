<template>
  <div class="space-y-1">
    <div class="flex items-center gap-2">
      <input
        v-bind="$attrs"
        :id="inputId"
        type="checkbox"
        class="mt-0.5 accent-brand"
        :checked="modelValue"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <label :for="inputId" class="text-sm font-medium text-gray-700">{{ label }}</label>
    </div>
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
  modelValue: boolean
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputId = useId()
</script>
