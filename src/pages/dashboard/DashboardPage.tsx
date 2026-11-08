import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useMessages } from '@/hooks/useMessages';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { PortfolioCard } from '@/modules/portfolios/components/PortfolioCard';
import {
  countPortfolios,
  listRecentPortfolios,
} from '@/modules/portfolios/repositories/portfolioRepository';
import { ProjectCard } from '@/modules/projects/components/ProjectCard';
import { countProjects, listRecentProjects } from '@/modules/projects/repositories/projectRepository';

/** Quantidade de itens recentes exibidos por lista. */
const RECENT_LIMIT = 3;

/** Primeiro nome para a saudação; vazio se o usuário não informou nome. */
function firstName(displayName: string | null): string {
  return displayName?.trim().split(/\s+/)[0] ?? '';
}

/** Painel inicial: totais, recentes e ações rápidas. */
export function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const user = useAuthenticatedUser();
  const { errorMessage } = useMessages();

  const state = useAsyncData(
    async () => {
      const [portfolioTotal, projectTotal, recentPortfolios, recentProjects] = await Promise.all([
        countPortfolios(user.uid),
        countProjects(user.uid),
        listRecentPortfolios(user.uid, RECENT_LIMIT),
        listRecentProjects(user.uid, RECENT_LIMIT),
      ]);
      return { portfolioTotal, projectTotal, recentPortfolios, recentProjects };
    },
    [user.uid],
    'dashboard.load',
  );

  const name = firstName(user.displayName);
  const title = name ? t('dashboard:greeting', { name }) : t('dashboard:greetingFallback');

  return (
    <>
      <PageHeader
        title={title}
        description={
          state.status === 'success'
            ? t('dashboard:summary', {
                portfolios: t('dashboard:portfolioCount', { count: state.data.portfolioTotal }),
                projects: t('dashboard:projectCount', { count: state.data.projectTotal }),
              })
            : undefined
        }
        actions={
          <>
            <LinkButton to={ROUTES.portfolioNew}>{t('dashboard:newPortfolio')}</LinkButton>
            <LinkButton to={ROUTES.projectNew()} variant="secondary">
              {t('dashboard:newProject')}
            </LinkButton>
          </>
        }
      />

      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && (
        <ErrorState message={`${t('dashboard:loadError')} ${errorMessage(state.error)}`} onRetry={state.reload} />
      )}

      {state.status === 'success' && state.data.portfolioTotal === 0 && (
        <EmptyState
          title={t('dashboard:empty.title')}
          description={t('dashboard:empty.description')}
          action={<LinkButton to={ROUTES.portfolioNew}>{t('dashboard:empty.action')}</LinkButton>}
        />
      )}

      {state.status === 'success' && state.data.portfolioTotal > 0 && (
        <div className="flex flex-col gap-12">
          <section aria-labelledby="recent-portfolios">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="recent-portfolios" className="text-xl font-semibold">
                {t('dashboard:recentPortfolios')}
              </h2>
              <Link to={ROUTES.portfolios} className="text-sm text-accent underline underline-offset-2">
                {t('common:actions.viewAll')}
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.data.recentPortfolios.map((portfolio) => (
                <li key={portfolio.id}>
                  <PortfolioCard portfolio={portfolio} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="recent-projects">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="recent-projects" className="text-xl font-semibold">
                {t('dashboard:recentProjects')}
              </h2>
              {state.data.projectTotal > 0 && (
                <Link to={ROUTES.projects} className="text-sm text-accent underline underline-offset-2">
                  {t('common:actions.viewAll')}
                </Link>
              )}
            </div>
            {state.data.projectTotal === 0 ? (
              <EmptyState
                title={t('dashboard:noProjects.title')}
                description={t('dashboard:noProjects.description')}
                action={
                  <LinkButton to={ROUTES.projectNew()} variant="secondary">
                    {t('dashboard:noProjects.action')}
                  </LinkButton>
                }
              />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {state.data.recentProjects.map((project) => (
                  <li key={project.id}>
                    <ProjectCard project={project} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
