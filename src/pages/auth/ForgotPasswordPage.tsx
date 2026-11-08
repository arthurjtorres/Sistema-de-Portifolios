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
import { validatePasswordReset } from '@/modules/authentication/validation/authValidation';

/** Solicita o e-mail de redefinição de senha. A confirmação não revela se o e-mail existe. */
export function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'common']);
  const { sendPasswordReset } = useAuth();
  const { validationMessage, errorMessage } = useMessages();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors<{ email: string }>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validatePasswordReset({ email });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setIsSent(true);
    } catch (error) {
      logError('auth.passwordReset', error);
      setFormError(errorMessage(toAppError(error)));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title={t('auth:forgotPassword.title')} subtitle={t('auth:forgotPassword.subtitle')}>
      {isSent ? (
        <Alert tone="success">{t('auth:forgotPassword.success')}</Alert>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {formError && <Alert tone="error">{formError}</Alert>}
          <TextField
            label={t('auth:fields.email')}
            type="email"
            autoComplete="email"
            value={email}
            error={validationMessage(errors.email)}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" isLoading={isSubmitting}>
            {t('auth:forgotPassword.submit')}
          </Button>
        </form>
      )}
      <p className="mt-6 text-sm">
        <Link to={ROUTES.login} className="font-medium text-accent underline underline-offset-2">
          {t('auth:forgotPassword.backToLogin')}
        </Link>
      </p>
    </AuthLayout>
  );
}
