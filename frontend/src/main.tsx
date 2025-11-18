import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import i18n from './i18n'
import { queryClient } from './lib/queryClient'

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
 window.addEventListener('load', async () => {
   try {
     const registration = await navigator.serviceWorker.register('/sw.js', {
       scope: '/'
     });
     console.log('Service worker registered:', registration);
   } catch (error) {
     console.error('Service worker registration failed:', error);
   }
 });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
)
