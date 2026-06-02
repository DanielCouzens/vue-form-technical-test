<template>
  <main class="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-sm p-8 relative">
      <LanguageSwitcher />
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">{{ t('form.title') }}</h1>
      <ServiceForm />
    </div>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ServiceForm from '@/components/ServiceForm.vue'

const { t } = useI18n()
</script>
