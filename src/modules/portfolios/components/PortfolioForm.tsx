import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { TextAreaField } from '@/components/ui/TextAreaField';
import { TextField } from '@/components/ui/TextField';
import { useMessages } from '@/hooks/useMessages';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { logError, toAppError } from '@/lib/errors';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { CoverImagePicker } from '@/modules/media/components/CoverImagePicker';
import type { CoverDraft, UploadProgressHandler } from '@/modules/media/types';
import type { PortfolioFormValues } from '../services/portfolioService';
import type { Portfolio } from '../types';
import { PORTFOLIO_LIMITS, validatePortfolioForm } from '../validation/portfolioValidation';

/** Propriedades do formulário de portfólio. */
export interface PortfolioFormProps {
  /** Portfólio em edição; ausente no modo de criação. */
  initial?: Portfolio;
  submitLabel: string;
  cancelTo: string;
  onSubmit: (
    values: PortfolioFormValues,
    cover: CoverDraft,
    onProgress: UploadProgressHandler,
  ) => Promise<void>;
}

/** Formulário compartilhado entre criação e edição de portfólio. */
export function PortfolioForm({ initial, submitLabel, cancelTo, onSubmit }: PortfolioFormProps) {
  const { t } = useTranslation(['portfolios', 'common', 'media']);
  const { validationMessage, errorMessage } = useMessages();
  const isOnline = useOnlineStatus();
  const [values, setValues] = useState<PortfolioFormValues>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
  });
  const [cover, setCover] = useState<CoverDraft>({ current: initial?.coverImage ?? null, newFile: null });
  const [errors, setErrors] = useState<FieldErrors<PortfolioFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validatePortfolioForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }
    setIsSubmitting(true);
    setProgress(cover.newFile ? 0 : null);
    try {
      await onSubmit(values, cover, setProgress);
    } catch (error) {
      logError('portfolios.save', error);
      setFormError(errorMessage(toAppError(error)));
      setIsSubmitting(false);
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-6">
      {formError && <Alert tone="error">{formError}</Alert>}
      <TextField
        label={t('portfolios:form.name')}
        placeholder={t('portfolios:form.namePlaceholder')}
        value={values.name}
        maxLength={PORTFOLIO_LIMITS.nameMax + 20}
        error={validationMessage(errors.name)}
        disabled={isSubmitting}
        onChange={(event) => setValues({ ...values, name: event.target.value })}
      />
      <TextAreaField
        label={t('portfolios:form.description')}
        hint={t('portfolios:form.descriptionHint', { max: PORTFOLIO_LIMITS.descriptionMax })}
        value={values.description}
        error={validationMessage(errors.description)}
        disabled={isSubmitting}
        onChange={(event) => setValues({ ...values, description: event.target.value })}
      />
      <CoverImagePicker
        label={t('portfolios:form.cover')}
        value={cover}
        onChange={setCover}
        disabled={isSubmitting}
      />
      {progress !== null && (
        <p role="status" className="text-sm text-ink-soft">
          {t('media:uploading', { percent: progress })}
        </p>
      )}
      {!isOnline && <Alert tone="warning">{t('common:states.offlineSubmit')}</Alert>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <LinkButton to={cancelTo} variant="secondary">
          {t('common:actions.cancel')}
        </LinkButton>
        <Button type="submit" isLoading={isSubmitting} disabled={!isOnline}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
