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
import { useFormValidation } from '@/composables/useFormValidation'
import type { ServiceFormData } from '@/composables/useFormValidation'

const serviceOptions: SelectOption[] = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'seo-services', label: 'SEO Services' },
  { value: 'other', label: 'Other' },
]

const form = reactive<ServiceFormData>({
  name: '',
  email: '',
  password: '',
  dateOfBirth: '',
  service: '',
  otherService: '',
  terms: false,
})

const { errors, validateField, validateAll } = useFormValidation(form)

const submitted = ref(false)

function handleSubmit() {
  if (validateAll()) submitted.value = true
}
</script>
