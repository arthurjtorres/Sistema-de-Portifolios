import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { Logo } from '@/components/shared/Logo';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { logError } from '@/lib/errors';
import { useAuth } from '@/modules/authentication/context/AuthContext';

const NAV_ITEMS = [
  { to: ROUTES.dashboard, labelKey: 'nav.dashboard' },
  { to: ROUTES.portfolios, labelKey: 'nav.portfolios' },
  { to: ROUTES.projects, labelKey: 'nav.projects' },
] as const;

/** Estrutura das telas autenticadas: cabeçalho, navegação, aviso de conexão e conteúdo. */
export function AppLayout() {
  const { t } = useTranslation(['common']);
  const { user, signOut } = useAuth();
  const isOnline = useOnlineStatus();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      logError('auth.signOut', error);
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        {t('common:nav.skipToContent')}
      </a>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
          <NavLink to={ROUTES.dashboard} aria-label={t('common:app.name')}>
            <Logo />
          </NavLink>
          <nav aria-label={t('common:nav.mainNavigation')} className="order-last -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:w-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-[0.9375rem] font-medium whitespace-nowrap ${
                    isActive ? 'bg-accent-soft text-accent-strong' : 'text-ink-soft hover:bg-ink/5'
                  }`
                }
              >
                {t(`common:${item.labelKey}`)}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-sm text-muted md:block">{user?.email}</span>
            <Button variant="secondary" size="sm" onClick={handleSignOut} isLoading={isSigningOut}>
              {isSigningOut ? t('common:nav.signingOut') : t('common:nav.signOut')}
            </Button>
          </div>
        </div>
      </header>
      {!isOnline && (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <Alert tone="warning">{t('common:states.offline')}</Alert>
        </div>
      )}
      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
