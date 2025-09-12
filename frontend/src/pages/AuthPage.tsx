import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast'; // Import useToast hook
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LanguageSwitch } from '../components/ui/language-toggle';
import { login, register } from '../services/auth';
import { AuthContext } from '../contexts/auth.context';
import LOSHeader from '../components/ui/losheader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

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
  placeTitleInside?: boolean; // when true, moves title into the Card and hides divider
}

function AuthFormComponent({
  title,
  submitText,
  onSubmit,
  secondaryAction,
  isLoading = false,
  showNameField = false,
  placeTitleInside = false,
}: AuthFormProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { error: toastError } = useToast();

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
      // Errors are handled in handleSignIn/handleSignUp, but a general toast here as a fallback
      toastError('toast.error.auth.generic');
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-header">
        <LOSHeader variant="auth" />
        {!placeTitleInside && (
          <>
            <div className="auth-divider"></div>
            <h3 className="auth-form-title">{title}</h3>
          </>
        )}
      </header>

      {/* Rounded container for the form and footer (logo/title remain outside) */}
      <Card variant="default" size="sm" className="mt-4 bg-surface">
        {placeTitleInside && (
          <CardHeader align="center" size="none" className="py-2">
            <CardTitle size="default" as="h3">
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent size="none" className="space-y-3">
          <form onSubmit={handleSubmit} className="auth-form">
            {showNameField && (
              <div className="form-group">
                <label htmlFor="name" className="sr-only">
                  {t('forms.labels.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('forms.placeholders.name')}
                  autoComplete="name"
                  required
                  className="form-input-underline"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email" className="sr-only">
                {t('forms.labels.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder={t('forms.placeholders.email')}
                autoComplete="username"
                required
                className="form-input-underline"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="sr-only">
                {t('forms.labels.password')}
              </label>
              <div className="form-input-with-icon">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('forms.placeholders.password')}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  className="form-input-underline"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="form-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="icon-sm" /> : <FaEye className="icon-sm" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full-width"
              disabled={isLoading}
            >
              {isLoading ? t('actions.loading') : submitText}
            </button>
          </form>

          {/* Login-only spacer and sign-up link */}
          {placeTitleInside && secondaryAction && (
            <div className="w-full">
              <div className="w-full flex items-center gap-2 text-muted-foreground py-2">
                <div className="flex-1 border-t border-[var(--border)]" />
                <span className="text-sm">{showNameField ? t('content.auth.alreadyHaveAccount') : t('content.auth.dontHaveAccount')}</span>
                <div className="flex-1 border-t border-[var(--border)]" />
              </div>
              <div className="w-full text-center">
                <button
                  onClick={secondaryAction.onClick}
                  className="auth-footer-link"
                >
                  {showNameField ? t('actions.signIn') : t('actions.signUp')}
                </button>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer with language toggle on bottom-right */}
        <CardFooter align="right" size="sm">
          <LanguageSwitch className="auth-language-switch" />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const { setAuthState } = useContext(AuthContext);
  
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await login(email, password, setAuthState, navigate);
    } catch (error) {
      console.error('Login failed:', error);
      toastError('toast.error.auth.loginFailed');
      toastError('toast.error.login');
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
      toastError('toast.error.auth.signupFailed');
      toastError('toast.error.signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-auth">
      {isSignUp ? (
        <AuthFormComponent
          title={t('content.auth.signUpTitle')}
          submitText={t('actions.signUp')}
          onSubmit={handleSignUp}
          secondaryAction={{
            text: t('content.auth.alreadyHaveAccount'),
            onClick: () => setIsSignUp(false)
          }}
          isLoading={isLoading}
          showNameField={true}
          placeTitleInside={true}
        />
      ) : (
        <AuthFormComponent
          title={t('content.auth.signInTitle')}
          submitText={t('actions.signIn')}
          onSubmit={handleSignIn}
          secondaryAction={{
            text: t('content.auth.dontHaveAccount'),
            onClick: () => setIsSignUp(true)
          }}
          isLoading={isLoading}
          showNameField={false}
          placeTitleInside={true}
        />
      )}
    </div>
  )
}