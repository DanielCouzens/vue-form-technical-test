import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import CheckboxInput from '@/components/CheckboxInput.vue'

describe('CheckboxInput', () => {
  it('renders a checkbox input and label', () => {
    const wrapper = mount(CheckboxInput, {
      props: { label: 'I agree to the terms', modelValue: false },
    })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    expect(wrapper.find('label').text()).toBe('I agree to the terms')
  })

  it('emits update:modelValue with true when checked', async () => {
    const wrapper = mount(CheckboxInput, {
      props: { label: 'I agree to the terms', modelValue: false },
    })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('emits update:modelValue with false when unchecked', async () => {
    const wrapper = mount(CheckboxInput, {
      props: { label: 'I agree to the terms', modelValue: true },
    })
    await wrapper.find('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('displays an error message when error prop is set', () => {
    const wrapper = mount(CheckboxInput, {
      props: {
        label: 'I agree to the terms',
        modelValue: false,
        error: 'You must accept the terms',
      },
    })
    expect(wrapper.find('[data-testid="error"]').text()).toBe('You must accept the terms')
  })

  it('links label to input via id', () => {
    const wrapper = mount(CheckboxInput, {
      props: { label: 'I agree to the terms', modelValue: false },
    })
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  it('sets aria-invalid and aria-describedby when error prop is set', () => {
    const wrapper = mount(CheckboxInput, {
      props: { label: 'I agree to the terms', modelValue: false, error: 'Required' },
    })
    const input = wrapper.find('input')
    const errorEl = wrapper.find('[data-testid="error"]')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(errorEl.attributes('id'))
  })

  it('sets required and aria-required when required prop is true', () => {
    const wrapper = mount(CheckboxInput, {
      props: { label: 'I agree to the terms', modelValue: false, required: true },
    })
    const input = wrapper.find('input')
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('aria-required')).toBe('true')
  })

  it('does not set aria-describedby when no error', () => {
    const wrapper = mount(CheckboxInput, {
      props: { label: 'I agree to the terms', modelValue: false },
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('false')
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})
