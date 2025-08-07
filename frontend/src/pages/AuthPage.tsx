import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../hooks/useToast'; // Import useToast hook
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LanguageSwitch } from '../components/ui/language-toggle';
import { login, register } from '../services/auth';
import { AuthContext } from '../contexts/auth.context';
import LOSHeader from '../components/ui/losheader';

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
      // Use toast for user feedback
      const { error: toastError } = useToast();
      toastError('toast.error.auth.generic');
    }
  };

  return (
    <div className="auth-card">
      <header className="auth-header">
        <LOSHeader variant="auth" />
        <div className="auth-divider"></div>
        <h3 className="auth-form-title">{title}</h3>
      </header>
      
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

      <div className="auth-footer">
        {secondaryAction && (
          <span className="auth-footer-text">
            {secondaryAction.text.includes('account') ? (
              <>
                {secondaryAction.text.includes('Don\'t have') ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={secondaryAction.onClick}
                  className="auth-footer-link"
                >
                  {secondaryAction.text.includes('Don\'t have') ? "Sign up" : "Sign in"}
                </button>
              </>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="auth-footer-link"
              >
                {secondaryAction.text}
              </button>
            )}
          </span>
        )}
        <LanguageSwitch className="auth-language-switch" />
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
      const { error: toastError } = useToast();
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
      const { error: toastError } = useToast();
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
        />
      )}
    </div>
  )
}