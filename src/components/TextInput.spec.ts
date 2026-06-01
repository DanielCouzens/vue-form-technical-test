import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TextInput from '@/components/TextInput.vue'

describe('TextInput', () => {
  it('renders a label and input', () => {
    const wrapper = mount(TextInput, {
      props: { label: 'Name', modelValue: '' },
    })
    expect(wrapper.find('label').text()).toBe('Name')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(TextInput, {
      props: { label: 'Name', modelValue: '' },
    })
    await wrapper.find('input').setValue('Dan')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Dan'])
  })

  it('displays an error message when error prop is set', () => {
    const wrapper = mount(TextInput, {
      props: { label: 'Name', modelValue: '', error: 'Name is required' },
    })
    expect(wrapper.find('[data-testid="error"]').text()).toBe('Name is required')
  })

  it('links label to input via id', () => {
    const wrapper = mount(TextInput, { props: { label: 'Full Name', modelValue: '' } })
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  it('sets aria-invalid and aria-describedby when error is present', () => {
    const wrapper = mount(TextInput, {
      props: { label: 'Name', modelValue: '', error: 'Name is required' },
    })
    const input = wrapper.find('input')
    const id = input.attributes('id')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(`${id}-error`)
    expect(wrapper.find('[data-testid="error"]').attributes('id')).toBe(`${id}-error`)
  })

  it('does not set aria-describedby when no error', () => {
    const wrapper = mount(TextInput, {
      props: { label: 'Name', modelValue: '' },
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('false')
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})
