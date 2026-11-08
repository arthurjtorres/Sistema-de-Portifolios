/**
 * Limites de upload de imagens (proposta pendente de aprovação — ver docs/DECISOES.md, ADR-011).
 *
 * IMPORTANTE: os mesmos valores estão replicados em `storage.rules`, que é quem efetivamente
 * aplica o controle. Ao alterar aqui, altere lá também (as regras não importam código TS).
 */
export const MEDIA_LIMITS = {
  /** Tipos MIME aceitos. */
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  /** Extensões exibidas ao usuário e usadas no atributo `accept` do input. */
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,
  /** Tamanho máximo por arquivo, em bytes (5 MB). */
  maxFileSizeBytes: 5 * 1024 * 1024,
  /** Quantidade máxima de imagens adicionais (galeria) por projeto. */
  maxGalleryImages: 8,
} as const;

/** Tipo MIME de imagem aceito pela aplicação. */
export type AllowedImageMimeType = (typeof MEDIA_LIMITS.allowedMimeTypes)[number];
