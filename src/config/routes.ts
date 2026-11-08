/**
 * Caminhos de rota centralizados. Os caminhos são neutros em idioma para não
 * precisarem mudar quando novos idiomas forem adicionados.
 */
export const ROUTES = {
  login: '/login',
  signUp: '/signup',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  portfolios: '/portfolios',
  portfolioNew: '/portfolios/new',
  portfolioDetail: (portfolioId: string): string => `/portfolios/${encodeURIComponent(portfolioId)}`,
  portfolioEdit: (portfolioId: string): string =>
    `/portfolios/${encodeURIComponent(portfolioId)}/edit`,
  projects: '/projects',
  /** Novo projeto, opcionalmente já vinculado a um portfólio. */
  projectNew: (portfolioId?: string): string =>
    portfolioId ? `/projects/new?portfolioId=${encodeURIComponent(portfolioId)}` : '/projects/new',
  projectDetail: (projectId: string): string => `/projects/${encodeURIComponent(projectId)}`,
  projectEdit: (projectId: string): string => `/projects/${encodeURIComponent(projectId)}/edit`,
} as const;
