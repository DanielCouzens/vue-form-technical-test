import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import SelectInput from '@/components/SelectInput.vue'

const options = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'seo-services', label: 'SEO Services' },
  { value: 'other', label: 'Other' },
]

describe('SelectInput', () => {
  it('renders a label and select element', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options },
    })
    expect(wrapper.find('label').text()).toBe('Service')
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('renders the correct number of options', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options },
    })
    expect(wrapper.findAll('option')).toHaveLength(options.length)
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options },
    })
    await wrapper.find('select').setValue('other')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['other'])
  })

  it('displays an error message when error prop is set', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options, error: 'Please select a service' },
    })
    expect(wrapper.find('[data-testid="error"]').text()).toBe('Please select a service')
  })

  it('sets aria-invalid and aria-describedby when error prop is set', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options, error: 'Required' },
    })
    const select = wrapper.find('select')
    const errorEl = wrapper.find('[data-testid="error"]')
    expect(select.attributes('aria-invalid')).toBe('true')
    expect(select.attributes('aria-describedby')).toBe(errorEl.attributes('id'))
  })

  it('does not set aria-invalid or aria-describedby when there is no error', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options },
    })
    const select = wrapper.find('select')
    expect(select.attributes('aria-invalid')).toBe('false')
    expect(select.attributes('aria-describedby')).toBeUndefined()
  })

  it('links label to select via id', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options },
    })
    const id = wrapper.find('select').attributes('id')
    expect(id).toBeTruthy()
    expect(wrapper.find('label').attributes('for')).toBe(id)
  })

  it('renders a disabled placeholder option when placeholder prop is set', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options, placeholder: 'Select a service...' },
    })
    const placeholder = wrapper.find('option[value=""]')
    expect(placeholder.exists()).toBe(true)
    expect(placeholder.text()).toBe('Select a service...')
    expect(placeholder.attributes('disabled')).toBeDefined()
  })

  it('does not render a placeholder option when placeholder prop is not set', () => {
    const wrapper = mount(SelectInput, {
      props: { label: 'Service', modelValue: '', options },
    })
    expect(wrapper.find('option[value=""]').exists()).toBe(false)
    expect(wrapper.findAll('option')).toHaveLength(options.length)
  })
})
