import type commonEn from '@/locales/en/common.json'

// Augment i18next types for type-safe translation keys
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof commonEn
    }
  }
}
