import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '@/components/ui/LoadingState';
import { ROUTES } from '@/config/routes';
import { useAuth } from '../context/AuthContext';

/** Estado de navegação gravado por `ProtectedRoute` com o destino original. */
interface RedirectState {
  from?: string;
}

/** Só permite acesso a quem NÃO está autenticado (login, cadastro, recuperação). */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingState />
      </div>
    );
  }
  if (status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from;
    // Aceita apenas caminhos internos para evitar redirecionamento aberto.
    const destination = from && from.startsWith('/') && !from.startsWith('//') ? from : ROUTES.dashboard;
    return <Navigate to={destination} replace />;
  }
  return <Outlet />;
}
