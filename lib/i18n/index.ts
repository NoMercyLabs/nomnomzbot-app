import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'

// Eagerly loaded default namespace
import commonEn from '@/locales/en/common.json'

export type SupportedLocale = 'en' | 'nl' | 'de'

const deviceLocale = getLocales()[0]?.languageCode ?? 'en'
const defaultLocale: SupportedLocale =
  (['en', 'nl', 'de'] as const).includes(deviceLocale as SupportedLocale)
    ? (deviceLocale as SupportedLocale)
    : 'en'

i18n.use(initReactI18next).init({
  lng: defaultLocale,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],

  resources: {
    en: { common: commonEn },
  },

  interpolation: {
    escapeValue: false,
  },

  saveMissing: __DEV__,
  missingKeyHandler: __DEV__
    ? (_lngs: readonly string[], ns: string, key: string) => {
        console.warn(`Missing i18n key: ${ns}:${key}`)
      }
    : undefined,

  react: {
    useSuspense: false,
  },
})

export default i18n
