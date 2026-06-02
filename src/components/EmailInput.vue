<template>
  <div>
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      :value="modelValue"
      type="email"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" :id="`${inputId}-error`" role="alert" data-testid="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  modelValue: string
  placeholder?: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = useId()
</script>

<style scoped></style>
