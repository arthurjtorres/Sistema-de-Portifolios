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
import {
  PASSWORD_MIN_LENGTH,
  validateSignUp,
  type SignUpFormValues,
} from '@/modules/authentication/validation/authValidation';

/** Tela de cadastro com e-mail e senha. */
export function SignUpPage() {
  const { t } = useTranslation(['auth', 'common']);
  const { signUp } = useAuth();
  const { validationMessage, errorMessage } = useMessages();
  const [values, setValues] = useState<SignUpFormValues>({
    displayName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState<FieldErrors<SignUpFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateSignUp(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp({ displayName: values.displayName, email: values.email, password: values.password });
    } catch (error) {
      logError('auth.signUp', error);
      setFormError(errorMessage(toAppError(error)));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title={t('auth:signUp.title')} subtitle={t('auth:signUp.subtitle')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <TextField
          label={t('auth:fields.displayName')}
          autoComplete="name"
          value={values.displayName}
          error={validationMessage(errors.displayName)}
          onChange={(event) => setValues({ ...values, displayName: event.target.value })}
        />
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
          autoComplete="new-password"
          hint={t('auth:fields.passwordHint', { min: PASSWORD_MIN_LENGTH })}
          value={values.password}
          error={validationMessage(errors.password)}
          onChange={(event) => setValues({ ...values, password: event.target.value })}
        />
        <TextField
          label={t('auth:fields.passwordConfirmation')}
          type="password"
          autoComplete="new-password"
          value={values.passwordConfirmation}
          error={validationMessage(errors.passwordConfirmation)}
          onChange={(event) => setValues({ ...values, passwordConfirmation: event.target.value })}
        />
        <Button type="submit" isLoading={isSubmitting}>
          {t('auth:signUp.submit')}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">
        {t('auth:signUp.hasAccount')}{' '}
        <Link to={ROUTES.login} className="font-medium text-accent underline underline-offset-2">
          {t('auth:signUp.loginLink')}
        </Link>
      </p>
    </AuthLayout>
  );
}
