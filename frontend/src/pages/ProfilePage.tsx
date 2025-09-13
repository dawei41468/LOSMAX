import React, { useState, useEffect, useContext } from 'react';
import UserCard from '../components/ui/UserCard';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeSwitcher } from '../components/ui/theme-switcher';
import { LanguageSwitch } from '../components/ui/language-toggle';
import { AuthContext } from '../contexts/auth.context';
import { TimePicker } from '../components/ui/TimePicker';
import { useToast } from '../hooks/useToast';
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog';
import ChangePasswordDialog from '../components/ui/ChangePasswordDialog';
import { Card, CardContent } from '../components/ui/card';
import { usePreferences, useUpdatePreferences, useUpdateName, useDeleteAccount } from '../hooks/usePreferences';
import { AUTH_ROUTE } from '../routes/constants';
import axios from 'axios';

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
  
  // State for expandable preference cards
  const [expandedCards, setExpandedCards] = useState<{
    displayName: boolean;
    deadlines: boolean;
    notifications: boolean;
    accountActions: boolean;
  }>({
    displayName: false,
    deadlines: false,
    notifications: false,
    accountActions: false,
  });

  const toggleCard = (cardName: keyof typeof expandedCards) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };
  
  // Preferences via React Query
  const preferencesQuery = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const updateName = useUpdateName();
  const deleteAccount = useDeleteAccount();

  // Sync local controlled inputs when preferences load
  useEffect(() => {
    if (preferencesQuery.data) {
      setMorningDeadline(preferencesQuery.data.morning_deadline);
      setEveningDeadline(preferencesQuery.data.evening_deadline);
      setNotificationsEnabled(preferencesQuery.data.notifications_enabled);
    }
  }, [preferencesQuery.data]);

  interface UserPreferencesUpdate {
    morning_deadline?: string;
    evening_deadline?: string;
    notifications_enabled?: boolean;
  }

  const { success: toastSuccess, error: toastError } = useToast();

  const savePreference = async (preferenceUpdate: UserPreferencesUpdate) => {
    try {
      const updated = await updatePreferences.mutateAsync(preferenceUpdate);
      setMorningDeadline(updated.morning_deadline);
      setEveningDeadline(updated.evening_deadline);
      setNotificationsEnabled(updated.notifications_enabled);
      toastSuccess('toast.success.settingsSaved');
    } catch (error: unknown) {
      toastError('toast.error.settings.save');
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        // Custom error handling can be added if needed
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-surface h-20">
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
          <div id="tabs-section" className="sticky top-16 z-40 bg-surface flex border-border">
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
                <div className="flex justify-center mt-5">
                  <button
                    onClick={async () => {
                      try {
                        await logout(); // Using LOSMAX's logout
                      } catch {
                        toastError('toast.error.auth.logoutFailed');
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
                    await deleteAccount.mutateAsync();
                    toastSuccess('toast.success.accountDeleted');
                    navigate(AUTH_ROUTE);
                  } catch (error: unknown) {
                    toastError('toast.error.settings.accountDeletion');
                    if (axios.isAxiosError(error) && error.response?.data?.detail) {
                      // Custom error handling can be added if needed
                    }
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
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleCard('displayName')}
                      >
                        <h2 className="text-lg font-medium">{t('content.profile.preference.displayNameTitle')}</h2>
                        {expandedCards.displayName ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      
                      {expandedCards.displayName && (
                        <div className="mt-4">
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
                                      await updateName.mutateAsync(userName || '');
                                      toastSuccess('toast.success.nameUpdated');
                                    } catch (error: unknown) {
                                      toastError('toast.error.settings.updateName');
                                      if (axios.isAxiosError(error) && error.response?.data?.detail) {
                                        const errorMessage = typeof error.response.data.detail === 'string'
                                          ? error.response.data.detail
                                          : JSON.stringify(error.response.data.detail);
                                        toastError(errorMessage);
                                      }
                                    }
                                  }}
                                >
                                  {t('actions.update')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleCard('deadlines')}
                      >
                        <h2 className="text-lg font-medium">{t('content.profile.preference.deadlinesTitle')}</h2>
                        {expandedCards.deadlines ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      
                      {expandedCards.deadlines && (
                        <div className="mt-4">
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
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleCard('notifications')}
                      >
                        <h2 className="text-lg font-medium">{t('forms.labels.notifications')}</h2>
                        {expandedCards.notifications ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      
                      {expandedCards.notifications && (
                        <div className="mt-4">
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
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card variant="flat" size="none">
                    <CardContent className="relative py-6">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleCard('accountActions')}
                      >
                        <h2 className="text-lg font-medium">{t('content.profile.preference.accountActionsTitle')}</h2>
                        {expandedCards.accountActions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                      
                      {expandedCards.accountActions && (
                        <div className="mt-4">
                          <p className="text-sm text-center text-muted-foreground mb-4">{t('content.profile.preference.accountActionsDescription')}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <button
                              className="px-4 py-2 border border-primary rounded-md hover:bg-blue-500/10 hover:text-primary transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPasswordChange(true);
                              }}
                            >
                              {t('actions.changePassword')}
                            </button>
                            <button
                              className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(true);
                              }}
                            >
                              {t('actions.deleteAccount')}
                            </button>
                          </div>
                        </div>
                      )}
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