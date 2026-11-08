import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MEDIA_LIMITS } from '@/config/media';
import type { AppError, ErrorCode } from '@/lib/errors';
import type { ValidationMessage } from '@/lib/validation';

/**
 * Traduz mensagens de validação e códigos de erro para texto exibível,
 * mantendo componentes livres de lógica de tradução de erros.
 */
export function useMessages() {
  const { t } = useTranslation(['common', 'errors']);

  const validationMessage = useCallback(
    (message: ValidationMessage | undefined): string | undefined =>
      message ? t(`common:validation.${message.key}`, message.params ?? {}) : undefined,
    [t],
  );

  const errorMessage = useCallback(
    (error: AppError | ErrorCode): string => {
      const code = typeof error === 'string' ? error : error.code;
      return t(`errors:${code}`, {
        size: MEDIA_LIMITS.maxFileSizeBytes / (1024 * 1024),
        max: MEDIA_LIMITS.maxGalleryImages,
      });
    },
    [t],
  );

  return { validationMessage, errorMessage };
}
