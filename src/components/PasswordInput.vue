<template>
  <div class="space-y-1">
    <label :for="inputId" class="block text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="relative">
      <input
        v-bind="$attrs"
        :id="inputId"
        :value="modelValue"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :class="[
          'w-full border rounded-lg px-3 py-2 pr-20 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-brand focus:border-brand',
        ]"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        data-testid="toggle-password"
        class="absolute inset-y-0 right-0 px-3 text-sm text-brand hover:opacity-75"
        @click="showPassword = !showPassword"
      >
        {{ showPassword ? t('form.fields.hidePassword') : t('form.fields.showPassword') }}
      </button>
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
import { ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ inheritAttrs: false })

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
