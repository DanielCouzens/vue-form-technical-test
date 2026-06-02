<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
    <div class="w-full max-w-lg bg-white rounded-xl shadow-sm p-8 relative">
      <LanguageSwitcher />
      <ServiceForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ServiceForm from '@/components/ServiceForm.vue'
</script>
