import { useTranslation } from "react-i18next"
import { useAuth } from "../../hooks/useAuth"
import { api } from "../../services/api"
import { useToast } from "../../hooks/useToast"

interface LanguageSwitchProps {
  className?: string;
}

export function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { i18n } = useTranslation()
  const { setUserLanguageContext, isAuthenticated } = useAuth()
  const { success: toastSuccess, error: toastError } = useToast();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en'
    try {
      await i18n.changeLanguage(newLang)
      // Always persist locally first (works for both unauthenticated and authenticated states)
      setUserLanguageContext(newLang)

      // Only persist to backend when authenticated
      if (isAuthenticated) {
        await api.patch('/preferences', { language: newLang })
      }

      // Show success toast only when authenticated (no toast on auth pages)
      if (isAuthenticated) {
        toastSuccess('toast.success.languageChanged')
      }
    } catch (error) {
      console.error('Error changing language:', error)
      // Show error toast only when authenticated
      if (isAuthenticated) {
        toastError('toast.error.languageChangeFailed')
      }
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