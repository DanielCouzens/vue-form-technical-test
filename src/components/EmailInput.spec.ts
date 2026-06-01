import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import EmailInput from '@/components/EmailInput.vue'

describe('EmailInput', () => {
  it('renders a label and input of type email', () => {
    const wrapper = mount(EmailInput, {
      props: { label: 'Email', modelValue: '' },
    })
    expect(wrapper.find('label').text()).toBe('Email')
    expect(wrapper.find('input').attributes('type')).toBe('email')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(EmailInput, {
      props: { label: 'Email', modelValue: '' },
    })
    await wrapper.find('input').setValue('test@example.com')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test@example.com'])
  })

  it('displays an error message when error prop is set', () => {
    const wrapper = mount(EmailInput, {
      props: { label: 'Email', modelValue: '', error: 'Invalid email' },
    })
    expect(wrapper.find('[data-testid="error"]').text()).toBe('Invalid email')
  })

  it('links label to input via id', () => {
    const wrapper = mount(EmailInput, { props: { label: 'Email', modelValue: '' } })
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })
})
