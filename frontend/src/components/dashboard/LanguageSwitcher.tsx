import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { toast } from 'sonner';
import axios from 'axios'; // Import axios for isAxiosError
import { useAuth } from '../../hooks/useAuth'; // Import useAuth

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { setUserLanguageContext } = useAuth(); // Get setUserLanguageContext

  const saveLanguagePreference = async (language: string) => {
    try {
      await api.patch('/preferences', { language });
      // setUserLanguageContext will also call i18n.changeLanguage and update localStorage
      // We call it here to ensure context is updated even if i18n.changeLanguage in changeLanguage was already called.
      // This also ensures localStorage is updated.
      setUserLanguageContext(language);
      toast.success('Language preference updated.');
      return true; // Indicate success
    } catch (error: unknown) {
      console.error('Error saving language preference:', error);
      let errorMessage = 'Failed to save language preference.';
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
         errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
      }
      toast.error(errorMessage);
      return false; // Indicate failure
    }
  };

  const changeLanguage = async (lang: string) => {
    try {
      // Optimistically change i18n language for immediate UI update
      // setUserLanguageContext will also call this, but doing it here ensures responsiveness
      // if saveLanguagePreference has a delay.
      await i18n.changeLanguage(lang);
      const success = await saveLanguagePreference(lang);
      if (!success) {
        // If saving failed, revert i18n language if needed (or rely on AuthProvider to correct on next load)
        // For simplicity, we'll let AuthProvider handle eventual consistency.
        // The toast from saveLanguagePreference will inform the user of the save failure.
      }
    } catch (error: unknown) {
      console.error('Error changing language (i18n part):', error);
      toast.error('Failed to apply language change locally.');
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        className={`px-2 py-1 text-sm font-medium rounded-md bg-white ${
          i18n.language === 'en' ? 'border border-blue-700 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <div className="w-px h-4 bg-gray-300"></div> {/* Vertical separator */}
      <button
        className={`px-2 py-1 text-sm font-medium rounded-md bg-white ${
          i18n.language === 'zh' ? 'border border-blue-700 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => changeLanguage('zh')}
      >
        中
      </button>
    </div>
  );
}