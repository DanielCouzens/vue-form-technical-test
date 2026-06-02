import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { createTestI18n } from '@/test-utils'

describe('LanguageSwitcher', () => {
  it('renders three language buttons', () => {
    const wrapper = mount(LanguageSwitcher, {
      global: { plugins: [createTestI18n()] },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons.at(0)?.text()).toBe('EN')
    expect(buttons.at(1)?.text()).toBe('FR')
    expect(buttons.at(2)?.text()).toBe('IT')
  })

  it('highlights the active locale button', () => {
    const wrapper = mount(LanguageSwitcher, {
      global: { plugins: [createTestI18n('fr')] },
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.at(1)?.attributes('aria-current')).toBe('true')
    expect(buttons.at(0)?.attributes('aria-current')).toBeUndefined()
  })

  it('switches locale when a button is clicked', async () => {
    const i18n = createTestI18n('en')
    const wrapper = mount(LanguageSwitcher, {
      global: { plugins: [i18n] },
    })
    await wrapper.findAll('button').at(2)?.trigger('click')
    expect(i18n.global.locale.value).toBe('it')
  })
})
