<template>
  <div>
    <form v-if="!submitted" @submit.prevent="handleSubmit">
      <TextInput
        v-model="form.name"
        :label="t('form.fields.name')"
        :placeholder="t('form.placeholders.name')"
        :error="errors.name"
        @blur="validateField('name')"
      />
      <EmailInput
        v-model="form.email"
        :label="t('form.fields.email')"
        :placeholder="t('form.placeholders.email')"
        :error="errors.email"
        @blur="validateField('email')"
      />
      <PasswordInput
        v-model="form.password"
        :label="t('form.fields.password')"
        :placeholder="t('form.placeholders.password')"
        :error="errors.password"
        @blur="validateField('password')"
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
        />
      </Transition>
      <CheckboxInput v-model="form.terms" :label="t('form.fields.terms')" :error="errors.terms" />
      <button type="submit" data-testid="submit-button">{{ t('form.submit') }}</button>
    </form>

    <div v-else data-testid="success-message">
      <p>{{ t('form.success') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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

const { t } = useI18n()

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

function handleSubmit() {
  if (validateAll()) submitted.value = true
}
</script>
