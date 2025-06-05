import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Import axios for isAxiosError
import { TimePicker } from '../components/ui/TimePicker'; // Import TimePicker
// import { Switch } from '../components/ui/switch'; // TODO: Implement or find alternative
import { toast } from 'sonner'; // Using sonner for toasts
import { useAuth } from '../hooks/useAuth'; // Corrected path
import { api } from '../services/api'; // Corrected path for LOSMAX api
// import { storageService } from '../lib/storage/storageService'; // TODO: Implement or find alternative
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog';

// Define a type for the expected API response structure, matching Pydantic model
interface UserPreferencesResponse {
  morning_deadline: string;
  evening_deadline: string;
  notifications_enabled: boolean;
  language: string;
}

// For PATCH requests, all fields are optional
interface UserPreferencesUpdate {
  morning_deadline?: string;
  evening_deadline?: string;
  notifications_enabled?: boolean;
  language?: string;
}

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('preferences');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [morningDeadline, setMorningDeadline] = useState('09:00 AM');
  const [eveningDeadline, setEveningDeadline] = useState('10:00 PM');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { logout, setUserNameContext, userEmail: authUserEmail } = useAuth();
  const [name, setName] = useState(localStorage.getItem('userName') || '');
  const { t } = useTranslation();

  const [isDeletingAccount, setIsDeletingAccount] = useState(false); // Renamed for clarity

  // Fetch user preferences on component mount
  React.useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get<UserPreferencesResponse>('/preferences');
        setMorningDeadline(response.data.morning_deadline);
        setEveningDeadline(response.data.evening_deadline);
        setNotificationsEnabled(response.data.notifications_enabled);
      } catch (error: unknown) {
        console.error('Failed to fetch preferences:', error);
        let errorMessage = t('settings.toast.fetch_preferences_error');
        if (axios.isAxiosError(error) && error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
          errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
        }
        toast.error(errorMessage);
      }
    };
    fetchPreferences();
  }, [t]); // Depend on t to re-fetch if language changes

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await api.delete('/auth/account');
      await logout();
      toast.success(t('settings.toast.account_deletion_message'));
      // No redirect here, logout handles it
    } catch (error: unknown) {
      console.error('Account deletion failed:', error);
      let errorMessage = t('settings.toast.account_deletion_error');
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
        errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const savePreference = async (preferenceUpdate: UserPreferencesUpdate) => {
    try {
      console.log('Sending preference update:', preferenceUpdate);
      const response = await api.patch<UserPreferencesResponse>('/preferences', preferenceUpdate);
      
      setMorningDeadline(response.data.morning_deadline);
      setEveningDeadline(response.data.evening_deadline);
      setNotificationsEnabled(response.data.notifications_enabled);

      toast.success(t('settings.toast.settings_saved_message'));
    } catch (error: unknown) {
      console.error('Error saving preference:', error);
      let errorMessage = t('settings.toast.settings_save_error');
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
        errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col sm:p-2 max-w-4xl mx-auto text-left">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-grow px-3 py-3 sm:flex-grow-0 sm:px-4 sm:py-2 font-medium text-sm sm:text-base ${activeTab === 'preferences' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('preferences')}
        >
          {t('settings.tabs.preferences')}
        </button>
        <button
          className={`flex-grow px-3 py-3 sm:flex-grow-0 sm:px-4 sm:py-2 font-medium text-sm sm:text-base ${activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('about')}
        >
          {t('settings.tabs.about')}
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl text-center font-medium mb-3">{t('settings.account.info_title')}</h2>
              <p className="text-sm text-center text-gray-500 mb-4">{t('settings.account.info_description')}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('settings.account.email_label')}</label>
                  <div className="text-sm">{authUserEmail}</div>
                </div>
                
                <div>
                  <label htmlFor="displayNameInput" className="block text-sm font-medium text-gray-600 mb-1">{t('settings.account.display_name_label')}</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="displayNameInput"
                      name="displayName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full sm:flex-1 border border-gray-300 rounded-md px-3 py-3 sm:py-2"
                    />
                    <button
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={async () => {
                        try {
                          console.log('Attempting to update name with URL:', '/auth/update-name');
                          interface NameUpdateResponse {
                            name: string;
                          }
                          
                          try {
                            const response = await api.patch<NameUpdateResponse>('/auth/update-name', { name });
                            
                            const updatedName = response.data?.name || '';
                            setName(updatedName);
                            setUserNameContext(updatedName);
                                                        
                            toast.success(t('settings.toast.name_updated_message'));
                          } catch (error: unknown) {
                            const originalName = localStorage.getItem('userName');
                            if (originalName) {
                              setName(originalName);
                            }
                            console.error("Error updating name:", error);
                            let errorMessage = t('settings.toast.update_name_error');
                            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                                errorMessage = error.response.data.detail;
                            } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
                                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
                            }
                            toast.error(errorMessage);
                          }
                        } catch (error: unknown) {
                          let errorMessage = t('settings.toast.update_name_error');
                          if (axios.isAxiosError(error) && error.response?.data?.detail) {
                            errorMessage = error.response.data.detail;
                          } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
                            errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
                          }
                          toast.error(errorMessage);
                        }
                      }}
                    >
                      {t('common.update_button')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.account.display_name_hint')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl text-center font-medium mb-3">{t('settings.preferences.deadlines_title')}</h2>
              <p className="text-sm text-center text-gray-500 mb-4">{t('settings.preferences.deadlines_description')}</p>
              <div className="space-y-4">
                <div>
                  <TimePicker
                    label={t('settings.preferences.morning_deadline')}
                    value={morningDeadline}
                    onChange={(time: string) => {
                      setMorningDeadline(time);
                      savePreference({ morning_deadline: time });
                    }}
                    context="morningDeadline"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('settings.preferences.morning_deadline_hint')}</p>
                </div>
                <div>
                  <TimePicker
                    label={t('settings.preferences.evening_deadline')}
                    value={eveningDeadline}
                    onChange={(time: string) => {
                      setEveningDeadline(time);
                      savePreference({ evening_deadline: time });
                    }}
                    context="eveningDeadline"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('settings.preferences.evening_deadline_hint')}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl text-center font-medium mb-3">{t('settings.preferences.notifications_title')}</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('settings.preferences.notifications_description')}</span>
                <div className="focus:ring-0 focus:ring-offset-0">
                   <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setNotificationsEnabled(checked);
                        savePreference({ notifications_enabled: checked });
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600"
                   />
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl text-center font-medium mb-3">{t('settings.account.actions_title')}</h2>
              <p className="text-sm text-center text-gray-500 mb-4">{t('settings.account.actions_description')}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => setShowPasswordChange(true)}
                >
                  {t('settings.buttons.change_password')}
                </button>
                <button
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  {t('settings.buttons.delete_account')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <ConfirmDeleteDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          itemName={t('settings.account.item_name')}
          message={`${t('settings.account.delete_confirm_message_p1')}\n\n${authUserEmail ? t('settings.account.delete_confirm_message_p2', { email: authUserEmail }) : ''}\n\n${t('settings.account.delete_confirm_warning')}`}
          isDeleting={isDeletingAccount}
        />
 
        {showPasswordChange && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full mx-4 sm:mx-0">
              <h3 className="text-lg font-medium mb-2">{t('settings.account.password_change_title')}</h3>
              <p className="text-sm text-gray-600 mb-6">
                {t('settings.account.password_change_message')}
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) {
                    toast.error(t('settings.toast.password_mismatch'));
                    return;
                  }
 
                  setIsChangingPassword(true);
                  try {
                    await api.patch('/auth/change-password', {
                      current_password: currentPassword,
                      new_password: newPassword
                    });
                    
                    setShowPasswordChange(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    
                    toast.success(t('settings.toast.password_changed_message_logout'));
 
                    logout();
 
                  } catch (error: unknown) {
                    console.error('Password change failed:', error);
                    let errorMessage = t('settings.toast.password_change_error');
                     if (axios.isAxiosError(error) && error.response?.data?.detail) {
                         // If detail is an object (e.g., Pydantic validation errors), stringify it
                         errorMessage = typeof error.response.data.detail === 'string'
                           ? error.response.data.detail
                           : JSON.stringify(error.response.data.detail);
                     } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
                         errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
                     }
                    toast.error(errorMessage);
                  } finally {
                    setIsChangingPassword(false);
                  }
                }}
                noValidate
              >
                {/* Hidden username field for accessibility */}
                <input type="text" name="username" autoComplete="username" className="hidden" value={authUserEmail || ''} readOnly />
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      {t('settings.account.current_password')}
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      {t('settings.account.new_password')}
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      {t('settings.account.confirm_password')}
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    onClick={() => setShowPasswordChange(false)}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {t('settings.buttons.change_password')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
         {activeTab === 'about' && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-medium mb-2 text-center">{t('settings.about.title')}</h2>
            <h3 className="text-lg text-gray-600 mb-4 text-center">{t('settings.about.subtitle')}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1 text-center">{t('settings.about.what_is_title')}</h4>
                <p className="text-sm text-gray-600">
                  <span className="ml-6">{t('settings.about.what_is_description').split('. ')[0]}.</span>{' '}
                  {t('settings.about.what_is_description').split('. ').slice(1).join('. ')}
                </p>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-300">
                  <h4 className="font-medium text-blue-800 mb-2 text-center">{t('settings.about.features_title')}</h4>
                  <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                    <li>{t('settings.about.feature1')}</li>
                    <li>{t('settings.about.feature2')}</li>
                    <li>{t('settings.about.feature3')}</li>
                    <li>{t('settings.about.feature4')}</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 text-center">{t('settings.about.how_to_use_title')}</h4>
                <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                  <li>{t('settings.about.step1')}</li>
                  <li>{t('settings.about.step2')}</li>
                  <li>{t('settings.about.step3')}</li>
                  <li>{t('settings.about.step4')}</li>
                  <li>{t('settings.about.step5')}</li>
                </ol>
                
                <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-400">
                  {t('settings.about.version_info')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;