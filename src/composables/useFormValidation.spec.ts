import { nextTick, reactive } from 'vue'
import { describe, it, expect } from 'vitest'
import { useFormValidation } from '@/composables/useFormValidation'
import en from '@/locales/en.json'

const t = (key: string): string => {
  const keys = key.split('.')
  let result: Record<string, unknown> = en
  for (const k of keys) result = result[k] as Record<string, unknown>
  return result as unknown as string
}

const makeForm = () =>
  reactive({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    service: '',
    otherService: '',
    terms: false,
  })

describe('useFormValidation', () => {
  describe('name', () => {
    it('fails when name is empty', () => {
      const form = makeForm()
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('name')
      expect(errors.name).toBe('Name must be at least 2 characters')
    })

    it('fails when name is less than 2 characters', () => {
      const form = makeForm()
      form.name = 'D'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('name')
      expect(errors.name).toBe('Name must be at least 2 characters')
    })

    it('passes when name is 2 or more characters', () => {
      const form = makeForm()
      form.name = 'Dan'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('name')
      expect(errors.name).toBe('')
    })
  })

  describe('email', () => {
    it('fails when email is empty', () => {
      const form = makeForm()
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('email')
      expect(errors.email).toBe('Please enter a valid email address')
    })

    it('fails when email format is invalid', () => {
      const form = makeForm()
      form.email = 'notanemail'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('email')
      expect(errors.email).toBe('Please enter a valid email address')
    })

    it('passes when email format is valid', () => {
      const form = makeForm()
      form.email = 'dan@example.com'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('email')
      expect(errors.email).toBe('')
    })
  })

  describe('password', () => {
    it('fails when password is empty', () => {
      const form = makeForm()
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('password')
      expect(errors.password).toBeTruthy()
    })

    it('fails when password is less than 8 characters', () => {
      const form = makeForm()
      form.password = 'pass1'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('password')
      expect(errors.password).toBeTruthy()
    })

    it('fails when password has no number', () => {
      const form = makeForm()
      form.password = 'password'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('password')
      expect(errors.password).toBeTruthy()
    })

    it('passes when password is 8+ characters with a number', () => {
      const form = makeForm()
      form.password = 'password1'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('password')
      expect(errors.password).toBe('')
    })
  })

  describe('dateOfBirth', () => {
    it('passes when date of birth is empty (optional)', () => {
      const form = makeForm()
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('dateOfBirth')
      expect(errors.dateOfBirth).toBe('')
    })

    it('fails when date of birth is in the future', () => {
      const form = makeForm()
      form.dateOfBirth = '2099-01-01'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('dateOfBirth')
      expect(errors.dateOfBirth).toBeTruthy()
    })

    it('passes when date of birth is in the past', () => {
      const form = makeForm()
      form.dateOfBirth = '1990-01-01'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('dateOfBirth')
      expect(errors.dateOfBirth).toBe('')
    })
  })

  describe('service', () => {
    it('fails when no service is selected', () => {
      const form = makeForm()
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('service')
      expect(errors.service).toBeTruthy()
    })

    it('passes when a service is selected', () => {
      const form = makeForm()
      form.service = 'web-development'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('service')
      expect(errors.service).toBe('')
    })
  })

  describe('otherService', () => {
    it('passes when service is not other and otherService is empty', () => {
      const form = makeForm()
      form.service = 'web-development'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('otherService')
      expect(errors.otherService).toBe('')
    })

    it('fails when service is other and otherService is empty', () => {
      const form = makeForm()
      form.service = 'other'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('otherService')
      expect(errors.otherService).toBeTruthy()
    })

    it('passes when service is other and otherService is filled', () => {
      const form = makeForm()
      form.service = 'other'
      form.otherService = 'Consulting'
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('otherService')
      expect(errors.otherService).toBe('')
    })
  })

  describe('terms', () => {
    it('fails when terms are not accepted', () => {
      const form = makeForm()
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('terms')
      expect(errors.terms).toBeTruthy()
    })

    it('passes when terms are accepted', () => {
      const form = makeForm()
      form.terms = true
      const { onBlur, errors } = useFormValidation(form, t)
      onBlur('terms')
      expect(errors.terms).toBe('')
    })
  })

  describe('onInput', () => {
    it('does not validate when there is no existing error', () => {
      const form = makeForm()
      form.name = 'Dan'
      const { onInput, errors } = useFormValidation(form, t)
      form.name = 'D'
      onInput('name')
      expect(errors.name).toBe('')
    })

    it('re-validates when an error already exists', async () => {
      const form = makeForm()
      const { onBlur, onInput, errors } = useFormValidation(form, t)
      onBlur('name')
      expect(errors.name).toBeTruthy()
      form.name = 'Dan'
      onInput('name')
      await nextTick()
      expect(errors.name).toBe('')
    })
  })

  describe('handleSubmit', () => {
    it('returns false when required fields are empty', () => {
      const form = makeForm()
      const { handleSubmit } = useFormValidation(form, t)
      expect(handleSubmit()).toBe(false)
    })

    it('returns true when all required fields are valid', () => {
      const form = makeForm()
      form.name = 'Dan'
      form.email = 'dan@example.com'
      form.password = 'password1'
      form.dateOfBirth = '1990-01-01'
      form.service = 'web-development'
      form.terms = true
      const { handleSubmit } = useFormValidation(form, t)
      expect(handleSubmit()).toBe(true)
    })

    it('returns false when other is selected but otherService is empty', () => {
      const form = makeForm()
      form.name = 'Dan'
      form.email = 'dan@example.com'
      form.password = 'password1'
      form.service = 'other'
      form.otherService = ''
      form.terms = true
      const { handleSubmit } = useFormValidation(form, t)
      expect(handleSubmit()).toBe(false)
    })
  })

  it('populates all errors when handleSubmit fails', () => {
    const form = makeForm()
    const { handleSubmit, errors } = useFormValidation(form, t)
    handleSubmit()
    expect(errors.name).toBeTruthy()
    expect(errors.email).toBeTruthy()
    expect(errors.password).toBeTruthy()
    expect(errors.service).toBeTruthy()
    expect(errors.terms).toBeTruthy()
  })
})
