import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { MEDIA_LIMITS } from '@/config/media';
import { useMessages } from '@/hooks/useMessages';
import { useObjectUrl } from '../hooks';
import type { CoverDraft } from '../types';
import { validateImageFile } from '../validation/fileValidation';

/** Propriedades do seletor de capa. */
export interface CoverImagePickerProps {
  label: string;
  value: CoverDraft;
  onChange: (value: CoverDraft) => void;
  disabled?: boolean;
}

/** Seletor de imagem única com pré-visualização, validação e remoção. */
export function CoverImagePicker({ label, value, onChange, disabled }: CoverImagePickerProps) {
  const { t } = useTranslation(['media']);
  const { errorMessage } = useMessages();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const localPreview = useObjectUrl(value.newFile);
  const preview = localPreview ?? value.current?.url ?? null;

  function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }
    const code = validateImageFile(file);
    if (code) {
      setError(errorMessage(code));
      return;
    }
    setError(null);
    onChange({ ...value, newFile: file });
  }

  function handleRemove() {
    setError(null);
    onChange({ current: null, newFile: null });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="aspect-[16/10] w-full overflow-hidden rounded-md border border-dashed border-line-strong bg-surface sm:w-64">
          {preview ? (
            <img src={preview} alt={t('media:cover.previewAlt')} className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-muted" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="1.5" />
                <path d="m21 16-5-5-8 8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={MEDIA_LIMITS.allowedMimeTypes.join(',')}
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              handleFileChange(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => document.getElementById(inputId)?.click()}
            >
              {preview ? t('media:cover.replace') : t('media:cover.choose')}
            </Button>
            {preview && (
              <Button variant="ghost" size="sm" disabled={disabled} onClick={handleRemove}>
                {t('media:cover.remove')}
              </Button>
            )}
          </div>
          <p className="text-sm text-muted">
            {t('media:hint', { size: MEDIA_LIMITS.maxFileSizeBytes / (1024 * 1024) })}
          </p>
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
