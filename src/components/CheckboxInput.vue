<template>
  <div>
    <input
      v-bind="$attrs"
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :required="required || undefined"
      :aria-required="required || undefined"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <label :for="inputId">{{ label }}</label>
    <span v-if="error" :id="`${inputId}-error`" role="alert" data-testid="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  label: string
  modelValue: boolean
  error?: string
  required?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputId = useId()
</script>

<style scoped></style>
