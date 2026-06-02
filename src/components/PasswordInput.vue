<template>
  <div>
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      :value="modelValue"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button type="button" data-testid="toggle-password" @click="showPassword = !showPassword">
      {{ showPassword ? t('form.fields.hidePassword') : t('form.fields.showPassword') }}
    </button>
    <span v-if="error" :id="`${inputId}-error`" role="alert" data-testid="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  label: string
  modelValue: string
  placeholder?: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const inputId = useId()
const showPassword = ref(false)
</script>

<style scoped></style>
