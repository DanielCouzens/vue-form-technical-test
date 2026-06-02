import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ServiceForm from '@/components/ServiceForm.vue'

const fillValidForm = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.findComponent({ name: 'TextInput' }).vm.$emit('update:modelValue', 'Dan')
  await wrapper
    .findComponent({ name: 'EmailInput' })
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
    const wrapper = mount(ServiceForm)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('does not render the other service field by default', () => {
    const wrapper = mount(ServiceForm)
    expect(wrapper.find('[data-testid="other-service-input"]').exists()).toBe(false)
  })

  it('renders the other service field when Other is selected', async () => {
    const wrapper = mount(ServiceForm)
    await wrapper.find('select').setValue('other')
    expect(wrapper.find('[data-testid="other-service-input"]').exists()).toBe(true)
  })

  it('hides the other service field when a different option is selected', async () => {
    const wrapper = mount(ServiceForm)
    await wrapper.find('select').setValue('other')
    await wrapper.find('select').setValue('web-development')
    expect(wrapper.find('[data-testid="other-service-input"]').exists()).toBe(false)
  })

  it('shows a success message after valid form submission', async () => {
    const wrapper = mount(ServiceForm)
    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(true)
  })

  it('does not show success message if required fields are empty', async () => {
    const wrapper = mount(ServiceForm)
    await wrapper.find('[data-testid="submit-button"]').trigger('click')
    expect(wrapper.find('[data-testid="success-message"]').exists()).toBe(false)
  })

  it('shows validation error messages after failed submit', async () => {
    const wrapper = mount(ServiceForm)
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).toContain('Name must be at least 2 characters')
    expect(errorTexts).toContain('Please enter a valid email address')
    expect(errorTexts).toContain('Please select a service')
    expect(errorTexts).toContain('You must accept the terms and conditions')
  })

  it('shows an error when Other is selected but the specify field is empty', async () => {
    const wrapper = mount(ServiceForm)
    await wrapper.find('select').setValue('other')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).toContain('Please specify the service')
  })

  it('sets aria-invalid on inputs with errors after failed submit', async () => {
    const wrapper = mount(ServiceForm)
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('input[type="text"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input[type="email"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input[type="password"]').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('select').attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('input[type="checkbox"]').attributes('aria-invalid')).toBe('true')
  })

  it('clears an error message when a field passes validation on blur', async () => {
    const wrapper = mount(ServiceForm)
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    await wrapper.find('input[type="text"]').setValue('Dan')
    await wrapper.find('input[type="text"]').trigger('blur')
    await wrapper.vm.$nextTick()
    const errorTexts = wrapper.findAll('[data-testid="error"]').map((e) => e.text())
    expect(errorTexts).not.toContain('Name must be at least 2 characters')
  })
})
