import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string; // e.g., "account", "goal"
  isDeleting?: boolean; // Optional: for showing loading state on confirm button
  message?: string; // Optional: custom message for the dialog
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false,
  message,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <DialogOverlay>
      <DialogContent 
        className="rounded-lg shadow-xl max-w-md mx-auto" 
        onClose={onClose}
        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-2xl font-bold mb-2 text-center sm:text-left">
            {t('confirmDialog.title', { item: itemName })}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mb-4">
            {message || t('confirmDialog.message', { item: itemName })}
          </DialogDescription>
          <DialogDescription className="text-sm text-red-600 font-semibold mb-6">
            {t('confirmDialog.warning')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 p-4 pt-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t('actions.deleting') : t('actions.confirmDelete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogOverlay>
  );
};

export default ConfirmDeleteDialog;