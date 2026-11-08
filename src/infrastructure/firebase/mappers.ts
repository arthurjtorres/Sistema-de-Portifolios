import type { DocumentData, Timestamp } from 'firebase/firestore';
import type { StoredImage } from '@/modules/media/types';

/** Converte Timestamp do Firestore em Date; `null` quando ausente (escrita local pendente). */
export function toDate(value: unknown): Date | null {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as Timestamp).toDate();
  }
  return null;
}

/** Lê uma referência de imagem de forma defensiva. */
export function toStoredImage(value: unknown): StoredImage | null {
  if (value && typeof value === 'object') {
    const { path, url } = value as Partial<StoredImage>;
    if (typeof path === 'string' && typeof url === 'string') {
      return { path, url };
    }
  }
  return null;
}

/** Lê uma lista de imagens descartando entradas inválidas. */
export function toStoredImages(value: unknown): StoredImage[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(toStoredImage).filter((image): image is StoredImage => image !== null);
}

/** Lê string com valor padrão. */
export function toText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

/** Lê número com valor padrão. */
export function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Atalho de tipo para dados de documento do Firestore. */
export type Data = DocumentData;
