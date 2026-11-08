import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/config/routes';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rotas privadas. Enquanto a sessão persistida é restaurada (`loading`) exibe
 * carregamento, sem redirecionar, evitando "piscar" a tela de login para quem já está logado.
 */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState />
      </div>
    );
  }
  if (status === 'unauthenticated') {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
