import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './assets/main.css'

import en from './locales/en.json'
import fr from './locales/fr.json'
import it from './locales/it.json'

const savedLocale = localStorage.getItem('locale') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, fr, it },
})

const app = createApp(App)
app.use(i18n)
app.mount('#app')
