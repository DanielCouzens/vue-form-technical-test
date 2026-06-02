import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ServiceForm from '@/components/ServiceForm.vue'
import { createTestI18n } from '@/test-utils'

const fillValidForm = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.findComponent({ name: 'TextInput' }).vm.$emit('update:modelValue', 'Dan')
  await wrapper
    .findAllComponents({ name: 'TextInput' })
    .at(1)!
    .vm.$emit('update:modelValue', 'dan@example.com')
  await wrapper.findComponent({ name: 'PasswordInput' }).vm.$emit('update:modelValue', 'password1')
  await wrapper.findComponent({ name: 'DateInput' }).vm.$emit('update:modelValue', '1995-05-15')
  await wrapper
    .findComponent({ name: 'SelectInput' })
    .vm.$emit('update:modelValue', 'web-development')
  await wrapper.findComponent({ name: 'CheckboxInput' }).vm.$emit('update:modelValue', true)
  await wrapper.vm.$nextTick()
}

describe('ServiceForm', () => {
  it('renders all standard form fields', () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('does not render the other service field by default', () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    expect(wrapper.find('[data-testid="other-service-input"]').exists()).toBe(false)
  })

  it('renders the other service field when Other is selected', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('select').setValue('other')
    expect(wrapper.find('[data-testid="other-service-input"]').exists()).toBe(true)
  })

  it('hides the other service field when a different option is selected', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('select').setValue('other')
    await wrapper.find('select').setValue('web-development')
    expect(wrapper.find('[data-testid="other-service-input"]').exists()).toBe(false)
  })

  it('shows a success message after valid form submission', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(true)
  })

  it('does not show success message if required fields are empty', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('[data-testid="submit-button"]').trigger('click')
    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(false)
  })

  it('shows validation error messages after failed submit', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).toContain('Name must be at least 2 characters')
    expect(errorTexts).toContain('Please enter a valid email address')
    expect(errorTexts).toContain('Please select a service')
    expect(errorTexts).toContain('You must accept the terms and conditions')
  })

  it('shows an error when Other is selected but the specify field is empty', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('select').setValue('other')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).toContain('Please specify the service')
  })

  it('sets aria-invalid on inputs with errors after failed submit', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input[type="text"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input[type="email"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input[type="password"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input[type="checkbox"]').attributes('aria-invalid')).toBe('true')
  })

  it('clears an error message when a field passes validation on blur', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.find('input[type="text"]').setValue('Dan')
    await wrapper.find('input[type="text"]').trigger('blur')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).not.toContain('Name must be at least 2 characters')
  })

  it('clears a text error while typing without needing to blur', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="error"]').map((e) => e.text())).toContain(
      'Name must be at least 2 characters',
    )
    await wrapper.find('input[type="text"]').setValue('Dan')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="error"]').map((e) => e.text())).not.toContain(
      'Name must be at least 2 characters',
    )
  })

  it('clears the service error immediately when a valid option is selected', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="error"]').map((e) => e.text())).toContain(
      'Please select a service',
    )
    await wrapper.find('select').setValue('web-development')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="error"]').map((e) => e.text())).not.toContain(
      'Please select a service',
    )
  })

  it('clears the terms error immediately when the checkbox is checked', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="error"]').map((e) => e.text())).toContain(
      'You must accept the terms and conditions',
    )
    await wrapper.find('input[type="checkbox"]').setValue(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="error"]').map((e) => e.text())).not.toContain(
      'You must accept the terms and conditions',
    )
  })

  it('renders labels in French when locale is fr', () => {
    const wrapper = mount(ServiceForm, {
      global: {
        plugins: [createTestI18n('fr')],
      },
    })
    const labels = wrapper.findAll('label').map((l) => l.text())
    expect(labels).toContain('Nom')
    expect(labels).toContain('E-mail')
    expect(labels).toContain('Mot de passe')
  })

  it('renders labels in Italian when locale is it', () => {
    const wrapper = mount(ServiceForm, {
      global: {
        plugins: [createTestI18n('it')],
      },
    })
    const labels = wrapper.findAll('label').map((l) => l.text())
    expect(labels).toContain('Nome')
    expect(labels).toContain('E-mail')
    expect(labels).toContain('Password')
  })

  it('shows no error when date of birth is blurred empty', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('input[type="date"]').trigger('blur')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).not.toContain('Date of birth is required')
  })

  it('shows error when a future date of birth is entered and blurred', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('input[type="date"]').setValue('2099-01-01')
    await wrapper.find('input[type="date"]').trigger('blur')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).toContain('Date of birth must be in the past')
  })

  it('shows error when checkbox is blurred without being checked', async () => {
    const wrapper = mount(ServiceForm, { global: { plugins: [createTestI18n()] } })
    await wrapper.find('input[type="checkbox"]').trigger('blur')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).toContain('You must accept the terms and conditions')
  })

  it('retranslates existing error messages when locale changes', async () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(ServiceForm, { global: { plugins: [i18n] } })
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="error"]').map((e) => e.text())).toContain(
      'Name must be at least 2 characters',
    )
    i18n.global.locale.value = 'fr'
    await wrapper.vm.$nextTick()
    const errorsFr = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorsFr).toContain('Le nom doit comporter au moins 2 caractères')
    expect(errorsFr).not.toContain('Name must be at least 2 characters')
  })

  it('renders success message in French after valid submission', async () => {
    const i18n = createTestI18n('fr')
    const wrapper = mount(ServiceForm, {
      global: { plugins: [i18n] },
    })
    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="success-message"]').text()).toContain('Merci')
  })
})
