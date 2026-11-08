import { describe, expect, it } from 'vitest';
import { MEDIA_LIMITS } from '@/config/media';
import { validateImageFile } from './fileValidation';

describe('validateImageFile', () => {
  it('aceita JPEG, PNG e WebP dentro do limite', () => {
    for (const type of MEDIA_LIMITS.allowedMimeTypes) {
      expect(validateImageFile({ type, size: 1024 })).toBeNull();
    }
  });

  it('rejeita tipos não permitidos (inclusive SVG e GIF)', () => {
    expect(validateImageFile({ type: 'image/svg+xml', size: 10 })).toBe('invalidFileType');
    expect(validateImageFile({ type: 'image/gif', size: 10 })).toBe('invalidFileType');
    expect(validateImageFile({ type: 'application/pdf', size: 10 })).toBe('invalidFileType');
  });

  it('rejeita arquivos acima do limite e aceita exatamente o limite', () => {
    expect(validateImageFile({ type: 'image/png', size: MEDIA_LIMITS.maxFileSizeBytes + 1 })).toBe('fileTooLarge');
    expect(validateImageFile({ type: 'image/png', size: MEDIA_LIMITS.maxFileSizeBytes })).toBeNull();
  });
});
