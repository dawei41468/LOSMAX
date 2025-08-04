import { Toaster } from 'sonner'
import { useTheme } from '@/contexts/ThemeContext'

// Enhanced Toaster with theme integration
export const ToastProvider = () => {
  const { theme } = useTheme()
  
  return (
    <Toaster
      theme={theme as 'light' | 'dark'}
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)',
        },
        classNames: {
          error: 'border-destructive',
          success: 'border-success',
          warning: 'border-warning',
          info: 'border-accent',
        },
      }}
    />
  )
}
