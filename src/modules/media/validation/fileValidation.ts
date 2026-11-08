import { MEDIA_LIMITS, type AllowedImageMimeType } from '@/config/media';
import type { ErrorCode } from '@/lib/errors';

/** Subconjunto de `File` necessário para validação (facilita testes). */
export interface FileLike {
  type: string;
  size: number;
}

/** Verifica se o tipo MIME é uma imagem aceita. */
export function isAllowedImageType(mimeType: string): mimeType is AllowedImageMimeType {
  return (MEDIA_LIMITS.allowedMimeTypes as readonly string[]).includes(mimeType);
}

/**
 * Valida um arquivo de imagem no cliente (experiência do usuário).
 * O controle efetivo é aplicado em `storage.rules`.
 *
 * @returns código de erro ou `null` quando válido.
 */
export function validateImageFile(file: FileLike): ErrorCode | null {
  if (!isAllowedImageType(file.type)) {
    return 'invalidFileType';
  }
  if (file.size > MEDIA_LIMITS.maxFileSizeBytes) {
    return 'fileTooLarge';
  }
  return null;
}

/** Extensão de arquivo usada no nome gerado para cada tipo aceito. */
export const EXTENSION_BY_MIME: Record<AllowedImageMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
