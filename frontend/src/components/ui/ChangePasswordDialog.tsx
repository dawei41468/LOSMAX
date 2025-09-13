import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Form, FormField, FormLabel, FormInput } from './form';
import { Button } from './button';
import { useChangePassword } from '../../hooks/usePreferences';
import { AUTH_ROUTE } from '../../routes/constants';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ isOpen, onClose, userEmail }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('toast.error.passwordMismatch');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword.mutateAsync({ current_password: currentPassword, new_password: newPassword });

      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toastSuccess('toast.success.passwordChangedLogout');
      navigate(AUTH_ROUTE);
    } catch (error: unknown) {
      console.error('Password change failed:', error);
      toastError('toast.error.passwordChange');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <DialogOverlay>
      <DialogContent 
        className="rounded-lg shadow-xl max-w-md mx-auto" 
        onClose={onClose}
        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-2xl font-bold mb-2 text-center sm:text-left">{t('component.changePasswordDialog.title')}</DialogTitle>
          <DialogDescription>{t('component.changePasswordDialog.message')}</DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit} noValidate className="space-y-2 p-4 pt-0">
          <input type="text" name="username" autoComplete="username" className="hidden" value={userEmail || ''} readOnly />
          <FormField>
            <FormLabel htmlFor="currentPassword">{t('component.changePasswordDialog.currentPassword')}</FormLabel>
            <FormInput
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full p-2 border rounded-md"
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="newPassword">{t('component.changePasswordDialog.newPassword')}</FormLabel>
            <FormInput
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full p-2 border rounded-md"
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="confirmPassword">{t('component.changePasswordDialog.confirmPassword')}</FormLabel>
            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full p-2 border rounded-md"
            />
          </FormField>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('component.changePasswordDialog.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="bg-primary text-primary-foreground rounded-md border border-primary hover:bg-blue-500/10 hover:text-primary transition-colors"
            >
              {t('component.changePasswordDialog.changeButton')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </DialogOverlay>
  );
};

export default ChangePasswordDialog;