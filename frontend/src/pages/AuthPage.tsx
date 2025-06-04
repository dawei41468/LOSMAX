import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner'; // Import toast from sonner
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LanguageSwitch } from '../components/ui/language-toggle';
import { login, register } from '../services/auth';
import { AuthContext } from '../contexts/auth.context';

interface AuthFormProps {
  title: string;
  submitText: string;
  onSubmit: (email: string, password: string, name?: string) => Promise<void>;
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  isLoading?: boolean;
  showNameField?: boolean;
}

function AuthFormComponent({
  title,
  submitText,
  onSubmit,
  secondaryAction,
  isLoading = false,
  showNameField = false
}: AuthFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string | null;
    
    try {
      await onSubmit(email, password, name || undefined);
    } catch (error) {
      // Errors are handled in handleSignIn/handleSignUp, but a general toast here could be a fallback
      // For now, relying on specific handlers
      console.error('Authentication error in AuthFormComponent:', error);
      // toast.error(t('auth.genericError')); // Example of a generic error
    }
  };

  return (
    <div className="w-full min-h-screen sm:max-w-md bg-white rounded-none sm:rounded-lg shadow-md p-6 sm:p-8">
      <header className="mb-4 sm:mb-6 text-center mt-30">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t('auth.LOS')}</h1>
        <h2 className="text-sm sm:text-sm mt-1 text-gray-500 uppercase tracking-wider">{t('auth.lifeOrganizationSystem')}</h2>
        <div className="mt-3 sm:mt-4 border-b border-gray-200 w-10 sm:w-12 mx-auto"></div>
        <h3 className="text-base sm:text-lg mt-3 sm:mt-4 font-medium">{title}</h3>
      </header>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {showNameField && (
          <div className="space-y-2">
            <label htmlFor="name" className="sr-only">
              {t('auth.name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder={t('auth.namePlaceholder')}
              autoComplete="name"
              required
              className="w-full px-2 py-4 sm:py-3 border-0 border-b border-gray-200 focus:border-gray-400 focus:ring-0 focus:outline-none rounded-none text-lg sm:text-base"
            />
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="sr-only">
            {t('common.email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
            required
            className="w-full px-2 py-4 sm:py-3 border-0 border-b border-gray-200 focus:border-gray-400 focus:ring-0 focus:outline-none rounded-none text-lg sm:text-base"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="sr-only">
            {t('common.password')}
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="current-password"
              required
              minLength={6}
              className="w-full px-2 py-4 sm:py-3 border-0 border-b border-gray-200 focus:border-gray-400 focus:ring-0 focus:outline-none rounded-none text-lg sm:text-base"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 sm:py-3 px-4 bg-gray-900 text-white hover:bg-gray-800 focus:outline-none rounded-md disabled:opacity-50 text-base sm:text-sm"
          disabled={isLoading}
        >
          {isLoading ? t('common.loading') : submitText}
        </button>
      </form>

      <div className="mt-8 sm:mt-6 relative">
        {secondaryAction && (
          <div className="text-center">
            <button
              onClick={secondaryAction.onClick}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              {secondaryAction.text}
            </button>
          </div>
        )}
        <LanguageSwitch className="absolute left-0 bottom-0" />
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { setAuthState } = useContext(AuthContext);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await login(email, password, setAuthState, navigate);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(t('auth.loginError', 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      await register(email, password, name || '', setAuthState, navigate);
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error(t('auth.signupError', 'Signup failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {isSignUp ? (
    <AuthFormComponent
      title={t('auth.signUpTitle')}
      submitText={t('auth.signUp')}
      onSubmit={handleSignUp}
      secondaryAction={{
        text: t('auth.alreadyHaveAccount'),
        onClick: () => setIsSignUp(false)
      }}
      isLoading={isLoading}
      showNameField={true}
    />
  ) : (
    <AuthFormComponent
      title={t('auth.signInTitle')}
      submitText={t('auth.signIn')}
      onSubmit={handleSignIn}
      secondaryAction={{
        text: t('auth.dontHaveAccount'),
        onClick: () => setIsSignUp(true)
      }}
      isLoading={isLoading}
      showNameField={false}
    />
      )}
    </div>
  )
}