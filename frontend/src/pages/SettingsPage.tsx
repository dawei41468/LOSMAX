import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios'; // Import axios for isAxiosError
import { TimePicker } from '../components/ui/TimePicker'; // Import TimePicker
// import { Switch } from '../components/ui/switch'; // TODO: Implement or find alternative
import { toast } from 'sonner'; // Using sonner for toasts
import { useAuth } from '../hooks/useAuth'; // Corrected path
import { api } from '../services/api'; // Corrected path for LOSMAX api
// import { storageService } from '../lib/storage/storageService'; // TODO: Implement or find alternative
// import ConfirmDeleteDialog from '../components/Dialogs/ConfirmDeleteDialog'; // TODO: Implement or find alternative

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
  // const { toast } = useToast(); // Removed, using sonner's toast directly
  const { logout, setUserNameContext, userEmail: authUserEmail } = useAuth(); // Get setUserNameContext and userEmail from useAuth
  const [name, setName] = useState(localStorage.getItem('userName') || ''); // Local state for the input field
  // const userEmail = localStorage.getItem('userId'); // email is stored as userId - Now using userEmail from useAuth
  const { t } = useTranslation(); // Removed unused i18n
  // const [language, setLanguage] = useState(i18n.language); // TODO: This state is not used yet, part of commented out UI

  useEffect(() => {
    // Name is already initialized from localStorage
  }, []);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get('/preferences'); // Updated endpoint
        const preferences = response.data as UserPreferencesResponse; // Use UserPreferencesResponse type
        setMorningDeadline(preferences.morning_deadline); // Ensure field names match response
        setEveningDeadline(preferences.evening_deadline); // Ensure field names match response
        setNotificationsEnabled(preferences.notifications_enabled); // Ensure field names match response
        // setLanguage(preferences.language); // Language state is commented out, but field is in response
      } catch (error) {
        console.error('Error fetching preferences:', error);
        toast.error(t('settings.toast.fetch_preferences_error'));
      }
    };

    fetchPreferences();
  }, [t]); // Removed toast from dependencies as sonner's toast is global

  const [isDeleting, setIsDeleting] = useState(false); // Re-enabled for loading state

  const handleDeleteAccount = async () => {
    setIsDeleting(true); // Set loading state
    try {
      // const csrfToken = Cookies.get('csrfToken'); // CSRF handled by api service or not used
      await api.delete('/auth/account'); // Uses LOSMAX api service
      await logout(); // Uses LOSMAX auth context
      
      toast.success(t('settings.toast.account_deletion_message'));
    } catch (error: unknown) { // Explicitly type error
      console.error('Account deletion failed:', error);
      let errorMessage = t('settings.toast.account_deletion_error');
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
        errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false); // Reset loading state
      setShowDeleteConfirm(false); // Close the placeholder dialog
    }
  };

  const savePreference = async (preferenceUpdate: UserPreferencesUpdate) => {
    try {
      console.log('Sending preference update:', preferenceUpdate);
      const response = await api.patch<UserPreferencesResponse>('/preferences', preferenceUpdate);
      
      // Update local state with the full response from the backend
      // This ensures consistency if the backend modifies/validates any values
      setMorningDeadline(response.data.morning_deadline);
      setEveningDeadline(response.data.evening_deadline);
      setNotificationsEnabled(response.data.notifications_enabled);
      // setLanguage(response.data.language); // If language UI is active

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
      // Optionally, re-fetch all preferences to revert optimistic updates or handle complex errors
      // fetchPreferences();
    }
  };

  return (
    <div className="flex flex-col sm:p-2 max-w-4xl mx-auto"> {/* Reduced sm:p-6 to sm:p-2 */}
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
              <h2 className="text-xl font-medium mb-3">{t('settings.account.info_title')}</h2>
              <p className="text-sm text-gray-500 mb-4">{t('settings.account.info_description')}</p>
              
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
                          // Check storage first - TODO: Implement storage check if needed for LOSMAX
                          // try {
                          //   const testKey = '__storage_test__';
                          //   await storageService.setItem(testKey, 'test');
                          //   await storageService.removeItem(testKey);
                          // } catch (storageError: any) {
                          //   toast({
                          //     title: t('settings.toast.error_title'),
                          //     description: t('settings.toast.storage_error'),
                          //     variant: 'error'
                          //   });
                          //   return;
                          // }
 
                          console.log('Attempting to update name with URL:', '/auth/update-name');
                          // const csrfToken = Cookies.get('csrfToken'); // CSRF handled by api service or not used
                          interface NameUpdateResponse {
                            name: string;
                            // Potentially other user fields if returned by LOSMAX backend
                          }
                          
                          try {
                            const response = await api.patch<NameUpdateResponse>('/auth/update-name', { name }); // Adjusted API path, remove CSRF
                            
                            const updatedName = response.data?.name || '';
                            setName(updatedName); // Update local input state
                            setUserNameContext(updatedName); // Update context and localStorage
                                                        
                            toast.success(t('settings.toast.name_updated_message'));
                          } catch (error: unknown) { // Changed to unknown
                            // Reset to original name from localStorage if update fails
                            const originalName = localStorage.getItem('userName');
                            if (originalName) {
                              setName(originalName);
                            }
                            // It's good practice to re-throw the error or handle it specifically
                            console.error("Error updating name:", error);
                            let errorMessage = t('settings.toast.update_name_error');
                            if (axios.isAxiosError(error) && error.response?.data?.detail) { // Use axios.isAxiosError
                                errorMessage = error.response.data.detail;
                            } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') {
                                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
                            }
                            toast.error(errorMessage);
                          }
                        } catch (error: unknown) { // Changed to unknown
                          // Handle API errors
                          let errorMessage = t('settings.toast.update_name_error');
                          if (axios.isAxiosError(error) && error.response?.data?.detail) { // Use axios.isAxiosError
                            errorMessage = error.response.data.detail;
                          } else if (typeof error === 'object' && error !== null && 'response' in error && typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string') { // Fallback for other error structures
                            errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
                          }
                          toast.error(errorMessage);
                        }
                      }}
                    >
                      {t('settings.buttons.update')}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.account.display_name_hint')}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-medium mb-3">{t('settings.preferences.deadlines_title')}</h2>
              <p className="text-sm text-gray-500 mb-4">{t('settings.preferences.deadlines_description')}</p>
              <div className="space-y-4">
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.preferences.morning_deadline')}</label> */}
                  <TimePicker
                    label={t('settings.preferences.morning_deadline')}
                    value={morningDeadline}
                    onChange={(time: string) => {
                      setMorningDeadline(time);
                      savePreference({ morning_deadline: time });
                    }}
                    context="morningDeadline" // Provide context for default value
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('settings.preferences.morning_deadline_hint')}</p>
                </div>
                <div>
                  {/* <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.preferences.evening_deadline')}</label> */}
                  <TimePicker
                    label={t('settings.preferences.evening_deadline')}
                    value={eveningDeadline}
                    onChange={(time: string) => {
                      setEveningDeadline(time);
                      savePreference({ evening_deadline: time });
                    }}
                    context="eveningDeadline" // Provide context for default value
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('settings.preferences.evening_deadline_hint')}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-medium mb-3">{t('settings.preferences.notifications_title')}</h2>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t('settings.preferences.notifications_description')}</span>
                <div className="focus:ring-0 focus:ring-offset-0">
                  {/* <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={(checked: boolean) => { // This is for a Switch component
                      setNotificationsEnabled(checked); // Optimistic update
                      savePreference({ notifications_enabled: checked });
                    }}
                  /> */}
                   <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setNotificationsEnabled(checked); // Optimistic update
                        savePreference({ notifications_enabled: checked });
                    }}
                    className="form-checkbox h-5 w-5 text-blue-600"
                   />
                   {/* <span className="ml-2 text-sm text-gray-400">(Switch component not available)</span> */}
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-medium mb-3">{t('settings.account.actions_title')}</h2>
              <p className="text-sm text-gray-500 mb-4">{t('settings.account.actions_description')}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => setShowPasswordChange(true)}
                >
                  {t('settings.buttons.change_password')}
                </button>
                <button
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  onClick={() => setShowDeleteConfirm(true)} // This will show a state, but dialog is commented
                >
                  {t('settings.buttons.delete_account')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* <ConfirmDeleteDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          itemName="account"
        /> */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"> {/* Changed bg-opacity-50 to bg-black/30 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full mx-4 sm:mx-0">
              <h3 className="text-lg font-medium mb-2 text-gray-900">{t('settings.account.delete_confirm_title')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('settings.account.delete_confirm_message_p1')}
              </p>
              {authUserEmail && (
                <p className="text-sm text-gray-600 mb-4">
                  {t('settings.account.delete_confirm_message_p2', { email: authUserEmail })}
                </p>
              )}
              <p className="text-sm text-red-600 font-semibold mb-6">
                {t('settings.account.delete_confirm_warning')}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  {t('settings.buttons.cancel')}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? t('settings.buttons.deleting') : t('settings.buttons.confirm_delete')}
                </button>
              </div>
            </div>
          </div>
        )}


       {showPasswordChange && (
         <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"> {/* Changed bg-opacity-50 to bg-black/30 */}
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
                   // const csrfToken = Cookies.get('csrfToken'); // CSRF handled by api service or not used
                   await api.patch('/auth/change-password', { // Adjusted API path
                     currentPassword,
                     newPassword
                   }/*, { // CSRF headers removed
                     headers: {
                       'X-CSRF-Token': csrfToken,
                     },
                   }*/);
                   
                   setShowPasswordChange(false);
                   setCurrentPassword('');
                   setNewPassword('');
                   setConfirmPassword('');
                   
                   toast.success(t('settings.toast.password_changed_message_logout'));

                   logout(); // Call logout from useAuth

                 } catch (error: unknown) { // Changed to unknown
                   console.error('Password change failed:', error);
                   let errorMessage = t('settings.toast.password_change_error');
                    if (axios.isAxiosError(error) && error.response?.data?.detail) { // Use axios.isAxiosError
                        errorMessage = error.response.data.detail;
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
               <div className="space-y-4">
                 <div>
                   <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1 text-left"> {/* Added text-left */}
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
                   <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1 text-left"> {/* Added text-left */}
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
                   <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 text-left"> {/* Added text-left */}
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
                   {t('settings.buttons.cancel')}
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
        {/* Moved About tab content inside the parent div */}
        {activeTab === 'about' && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-medium mb-2">{t('settings.about.title')}</h2>
            <h3 className="text-lg text-gray-600 mb-4">{t('settings.about.subtitle')}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">{t('settings.about.what_is_title')}</h4>
                <p className="text-sm text-gray-600">
                  {t('settings.about.what_is_description')}
                </p>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-300">
                  <h4 className="font-medium text-blue-800 mb-2">{t('settings.about.features_title')}</h4>
                  <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                    <li>{t('settings.about.feature1')}</li>
                    <li>{t('settings.about.feature2')}</li>
                    <li>{t('settings.about.feature3')}</li>
                    <li>{t('settings.about.feature4')}</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">{t('settings.about.how_to_use_title')}</h4>
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
      </div> {/* This closes <div className="mt-6"> */}
    </div>
  );
};

export default SettingsPage;