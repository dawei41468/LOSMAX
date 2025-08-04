import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

// Centralized toast configurations
export const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  richColors: true,
  closeButton: true,
}

// Toast types with consistent styling
export const toastTypes = {
  success: (message: string, description?: string) => 
    toast.success(message, {
      description,
      ...toastConfig,
      style: {
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      },
    }),

  error: (message: string, description?: string) => 
    toast.error(message, {
      description,
      ...toastConfig,
      duration: 6000,
      style: {
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--destructive)',
      },
    }),

  warning: (message: string, description?: string) => 
    toast.warning(message, {
      description,
      ...toastConfig,
      style: {
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--warning)',
      },
    }),

  info: (message: string, description?: string) => 
    toast.info(message, {
      description,
      ...toastConfig,
      style: {
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--accent)',
      },
    }),

  loading: (message: string) => 
    toast.loading(message, {
      ...toastConfig,
      duration: Infinity,
    }),

  promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) =>
    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...toastConfig,
    }),
}

// Enhanced hook with i18n support
export const useToast = () => {
  const { t } = useTranslation()

  return {
    success: (key: string, descriptionKey?: string) => 
      toastTypes.success(t(key), descriptionKey ? t(descriptionKey) : undefined),
    
    error: (key: string, descriptionKey?: string) => 
      toastTypes.error(t(key), descriptionKey ? t(descriptionKey) : undefined),
    
    warning: (key: string, descriptionKey?: string) => 
      toastTypes.warning(t(key), descriptionKey ? t(descriptionKey) : undefined),
    
    info: (key: string, descriptionKey?: string) => 
      toastTypes.info(t(key), descriptionKey ? t(descriptionKey) : undefined),
    
    loading: (key: string) => toastTypes.loading(t(key)),
    
    promise: <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) =>
      toastTypes.promise(promise, {
        loading: t(messages.loading),
        success: t(messages.success),
        error: t(messages.error),
      }),
    
    dismiss: toast.dismiss,
  }
}

// Export original toast for direct usage
export { toast } from 'sonner'
