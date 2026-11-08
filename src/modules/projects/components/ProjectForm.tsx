import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { SelectField } from '@/components/ui/SelectField';
import { TextAreaField } from '@/components/ui/TextAreaField';
import { TextField } from '@/components/ui/TextField';
import { useMessages } from '@/hooks/useMessages';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { logError, toAppError } from '@/lib/errors';
import { hasErrors, type FieldErrors } from '@/lib/validation';
import { CoverImagePicker } from '@/modules/media/components/CoverImagePicker';
import { GalleryPicker } from '@/modules/media/components/GalleryPicker';
import type { CoverDraft, GalleryDraft, UploadProgressHandler } from '@/modules/media/types';
import type { Portfolio } from '@/modules/portfolios/types';
import type { ProjectFormValues } from '../services/projectService';
import type { Project } from '../types';
import { PROJECT_LIMITS, validateProjectForm } from '../validation/projectValidation';

/** Propriedades do formulário de projeto. */
export interface ProjectFormProps {
  initial?: Project;
  /** Portfólios do usuário disponíveis para vínculo. */
  portfolios: Portfolio[];
  /** Portfólio pré-selecionado na criação (ex.: vindo da tela do portfólio). */
  defaultPortfolioId?: string;
  submitLabel: string;
  cancelTo: string;
  onSubmit: (
    values: ProjectFormValues,
    cover: CoverDraft,
    gallery: GalleryDraft,
    onProgress: UploadProgressHandler,
  ) => Promise<void>;
}

/** Formulário compartilhado entre criação e edição de projeto. */
export function ProjectForm({
  initial,
  portfolios,
  defaultPortfolioId,
  submitLabel,
  cancelTo,
  onSubmit,
}: ProjectFormProps) {
  const { t } = useTranslation(['projects', 'common', 'media']);
  const { validationMessage, errorMessage } = useMessages();
  const isOnline = useOnlineStatus();

  const preselected =
    initial?.portfolioId ??
    (portfolios.some((portfolio) => portfolio.id === defaultPortfolioId) ? defaultPortfolioId : undefined) ??
    '';

  const [values, setValues] = useState<ProjectFormValues>({
    portfolioId: preselected,
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    externalUrl: initial?.externalUrl ?? '',
  });
  const [cover, setCover] = useState<CoverDraft>({ current: initial?.coverImage ?? null, newFile: null });
  const [gallery, setGallery] = useState<GalleryDraft>({ kept: initial?.images ?? [], newFiles: [] });
  const [errors, setErrors] = useState<FieldErrors<ProjectFormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const nextErrors = validateProjectForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      return;
    }
    setIsSubmitting(true);
    setProgress(cover.newFile || gallery.newFiles.length > 0 ? 0 : null);
    try {
      await onSubmit(values, cover, gallery, setProgress);
    } catch (error) {
      logError('projects.save', error);
      setFormError(errorMessage(toAppError(error)));
      setIsSubmitting(false);
      setProgress(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-6">
      {formError && <Alert tone="error">{formError}</Alert>}
      <SelectField
        label={t('projects:form.portfolio')}
        placeholder={t('projects:form.portfolioPlaceholder')}
        value={values.portfolioId}
        options={portfolios.map((portfolio) => ({ value: portfolio.id, label: portfolio.name }))}
        error={validationMessage(errors.portfolioId)}
        disabled={isSubmitting}
        onChange={(event) => setValues({ ...values, portfolioId: event.target.value })}
      />
      <TextField
        label={t('projects:form.name')}
        placeholder={t('projects:form.namePlaceholder')}
        value={values.name}
        error={validationMessage(errors.name)}
        disabled={isSubmitting}
        onChange={(event) => setValues({ ...values, name: event.target.value })}
      />
      <TextAreaField
        label={t('projects:form.description')}
        hint={t('projects:form.descriptionHint', { max: PROJECT_LIMITS.descriptionMax })}
        value={values.description}
        error={validationMessage(errors.description)}
        disabled={isSubmitting}
        onChange={(event) => setValues({ ...values, description: event.target.value })}
      />
      <TextField
        label={t('projects:form.externalUrl')}
        hint={t('projects:form.externalUrlHint')}
        type="url"
        inputMode="url"
        placeholder="https://"
        value={values.externalUrl}
        error={validationMessage(errors.externalUrl)}
        disabled={isSubmitting}
        onChange={(event) => setValues({ ...values, externalUrl: event.target.value })}
      />
      <CoverImagePicker label={t('projects:form.cover')} value={cover} onChange={setCover} disabled={isSubmitting} />
      <GalleryPicker label={t('projects:form.gallery')} value={gallery} onChange={setGallery} disabled={isSubmitting} />
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
