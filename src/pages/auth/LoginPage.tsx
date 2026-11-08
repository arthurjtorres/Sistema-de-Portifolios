import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ROUTES } from '@/config/routes';
import { useMessages } from '@/hooks/useMessages';
import { logError, toAppError } from '@/lib/errors';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { AuthLayout } from '@/layouts/AuthLayout';
import { useAuth } from '@/modules/authentication/context/AuthContext';
import type { SignInInput } from '@/modules/authentication/types';
import { validateSignIn } from '@/modules/authentication/validation/authValidation';

/** Tela de login. O redirecionamento pós-login é feito por `PublicOnlyRoute`. */
export function LoginPage() {
  const { t } = useTranslation(['auth', 'common']);
  const { signIn } = useAuth();
  const { validationMessage, errorMessage } = useMessages();
  const [values, setValues] = useState<SignInInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<SignInInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateSignIn(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(values);
    } catch (error) {
      logError('auth.signIn', error);
      setFormError(errorMessage(toAppError(error)));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title={t('auth:login.title')} subtitle={t('auth:login.subtitle')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <TextField
          label={t('auth:fields.email')}
          type="email"
          autoComplete="email"
          value={values.email}
          error={validationMessage(errors.email)}
          onChange={(event) => setValues({ ...values, email: event.target.value })}
        />
        <TextField
          label={t('auth:fields.password')}
          type="password"
          autoComplete="current-password"
          value={values.password}
          error={validationMessage(errors.password)}
          onChange={(event) => setValues({ ...values, password: event.target.value })}
        />
        <div className="-mt-2 text-sm">
          <Link to={ROUTES.forgotPassword} className="text-accent underline underline-offset-2">
            {t('auth:login.forgotPassword')}
          </Link>
        </div>
        <Button type="submit" isLoading={isSubmitting}>
          {t('auth:login.submit')}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        {t('auth:login.noAccount')}{' '}
        <Link to={ROUTES.signUp} className="font-medium text-accent underline underline-offset-2">
          {t('auth:login.signUpLink')}
        </Link>
      </p>
    </AuthLayout>
  );
}
