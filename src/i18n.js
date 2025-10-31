import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ru from './locales/ru.json'

const resources = {
  en: { translation: en },
  ru: { translation: ru }
}

const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('sb_locale')) || 'ru'

i18n.use(initReactI18next).init({
  resources,
  lng: saved,
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
