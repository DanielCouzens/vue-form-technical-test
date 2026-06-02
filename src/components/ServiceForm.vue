<template>
  <div>
    <form v-if="!submitted" @submit.prevent="handleSubmit" class="space-y-6">
      <TextInput
        v-model="form.name"
        :label="t('form.fields.name')"
        :placeholder="t('form.placeholders.name')"
        :error="errors.name"
        @blur="validateField('name')"
        @input="errors.name && $nextTick(() => validateField('name'))"
      />
      <EmailInput
        v-model="form.email"
        :label="t('form.fields.email')"
        :placeholder="t('form.placeholders.email')"
        :error="errors.email"
        @blur="validateField('email')"
        @input="errors.email && $nextTick(() => validateField('email'))"
      />
      <PasswordInput
        v-model="form.password"
        :label="t('form.fields.password')"
        :placeholder="t('form.placeholders.password')"
        :error="errors.password"
        @blur="validateField('password')"
        @input="errors.password && $nextTick(() => validateField('password'))"
      />
      <DateInput
        v-model="form.dateOfBirth"
        :label="t('form.fields.dateOfBirth')"
        :error="errors.dateOfBirth"
        @blur="validateField('dateOfBirth')"
      />
      <SelectInput
        v-model="form.service"
        :label="t('form.fields.service')"
        :options="serviceOptions"
        :placeholder="t('form.options.selectService')"
        :error="errors.service"
        @blur="validateField('service')"
        @change="errors.service && $nextTick(() => validateField('service'))"
      />
      <Transition
        enter-active-class="transition-opacity duration-200 ease-in-out"
        leave-active-class="transition-opacity duration-200 ease-in-out"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <TextInput
          v-if="form.service === 'other'"
          v-model="form.otherService"
          :label="t('form.fields.otherService')"
          :placeholder="t('form.placeholders.otherService')"
          :error="errors.otherService"
          data-testid="other-service-input"
          @blur="validateField('otherService')"
          @input="errors.otherService && $nextTick(() => validateField('otherService'))"
        />
      </Transition>
      <CheckboxInput
        v-model="form.terms"
        :label="t('form.fields.terms')"
        :error="errors.terms"
        @blur="validateField('terms')"
        @change="errors.terms && $nextTick(() => validateField('terms'))"
      />
      <button
        type="submit"
        data-testid="submit-button"
        class="group w-full inline-flex cursor-pointer items-center justify-center rounded-lg px-5 py-3.5 leading-normal text-gray-900 bg-linear-to-br from-cta-from to-cta-to hover:from-cta-to hover:to-cta-from"
      >
        <span
          class="font-semibold pr-0 transition-all duration-300 ease-in-out group-hover:pr-2 group-focus-visible:pr-2"
          >{{ t('form.submit') }}</span
        >
        <svg
          class="ms-0 h-5 max-w-0 opacity-0 transition-all duration-300 ease-in-out group-hover:ms-2 group-hover:max-w-5 group-hover:opacity-100 group-focus-visible:ms-2 group-focus-visible:max-w-5 group-focus-visible:opacity-100"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m9 5 7 7-7 7"
          />
        </svg>
      </button>
    </form>

    <div v-else data-testid="success-message" class="text-center py-4">
      <p class="p-5 text-xl font-semibold text-brand">{{ t('form.success') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TextInput from '@/components/TextInput.vue'
import EmailInput from '@/components/EmailInput.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import DateInput from '@/components/DateInput.vue'
import SelectInput from '@/components/SelectInput.vue'
import CheckboxInput from '@/components/CheckboxInput.vue'
import type { SelectOption } from '@/components/SelectInput.vue'
import { useFormValidation } from '@/composables/useFormValidation'
import type { ServiceFormData } from '@/composables/useFormValidation'

const { t, locale } = useI18n()

const serviceOptions = computed<SelectOption[]>(() => [
  { value: 'web-development', label: t('form.options.webDevelopment') },
  { value: 'mobile-development', label: t('form.options.mobileDevelopment') },
  { value: 'seo-services', label: t('form.options.seoServices') },
  { value: 'other', label: t('form.options.other') },
])

const form = reactive<ServiceFormData>({
  name: '',
  email: '',
  password: '',
  dateOfBirth: '',
  service: '',
  otherService: '',
  terms: false,
})

const { errors, validateField, validateAll } = useFormValidation(form, t)

const submitted = ref(false)

watch(locale, () => {
  ;(Object.keys(errors) as Array<keyof ServiceFormData>).forEach((field) => {
    if (errors[field]) validateField(field)
  })
})

function handleSubmit() {
  if (validateAll()) submitted.value = true
}
</script>
