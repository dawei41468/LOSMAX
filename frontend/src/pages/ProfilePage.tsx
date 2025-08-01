import React, { useState, useEffect, useContext } from 'react';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut } from 'lucide-react';
import { ThemeSwitcher } from '../components/ui/theme-switcher';
import { LanguageSwitch } from '../components/ui/language-toggle';
import { AuthContext } from '../contexts/auth.context';
import { TimePicker } from '../components/ui/TimePicker';
import axios from 'axios';
import { toast } from 'sonner';
import { api } from '../services/api';
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [activeTab, setActiveTab] = useState<'info' | 'preference' | 'about'>('info');
  const { userName, userEmail, userId, userRole, userLanguage, logout, setUserNameContext } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [morningDeadline, setMorningDeadline] = useState('');
  const [eveningDeadline, setEveningDeadline] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await api.get('/preferences');
        setMorningDeadline(response.data.morning_deadline);
        setEveningDeadline(response.data.evening_deadline);
        setNotificationsEnabled(response.data.notifications_enabled);
      } catch (error: unknown) {
        console.error('Failed to fetch preferences:', error);
        let errorMessage = t('settings.toast.fetch_preferences_error');
        if (axios.isAxiosError(error) && error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
        toast.error(errorMessage);
      }
    };
    fetchPreferences();
  }, [t]);

  interface UserPreferencesUpdate {
    morning_deadline?: string;
    evening_deadline?: string;
    notifications_enabled?: boolean;
  }

  const savePreference = async (preferenceUpdate: UserPreferencesUpdate) => {
    try {
      const response = await api.patch('/preferences', preferenceUpdate);
      setMorningDeadline(response.data.morning_deadline);
      setEveningDeadline(response.data.evening_deadline);
      setNotificationsEnabled(response.data.notifications_enabled);
      toast.success(t('settings.toast.settings_saved_message'));
    } catch (error: unknown) {
      console.error('Error saving preference:', error);
      let errorMessage = t('settings.toast.settings_save_error');
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background h-20" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex flex-col justify-center h-full">
          {/* First line - title center, controls right */}
          <div className="flex items-center justify-between px-4">
            <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
              {t('profile.title')}
            </h1>
            <div className="flex items-center gap-1 ml-auto">
              <ThemeSwitcher />
              <LanguageSwitch />
            </div>
          </div>
          
          {/* Second line - subtitle only */}
          <div className="flex items-center justify-center mt-1">
            <p className="text-sm text-muted whitespace-nowrap">
              {t('profile.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 text-start pt-14">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Section */}
          <Card className="card">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full border-2 border-primary flex items-center justify-center">
                <User className="w-16 h-16 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{userName || t('profile.anonymous')}</h2>
                <p className="text-muted-foreground">{userEmail || t('profile.no_email')}</p>
              </div>
            </div>
          </Card>

          {/* Tabs Section */}
          <div className="sticky top-10 z-40 bg-background flex border-border" style={{ backgroundColor: 'var(--background)' }}>
            <button
              className={`flex-1 py-3 font-medium cursor-pointer ${activeTab === 'info' ? 'border-b-2 border-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('info')}
            >
              {t('profile.tabs.info')}
            </button>
            <button
              className={`flex-1 py-3 font-medium cursor-pointer ${activeTab === 'preference' ? 'border-b-2 border-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('preference')}
            >
              {t('profile.tabs.preference')}
            </button>
            <button
              className={`flex-1 py-3 font-medium cursor-pointer ${activeTab === 'about' ? 'border-b-2 border-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('about')}
            >
              {t('profile.tabs.about')}
            </button>
          </div>
          {/* Info Tab Content */}
          {activeTab === 'info' && (
            <div className="relative min-h-[calc(100vh-200px)]">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">{t('profile.nickname')}:</span>
                  <span>{userName || t('profile.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t('profile.uid')}:</span>
                  <span>{userId || t('profile.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t('profile.role')}:</span>
                  <span>{userRole || t('profile.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t('profile.language')}:</span>
                  <span>{userLanguage || t('profile.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t('settings.preferences.morning_deadline')}:</span>
                  <span>{morningDeadline || t('profile.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t('settings.preferences.evening_deadline')}:</span>
                  <span>{eveningDeadline || t('profile.notAvailable')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t('settings.preferences.notifications_title')}:</span>
                  <span>{notificationsEnabled ? t('common.enabled') : t('common.disabled')}</span>
                </div>
              </div>
              <div className="sticky bottom-4 flex justify-center mt-5">
                <button
                  onClick={async () => {
                    try {
                      await logout(); // Using LOSMAX's logout
                    } catch (err) {
                      console.error('Logout failed:', err);
                      // TODO: Add user-facing error handling, e.g., via a toast
                    }
                  }}
                  className="w-full px-6 py-2 mt-4 border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> <span>{t('profile.signout')}</span>
                </button>
              </div>
            </div>
          )}

              <ConfirmDeleteDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={async () => {
                  try {
                    await api.delete('/auth/account');
                    toast.success(t('settings.toast.account_deletion_message'));
                    navigate('/login');
                  } catch (error: unknown) {
                    console.error('Account deletion failed:', error);
                    let errorMessage = t('settings.toast.account_deletion_error');
                    if (axios.isAxiosError(error) && error.response?.data?.detail) {
                      errorMessage = error.response.data.detail;
                    }
                    toast.error(errorMessage);
                  }
                }}
                itemName={t('settings.account.item_name')}
                message={`${t('settings.account.delete_confirm_message_p1')}\n\n${userEmail ? t('settings.account.delete_confirm_message_p2', { email: userEmail }) : ''}\n\n${t('settings.account.delete_confirm_warning')}`}
              />

              {showPasswordChange && (
                <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
                  <div className="bg-card p-4 sm:p-6 rounded-lg max-w-md w-full mx-4 sm:mx-0">
                    <h3 className="text-lg font-medium mb-2">{t('settings.account.password_change_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
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

                          navigate('/login');

                        } catch (error: unknown) {
                          console.error('Password change failed:', error);
                          let errorMessage = t('settings.toast.password_change_error');
                          if (axios.isAxiosError(error) && error.response?.data?.detail) {
                            errorMessage = typeof error.response.data.detail === 'string'
                              ? error.response.data.detail
                              : JSON.stringify(error.response.data.detail);
                          }
                          toast.error(errorMessage);
                        } finally {
                          setIsChangingPassword(false);
                        }
                      }}
                      noValidate
                    >
                      <input type="text" name="username" autoComplete="username" className="hidden" value={userEmail || ''} readOnly />
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-1 text-left">
                            {t('settings.account.current_password')}
                          </label>
                          <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            className="w-full border border-input rounded-md px-3 py-3 sm:py-2 bg-background"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-1 text-left">
                            {t('settings.account.new_password')}
                          </label>
                          <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            className="w-full border border-input rounded-md px-3 py-2 bg-background"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1 text-left">
                            {t('settings.account.confirm_password')}
                          </label>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            className="w-full border border-input rounded-md px-3 py-2 bg-background"
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
                          className="px-4 py-2 border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                          onClick={() => setShowPasswordChange(false)}
                        >
                          {t('common.cancel')}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md border border-primary hover:bg-blue-500/10 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                        >
                          {t('settings.buttons.change_password')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {/* Preference Tab Content */}
              {activeTab === 'preference' && (
                <div className="space-y-4">

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h2 className="text-lg text-center font-medium mb-3">{t('profile.display_name_title')}</h2>
                    <p className="text-sm text-center text-muted-foreground mb-4">{t('profile.display_name_description')}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="nicknameInput" className="block text-sm font-medium text-muted-foreground mb-1 text-left">{t('profile.nickname_label')}</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            id="nicknameInput"
                            name="nickname"
                            type="text"
                            value={userName || ''}
                            onChange={(e) => setUserNameContext(e.target.value)}
                            className="w-full sm:flex-1 border border-input rounded-md px-3 py-3 sm:py-2 bg-background"
                          />
                          <button
                            className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md border border-primary hover:bg-blue-500/10 hover:text-primary transition-colors"
                            onClick={async () => {
                              try {
                                await api.patch('/auth/update-name', { name: userName });
                                toast.success(t('settings.toast.name_updated_message'));
                              } catch (error: unknown) {
                                console.error("Error updating nickname:", error);
                                let errorMessage = t('settings.toast.update_name_error');
                                if (axios.isAxiosError(error) && error.response?.data?.detail) {
                                  errorMessage = typeof error.response.data.detail === 'string'
                                    ? error.response.data.detail
                                    : JSON.stringify(error.response.data.detail);
                                }
                                toast.error(errorMessage);
                              }
                            }}
                          >
                            {t('common.update_button')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h2 className="text-lg text-center font-medium mb-3">{t('settings.preferences.deadlines_title')}</h2>
                    <p className="text-sm text-center text-muted-foreground mb-4">{t('settings.preferences.deadlines_description')}</p>
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
                        <p className="text-xs text-muted-foreground mt-1">{t('settings.preferences.morning_deadline_hint')}</p>
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
                        <p className="text-xs text-muted-foreground mt-1">{t('settings.preferences.evening_deadline_hint')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h2 className="text-lg text-center font-medium mb-3">{t('settings.preferences.notifications_title')}</h2>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('settings.preferences.notifications_description')}</span>
                      <div className="focus:ring-0 focus:ring-offset-0">
                        <input
                          type="checkbox"
                          checked={notificationsEnabled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNotificationsEnabled(checked);
                            savePreference({ notifications_enabled: checked });
                          }}
                          className="form-checkbox h-5 w-5 text-primary dark:text-primary-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h2 className="text-lg text-center font-medium mb-3">{t('settings.account.actions_title')}</h2>
                    <p className="text-sm text-center text-muted-foreground mb-4">{t('settings.account.actions_description')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <button
                        className="px-4 py-2 border border-primary rounded-md hover:bg-blue-500/10 hover:text-primary transition-colors"
                        onClick={() => setShowPasswordChange(true)}
                      >
                        {t('settings.buttons.change_password')}
                      </button>
                      <button
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        {t('settings.buttons.delete_account')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* About Tab Content */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h2 className="text-lg text-center font-medium mb-3">{t('settings.about.title')}</h2>
                    <p className="text-sm text-center text-muted-foreground mb-4">{t('settings.about.subtitle')}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-center mb-2">{t('settings.about.what_is_title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="ml-6">{t('settings.about.what_is_description').split('. ')[0]}.</span>{' '}
                          {t('settings.about.what_is_description').split('. ').slice(1).join('. ')}
                        </p>
                     </div>
                      
                      <div>
                        <h3 className="font-medium mb-2 text-center text-primary">{t('settings.about.features_title')}</h3>
                        <div className="card text-start">
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            <li>{t('settings.about.feature1')}</li>
                            <li>{t('settings.about.feature2')}</li>
                            <li>{t('settings.about.feature3')}</li>
                            <li>{t('settings.about.feature4')}</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-center mb-2">{t('settings.about.how_to_use_title')}</h3>
                        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                          <li>{t('settings.about.step1')}</li>
                          <li>{t('settings.about.step2')}</li>
                          <li>{t('settings.about.step3')}</li>
                          <li>{t('settings.about.step4')}</li>
                          <li>{t('settings.about.step5')}</li>
                        </ol>
                      </div>
                      
                      <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-muted-foreground">
                        {t('settings.about.version_info')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;