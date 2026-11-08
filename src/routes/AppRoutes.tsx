import { Navigate, Route, Routes } from 'react-router';
import { ROUTES } from '@/config/routes';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/modules/authentication/components/ProtectedRoute';
import { PublicOnlyRoute } from '@/modules/authentication/components/PublicOnlyRoute';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { EditPortfolioPage } from '@/pages/portfolios/EditPortfolioPage';
import { NewPortfolioPage } from '@/pages/portfolios/NewPortfolioPage';
import { PortfolioDetailPage } from '@/pages/portfolios/PortfolioDetailPage';
import { PortfoliosPage } from '@/pages/portfolios/PortfoliosPage';
import { EditProjectPage } from '@/pages/projects/EditProjectPage';
import { NewProjectPage } from '@/pages/projects/NewProjectPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';

/**
 * Árvore de rotas. Rotas públicas (login/cadastro/recuperação) só são acessíveis sem sessão;
 * o restante exige autenticação. `/` redireciona ao painel (ou ao login via ProtectedRoute).
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to={ROUTES.dashboard} replace />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.signUp} element={<SignUpPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.portfolios} element={<PortfoliosPage />} />
          <Route path={ROUTES.portfolioNew} element={<NewPortfolioPage />} />
          <Route path="/portfolios/:portfolioId" element={<PortfolioDetailPage />} />
          <Route path="/portfolios/:portfolioId/edit" element={<EditPortfolioPage />} />
          <Route path={ROUTES.projects} element={<ProjectsPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/edit" element={<EditProjectPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
