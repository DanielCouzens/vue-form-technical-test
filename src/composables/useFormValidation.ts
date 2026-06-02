import { nextTick, reactive } from 'vue'
import type { ServiceFormData } from '@/types'

type ValidatorMap = {
  [K in keyof ServiceFormData]: (value: ServiceFormData[K], formData?: ServiceFormData) => string
}

export function useFormValidation(form: ServiceFormData, t: (key: string) => string) {
  const validators: ValidatorMap = {
    name: (value: string) => (value.trim().length >= 2 ? '' : t('form.validation.nameMinLength')),

    email: (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : t('form.validation.emailInvalid'),

    password: (value: string) =>
      value.length >= 8 && /\d/.test(value) ? '' : t('form.validation.passwordRequirements'),

    dateOfBirth: (value: string) => {
      if (!value) return ''
      return new Date(value) < new Date() ? '' : t('form.validation.dateOfBirthFuture')
    },

    service: (value: string) => (value ? '' : t('form.validation.serviceRequired')),

    otherService: (value: string, formData?: ServiceFormData) => {
      if (formData?.service === 'other') {
        return value.trim().length >= 2 ? '' : t('form.validation.otherServiceRequired')
      }
      return ''
    },

    terms: (value: boolean) => (value ? '' : t('form.validation.termsRequired')),
  }

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

    // otherService validation depends on the selected service, so it receives the full form
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

  function onBlur(field: keyof ServiceFormData): void {
    validateField(field)
  }

  function onInput(field: keyof ServiceFormData): void {
    if (errors[field]) nextTick(() => validateField(field))
  }

  function handleSubmit(): boolean {
    return validateAll()
  }

  return { errors, onBlur, onInput, handleSubmit }
}
