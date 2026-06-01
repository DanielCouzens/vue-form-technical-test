import { reactive } from 'vue'

export type ServiceFormData = {
  name: string
  email: string
  password: string
  dateOfBirth: string
  service: string
  otherService: string
  terms: boolean
}

type ValidatorMap = {
  [K in keyof ServiceFormData]: (value: ServiceFormData[K], formData?: ServiceFormData) => string
}

const validators: ValidatorMap = {
  name: (value: string) => (value.trim().length >= 2 ? '' : 'Name must be at least 2 characters'),

  email: (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address',

  password: (value: string) =>
    value.length >= 8 && /\d/.test(value)
      ? ''
      : 'Password must be at least 8 characters and contain at least one number',

  dateOfBirth: (value: string) => {
    if (!value) return ''
    return new Date(value) < new Date() ? '' : 'Date of birth must be in the past'
  },

  service: (value: string) => (value ? '' : 'Please select a service'),

  otherService: (value: string, formData?: ServiceFormData) => {
    if (formData?.service === 'other') {
      return value.trim().length >= 2 ? '' : 'Please specify the service'
    }
    return ''
  },

  terms: (value: boolean) => (value ? '' : 'You must accept the terms and conditions'),
}

export function useFormValidation(form: ServiceFormData) {
  const errors = reactive<Record<keyof ServiceFormData, string>>({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    service: '',
    otherService: '',
    terms: '',
  })

  function validateField(field: keyof ServiceFormData): boolean {
    const value = form[field]
    const validator = validators[field] as (
      value: string | boolean,
      formData?: ServiceFormData,
    ) => string

    const errorMessage = field === 'otherService' ? validator(value, form) : validator(value)

    errors[field] = errorMessage
    return !errorMessage
  }

  function validateAll(): boolean {
    const results = (Object.keys(form) as Array<keyof ServiceFormData>).map((field) =>
      validateField(field),
    )
    return results.every(Boolean)
  }

  return { errors, validateField, validateAll }
}
