import { useTranslation } from "react-i18next"
import { useAuth } from "../../hooks/useAuth"
import { api } from "../../services/api"
import { toast } from "sonner"
import axios from "axios"

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
      toast.success('Language preference updated')
    } catch (error) {
      console.error('Error changing language:', error)
      let errorMessage = 'Failed to update language preference'
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      toast.error(errorMessage)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`text-sm font-medium text-foreground ${className}`}
    >
      {i18n.language === 'en' ? '中' : 'EN'}
    </button>
  )
}