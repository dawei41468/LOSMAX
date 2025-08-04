import 'react-i18next'
import enTranslations from '../locales/en-new.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enTranslations
    }
  }
}

// Helper type for translation keys
type TranslationKeys = keyof typeof enTranslations

// Recursive type for nested keys
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

export type TranslationKey = NestedKeyOf<typeof enTranslations>
