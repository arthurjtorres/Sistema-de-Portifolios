import { BrowserRouter } from 'react-router';
import { parseFirebaseEnv } from '@/config/env';
import { AuthProvider } from '@/modules/authentication/context/AuthProvider';
import { ConfigMissingPage } from '@/pages/ConfigMissingPage';
import { AppRoutes } from '@/routes/AppRoutes';

/**
 * Raiz da aplicação. Sem a configuração do Firebase, mostra instruções em vez de falhar
 * com erro obscuro (nenhuma conexão é simulada).
 */
export function App() {
  const env = parseFirebaseEnv(import.meta.env);
  if (!env.ok) {
    return <ConfigMissingPage missing={env.missing} />;
  }
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
