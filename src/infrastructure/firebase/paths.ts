/**
 * Caminhos de dados no Firestore e no Storage. Centralizados para que regras de segurança,
 * repositórios e serviços de mídia usem exatamente a mesma estrutura.
 *
 * Firestore:
 *   users/{uid}/portfolios/{portfolioId}
 *   users/{uid}/projects/{projectId}        (campo `portfolioId` referencia o portfólio)
 *
 * Storage:
 *   users/{uid}/portfolios/{portfolioId}/{fileName}
 *   users/{uid}/projects/{projectId}/{fileName}
 */
export const FIRESTORE_PATHS = {
  portfolios: (uid: string): string => `users/${uid}/portfolios`,
  projects: (uid: string): string => `users/${uid}/projects`,
} as const;

/** Tipo de recurso dono de um arquivo no Storage. */
export type MediaOwnerKind = 'portfolios' | 'projects';

export const STORAGE_PATHS = {
  /** Pasta de arquivos de um recurso (portfólio ou projeto). */
  resourceFolder: (uid: string, kind: MediaOwnerKind, resourceId: string): string =>
    `users/${uid}/${kind}/${resourceId}`,
} as const;
