import type { StoredImage } from '@/modules/media/types';

/** Portfólio de um usuário. Privado por padrão (não há campo de visibilidade nesta versão). */
export interface Portfolio {
  id: string;
  /** UID do proprietário; igual ao UID do caminho `users/{uid}/portfolios`. */
  ownerId: string;
  name: string;
  description: string;
  coverImage: StoredImage | null;
  /** Posição de exibição (menor primeiro). */
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Campos editáveis de um portfólio. */
export interface PortfolioInput {
  name: string;
  description: string;
  coverImage: StoredImage | null;
}
