<template>
  <div>
    <button
      v-for="lang in languages"
      :key="lang.code"
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
