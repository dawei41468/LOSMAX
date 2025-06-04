import React from 'react';
import { useTranslation } from 'react-i18next';

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full mx-4 sm:mx-0">
        <h3 className="text-lg font-medium mb-2 text-gray-900">
          {t('confirm_delete_dialog.title', { item: itemName })}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {message || t('confirm_delete_dialog.message', { item: itemName })}
        </p>
        <p className="text-sm text-red-600 font-semibold mb-6">
          {t('confirm_delete_dialog.warning')}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t('common.deleting') : t('common.confirm_delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;