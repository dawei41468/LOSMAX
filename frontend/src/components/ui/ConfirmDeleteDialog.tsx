import React from 'react';
import { useTranslation } from 'react-i18next';
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

  if (!isOpen) return null;

  return (
    <DialogOverlay>
      <DialogContent 
        onClose={onClose}
        className="shadow-xl max-w-md mx-auto bg-card"
      >
        <DialogHeader>
          <DialogTitle>
            {t('confirmDialog.title', { item: itemName })}
          </DialogTitle>
          <DialogDescription>
            {message || t('confirmDialog.message', { item: itemName })}
          </DialogDescription>
          <DialogDescription className="text-destructive font-medium">
            {t('confirmDialog.warning')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2">
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