import type { StoredImage } from '@/modules/media/types';

/** Projeto de um usuário, vinculado a exatamente um portfólio do mesmo usuário. */
export interface Project {
  id: string;
  ownerId: string;
  portfolioId: string;
  name: string;
  description: string;
  coverImage: StoredImage | null;
  /** Imagens adicionais (galeria). */
  images: StoredImage[];
  externalUrl: string | null;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

/** Campos editáveis de um projeto. */
export interface ProjectInput {
  portfolioId: string;
  name: string;
  description: string;
  coverImage: StoredImage | null;
  images: StoredImage[];
  externalUrl: string | null;
}
