import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { MEDIA_LIMITS } from '@/config/media';
import { useMessages } from '@/hooks/useMessages';
import { useObjectUrl } from '../hooks';
import type { GalleryDraft } from '../types';
import { validateImageFile } from '../validation/fileValidation';

/** Propriedades do seletor de galeria. */
export interface GalleryPickerProps {
  label: string;
  value: GalleryDraft;
  onChange: (value: GalleryDraft) => void;
  disabled?: boolean;
}

function NewFileThumb({ file, alt, removeLabel, onRemove, disabled }: {
  file: File;
  alt: string;
  removeLabel: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const url = useObjectUrl(file);
  return <Thumb src={url} alt={alt} removeLabel={removeLabel} onRemove={onRemove} disabled={disabled} />;
}

function Thumb({ src, alt, removeLabel, onRemove, disabled }: {
  src: string | null;
  alt: string;
  removeLabel: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-md border border-line bg-surface">
      {src && <img src={src} alt={alt} className="size-full object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={removeLabel}
        className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-ink/80 text-white hover:bg-ink disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}

/** Seletor de várias imagens com limite, pré-visualização e remoção individual. */
export function GalleryPicker({ label, value, onChange, disabled }: GalleryPickerProps) {
  const { t } = useTranslation(['media']);
  const { errorMessage } = useMessages();
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const total = value.kept.length + value.newFiles.length;
  const atLimit = total >= MEDIA_LIMITS.maxGalleryImages;

  function handleFiles(files: FileList | null) {
    if (!files) {
      return;
    }
    const accepted: File[] = [];
    let nextError: string | null = null;
    for (const file of Array.from(files)) {
      const code = validateImageFile(file);
      if (code) {
        nextError = errorMessage(code);
      } else if (total + accepted.length >= MEDIA_LIMITS.maxGalleryImages) {
        nextError = errorMessage('tooManyImages');
        break;
      } else {
        accepted.push(file);
      }
    }
    setError(nextError);
    if (accepted.length > 0) {
      onChange({ ...value, newFiles: [...value.newFiles, ...accepted] });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted">
          {t('media:gallery.count', { count: total, max: MEDIA_LIMITS.maxGalleryImages })}
        </span>
      </div>

      {total > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.kept.map((image, index) => (
            <Thumb
              key={image.path}
              src={image.url}
              alt={t('media:gallery.previewAlt', { index: index + 1 })}
              removeLabel={t('media:gallery.remove', { index: index + 1 })}
              disabled={disabled}
              onRemove={() => onChange({ ...value, kept: value.kept.filter((item) => item.path !== image.path) })}
            />
          ))}
          {value.newFiles.map((file, index) => (
            <NewFileThumb
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              file={file}
              alt={t('media:gallery.previewAlt', { index: value.kept.length + index + 1 })}
              removeLabel={t('media:gallery.remove', { index: value.kept.length + index + 1 })}
              disabled={disabled}
              onRemove={() => onChange({ ...value, newFiles: value.newFiles.filter((_, i) => i !== index) })}
            />
          ))}
        </ul>
      )}

      <input
        id={inputId}
        type="file"
        multiple
        accept={MEDIA_LIMITS.allowedMimeTypes.join(',')}
        className="sr-only"
        disabled={disabled || atLimit}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <div>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || atLimit}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {t('media:gallery.add')}
        </Button>
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
  );
}
