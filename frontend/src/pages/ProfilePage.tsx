import React, { useState, useEffect, useContext } from 'react';
import UserCard from '../components/ui/UserCard';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { ThemeSwitcher } from '../components/ui/theme-switcher';
import { LanguageSwitch } from '../components/ui/language-toggle';
import { AuthContext } from '../contexts/auth.context';
import { TimePicker } from '../components/ui/TimePicker';
import axios from 'axios';
import { toast } from 'sonner';
import { api } from '../services/api';
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog';
import ChangePasswordDialog from '../components/ui/ChangePasswordDialog';
import { Card, CardContent } from '../components/ui/card';

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
              {t('content.profile.title')}
            </h1>
            <div className="flex items-center gap-1 ml-auto">
              <ThemeSwitcher />
              <LanguageSwitch />
            </div>
          </div>
          
          {/* Second line - subtitle only */}
          <div className="flex items-center justify-center mt-1">
            <p className="text-sm text-muted whitespace-nowrap">
              {t('content.profile.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 text-start pt-14">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Section */}
          <UserCard />

          {/* Tabs Section */}
          <div className="sticky top-16 z-40 bg-background flex border-border" style={{ backgroundColor: 'var(--background)' }}>
            <button
              className={`flex-1 py-3 font-medium cursor-pointer ${activeTab === 'info' ? 'border-b-2 border-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('info')}
            >
              {t('content.profile.tabs.info')}
            </button>
            <button
              className={`flex-1 py-3 font-medium cursor-pointer ${activeTab === 'preference' ? 'border-b-2 border-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('preference')}
            >
              {t('content.profile.tabs.preference')}
            </button>
            <button
              className={`flex-1 py-3 font-medium cursor-pointer ${activeTab === 'about' ? 'border-b-2 border-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('about')}
            >
              {t('content.profile.tabs.about')}
            </button>
          </div>
          {/* Info Tab Content */}
          {activeTab === 'info' && (
            <Card variant="flat" size="none">
              <CardContent className="relative py-6">
                <div className="space-y-2 text-sm py-6">
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('forms.labels.nickname')}:</span>
                    <span>{userName || t('forms.labels.notAvailable')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('forms.labels.uid')}:</span>
                    <span>{userId || t('forms.labels.notAvailable')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('forms.labels.role')}:</span>
                    <span>{userRole || t('forms.labels.notAvailable')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('forms.labels.language')}:</span>
                    <span>{userLanguage || t('forms.labels.notAvailable')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('forms.labels.morningDeadline')}:</span>
                    <span>{morningDeadline || t('forms.labels.notAvailable')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('forms.labels.eveningDeadline')}:</span>
                    <span>{eveningDeadline || t('forms.labels.notAvailable')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('forms.labels.notifications')}:</span>
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
                    <LogOut className="h-4 w-4" /> <span>{t('actions.signOut')}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
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

              <ChangePasswordDialog
                isOpen={showPasswordChange}
                onClose={() => setShowPasswordChange(false)}
                userEmail={userEmail || ''}
              />
              {/* Preference Tab Content */}
              {activeTab === 'preference' && (
                <div className="space-y-4">

                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                      <h2 className="text-lg text-center font-medium mb-3 py-3">{t('content.profile.preference.displayNameTitle')}</h2>
                      <p className="text-sm text-center text-muted-foreground mb-4">{t('content.profile.preference.displayNameDescription')}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="nicknameInput" className="block text-sm font-medium text-muted-foreground mb-1 text-left">{t('forms.labels.nickname')}</label>
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
                              {t('actions.update')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                      <h2 className="text-lg text-center font-medium mb-3 py-3">{t('content.profile.preference.deadlinesTitle')}</h2>
                      <p className="text-sm text-center text-muted-foreground mb-4">{t('content.profile.preference.deadlinesDescription')}</p>
                      <div className="space-y-4">
                        <div>
                          <TimePicker
                            label={t('forms.labels.morningDeadline')}
                            value={morningDeadline}
                            onChange={(time: string) => {
                              setMorningDeadline(time);
                              savePreference({ morning_deadline: time });
                            }}
                            context="morningDeadline"
                          />
                          <p className="text-xs text-muted-foreground mt-1">{t('content.profile.preference.morningDeadlineHint')}</p>
                        </div>
                        <div>
                          <TimePicker
                            label={t('forms.labels.eveningDeadline')}
                            value={eveningDeadline}
                            onChange={(time: string) => {
                              setEveningDeadline(time);
                              savePreference({ evening_deadline: time });
                            }}
                            context="eveningDeadline"
                          />
                          <p className="text-xs text-muted-foreground mt-1">{t('content.profile.preference.eveningDeadlineHint')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                      <h2 className="text-lg text-center font-medium mb-3 py-3">{t('forms.labels.notifications')}</h2>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('content.profile.preference.notificationsDescription')}</span>
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
                    </CardContent>
                  </Card>

                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                      <h2 className="text-lg text-center font-medium mb-3 py-3">{t('content.profile.preference.accountActionsTitle')}</h2>
                      <p className="text-sm text-center text-muted-foreground mb-4">{t('content.profile.preference.accountActionsDescription')}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <button
                          className="px-4 py-2 border border-primary rounded-md hover:bg-blue-500/10 hover:text-primary transition-colors"
                          onClick={() => setShowPasswordChange(true)}
                        >
                          {t('actions.changePassword')}
                        </button>
                        <button
                          className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          {t('actions.deleteAccount')}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {/* About Tab Content */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                    <h2 className="text-lg text-center font-medium mb-3 py-4">{t('content.profile.about.title')}</h2>
                    <p className="text-sm text-center text-muted-foreground mb-4">{t('content.profile.about.subtitle')}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-center mb-2">{t('content.profile.about.whatIs.title')}</h3>
                        <p className="text-sm text-muted-foreground">
                          <span className="ml-6">{t('content.profile.about.whatIs.description').split('. ')[0]}.</span>{' '}
                          {t('content.profile.about.whatIs.description').split('. ').slice(1).join('. ')}
                        </p>
                     </div>
                      
                      <div>
                        <h3 className="font-medium mb-2 text-center text-primary">{t('content.profile.about.features.title')}</h3>
                        <Card variant = "flat">
                          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            <li>{t('content.profile.about.features.feature1')}</li>
                            <li>{t('content.profile.about.features.feature2')}</li>
                            <li>{t('content.profile.about.features.feature3')}</li>
                            <li>{t('content.profile.about.features.feature4')}</li>
                          </ul>
                        </Card>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-center mb-2">{t('content.profile.about.howToUse.title')}</h3>
                        <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                          <li>{t('content.profile.about.howToUse.step1')}</li>
                          <li>{t('content.profile.about.howToUse.step2')}</li>
                          <li>{t('content.profile.about.howToUse.step3')}</li>
                          <li>{t('content.profile.about.howToUse.step4')}</li>
                          <li>{t('content.profile.about.howToUse.step5')}</li>
                        </ol>
                      </div>
                      
                      <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-muted-foreground">
                        {t('content.profile.about.versionInfo')}
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;