import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import DateInput from '@/components/DateInput.vue'

describe('DateInput', () => {
  it('renders a label and input of type date', () => {
    const wrapper = mount(DateInput, {
      props: { label: 'Date of Birth', modelValue: '' },
    })
    expect(wrapper.find('label').text()).toBe('Date of Birth')
    expect(wrapper.find('input').attributes('type')).toBe('date')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(DateInput, {
      props: { label: 'Date of Birth', modelValue: '' },
    })
    await wrapper.find('input').setValue('1990-01-01')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1990-01-01'])
  })

  it('displays an error message when error prop is set', () => {
    const wrapper = mount(DateInput, {
      props: { label: 'Date of Birth', modelValue: '', error: 'Must be a past date' },
    })
    expect(wrapper.find('[data-testid="error"]').text()).toBe('Must be a past date')
  })

  it('links label to input via id', () => {
    const wrapper = mount(DateInput, { props: { label: 'Date of Birth', modelValue: '' } })
    const id = wrapper.find('input').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  it('sets max attribute to today to prevent future dates', () => {
    const wrapper = mount(DateInput, {
      props: { label: 'Date of Birth', modelValue: '' },
    })
    const today = new Date().toISOString().split('T')[0]
    expect(wrapper.find('input').attributes('max')).toBe(today)
  })

  it('does not set aria-describedby when no error', () => {
    const wrapper = mount(DateInput, {
      props: { label: 'Date of Birth', modelValue: '' },
    })
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('false')
    expect(wrapper.find('input').attributes('aria-describedby')).toBeUndefined()
  })
})
