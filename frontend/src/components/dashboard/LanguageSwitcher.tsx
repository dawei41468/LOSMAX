import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
// import Cookies from 'js-cookie'; // Removed unused import
import { toast } from 'sonner';
import axios from 'axios'; // Import axios for isAxiosError

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const saveLanguagePreference = async (language: string) => { // Renamed for clarity
    console.log('Attempting to save language preference:', { language });
    try {
      await api.patch('/preferences', { language });
      toast.success('Language preference updated.');
    } catch (error: unknown) { // Changed to unknown
      console.error('Error saving language preference:', error);
      let errorMessage = 'Failed to save language preference.';
      if (axios.isAxiosError(error) && error.response?.data?.detail) { // Use axios.isAxiosError
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
         errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
      }
      toast.error(errorMessage);
    }
  };

  const changeLanguage = async (lang: string) => {
    try {
      await i18n.changeLanguage(lang);
      await saveLanguagePreference(lang); // Call the renamed and corrected function
      // Success toast is now handled within saveLanguagePreference
    } catch (error: unknown) { // Changed to unknown
      console.error('Error changing language:', error);
      // If saveLanguagePreference fails, it will show its own toast.
      // This catch block will primarily handle errors from i18n.changeLanguage.
      if (!axios.isAxiosError(error)) { // Avoid double-toasting if saveLanguagePreference failed
        toast.error('Failed to apply language change.');
      }
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        className={`px-2 py-1 text-sm font-medium rounded-md bg-white ${
          i18n.language === 'en' ? 'border border-primary text-primary' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <div className="w-px h-4 bg-gray-300"></div> {/* Vertical separator */}
      <button
        className={`px-2 py-1 text-sm font-medium rounded-md bg-white ${
          i18n.language === 'zh' ? 'border border-primary text-primary' : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => changeLanguage('zh')}
      >
        中
      </button>
    </div>
  );
}