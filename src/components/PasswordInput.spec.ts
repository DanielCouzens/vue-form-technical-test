import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import PasswordInput from '@/components/PasswordInput.vue'

describe('PasswordInput', () => {
  it('renders a label and input of type password by default', () => {
    const wrapper = mount(PasswordInput, {
      props: { label: 'Password', modelValue: '' },
    })
    expect(wrapper.find('label').text()).toBe('Password')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(PasswordInput, {
      props: { label: 'Password', modelValue: '' },
    })
    await wrapper.find('input').setValue('secret123')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['secret123'])
  })

  it('toggles input type to text when show password is clicked', async () => {
    const wrapper = mount(PasswordInput, {
      props: { label: 'Password', modelValue: '' },
    })
    await wrapper.find('[data-testid="toggle-password"]').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('toggles input type back to password on second click', async () => {
    const wrapper = mount(PasswordInput, {
      props: { label: 'Password', modelValue: '' },
    })
    await wrapper.find('[data-testid="toggle-password"]').trigger('click')
    await wrapper.find('[data-testid="toggle-password"]').trigger('click')
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('displays an error message when error prop is set', () => {
    const wrapper = mount(PasswordInput, {
      props: { label: 'Password', modelValue: '', error: 'Password is required' },
    })
    expect(wrapper.find('[data-testid="error"]').text()).toBe('Password is required')
  })

  it('links label to input via id', () => {
    const wrapper = mount(PasswordInput, { props: { label: 'Password', modelValue: '' } })
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })
})
