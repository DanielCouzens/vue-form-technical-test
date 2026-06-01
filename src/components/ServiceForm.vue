<template>
  <div>
    <form v-if="!submitted" @submit.prevent="handleSubmit">
      <TextInput
        v-model="form.name"
        label="Name"
        :error="errors.name"
        @blur="validateField('name')"
      />
      <EmailInput
        v-model="form.email"
        label="Email"
        :error="errors.email"
        @blur="validateField('email')"
      />
      <PasswordInput
        v-model="form.password"
        label="Password"
        :error="errors.password"
        @blur="validateField('password')"
      />
      <DateInput
        v-model="form.dateOfBirth"
        label="Date of Birth"
        :error="errors.dateOfBirth"
        @blur="validateField('dateOfBirth')"
      />
      <SelectInput
        v-model="form.service"
        label="Service"
        :options="serviceOptions"
        placeholder="Select a service..."
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
          label="Please specify"
          :error="errors.otherService"
          data-testid="other-service-input"
          @blur="validateField('otherService')"
        />
      </Transition>
      <CheckboxInput
        v-model="form.terms"
        label="I agree to the terms and conditions"
        :error="errors.terms"
      />
      <button type="submit" data-testid="submit-button">Submit</button>
    </form>

    <div v-else data-testid="success-message">
      <p>Thank you! Your enquiry has been submitted.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import TextInput from '@/components/TextInput.vue'
import EmailInput from '@/components/EmailInput.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import DateInput from '@/components/DateInput.vue'
import SelectInput from '@/components/SelectInput.vue'
import CheckboxInput from '@/components/CheckboxInput.vue'
import type { SelectOption } from '@/components/SelectInput.vue'

type FormData = {
  name: string
  email: string
  password: string
  dateOfBirth: string
  service: string
  otherService: string
  terms: boolean
}

type ValidatorMap = {
  [K in keyof FormData]: (value: FormData[K], formData?: FormData) => string
}

const validators: ValidatorMap = {
  name: (value: string) => (value.trim().length >= 2 ? '' : 'Name must be at least 2 characters'),

  email: (value: string) => {
    if (!value) return 'Please enter a valid email address'
    const input = document.createElement('input')
    input.type = 'email'
    input.value = value
    return input.checkValidity() ? '' : 'Please enter a valid email address'
  },

  password: (value: string) =>
    value.length >= 8 && /\d/.test(value)
      ? ''
      : 'Password must be at least 8 characters and contain at least one number',

  dateOfBirth: (value: string) => {
    if (!value) return '' // Optional
    return new Date(value) < new Date() ? '' : 'Date of birth must be in the past'
  },

  service: (value: string) => (value ? '' : 'Please select a service'),

  otherService: (value: string, formData?: FormData) => {
    if (formData?.service === 'other') {
      return value.trim().length >= 2 ? '' : 'Please specify the service'
    }
    return ''
  },

  terms: (value: boolean) => (value ? '' : 'You must accept the terms and conditions'),
}

const serviceOptions: SelectOption[] = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'seo-services', label: 'SEO Services' },
  { value: 'other', label: 'Other' },
]

const form = reactive<FormData>({
  name: '',
  email: '',
  password: '',
  dateOfBirth: '',
  service: '',
  otherService: '',
  terms: false,
})

const errors = reactive<Record<keyof FormData, string>>({
  name: '',
  email: '',
  password: '',
  dateOfBirth: '',
  service: '',
  otherService: '',
  terms: '',
})

const submitted = ref(false)

function validateField(field: keyof FormData): boolean {
  const value = form[field]
  const validator = validators[field] as (value: string | boolean, formData?: FormData) => string

  const errorMessage = field === 'otherService' ? validator(value, form) : validator(value)

  errors[field] = errorMessage
  return !errorMessage
}

function handleSubmit() {
  let isValid = true

  ;(Object.keys(form) as Array<keyof FormData>).forEach((field) => {
    if (!validateField(field)) {
      isValid = false
    }
  })

  if (isValid) {
    submitted.value = true
  }
}
</script>
