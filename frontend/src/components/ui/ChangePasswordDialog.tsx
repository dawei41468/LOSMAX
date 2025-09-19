import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../hooks/useToast';
import { DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
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
        onClose={onClose}
        className="shadow-xl max-w-md mx-auto bg-card"
      >
        <DialogHeader>
          <DialogTitle>
            {t('component.changePasswordDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('component.changePasswordDialog.message')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <input type="text" name="username" autoComplete="username" className="hidden" value={userEmail || ''} readOnly />

          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              {t('component.changePasswordDialog.currentPassword')}
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              {t('component.changePasswordDialog.newPassword')}
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('component.changePasswordDialog.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('component.changePasswordDialog.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {t('component.changePasswordDialog.changeButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogOverlay>
  );
};

export default ChangePasswordDialog;