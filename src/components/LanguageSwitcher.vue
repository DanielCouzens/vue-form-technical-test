<template>
  <div class="absolute top-8 right-8 inline-flex gap-1">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="[
        'px-3 py-1 text-sm rounded-full',
        locale === lang.code
          ? 'bg-brand text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      ]"
      :aria-current="locale === lang.code ? 'true' : undefined"
      @click="switchLocale(lang.code)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'it', label: 'IT' },
]

function switchLocale(code: string) {
  locale.value = code
  localStorage.setItem('locale', code)
}
</script>
