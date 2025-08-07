import { useTranslation } from "react-i18next"
import { useAuth } from "../../hooks/useAuth"
import { api } from "../../services/api"
import { useToast } from "../../hooks/useToast"

interface LanguageSwitchProps {
  className?: string;
}

export function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { i18n } = useTranslation()
  const { setUserLanguageContext } = useAuth()

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    try {
      await i18n.changeLanguage(newLang)
      await api.patch('/preferences', { language: newLang })
      setUserLanguageContext(newLang)
      const { success: toastSuccess } = useToast();
      toastSuccess('toast.success.languageChanged')
    } catch (error) {
      console.error('Error changing language:', error)
      const { error: toastError } = useToast();
      toastError('toast.error.languageChangeFailed')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`text-sm font-medium text-foreground ${className}`}
    >
      {i18n.language === 'en' ? '中文' : 'EN'}
    </button>
  )
}