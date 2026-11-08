import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectCard } from '@/modules/projects/components/ProjectCard';
import { RouteNotice } from '@/components/shared/RouteNotice';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SelectField } from '@/components/ui/SelectField';
import { ROUTES } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useMessages } from '@/hooks/useMessages';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { listPortfolios } from '@/modules/portfolios/repositories/portfolioRepository';
import { listProjects } from '@/modules/projects/repositories/projectRepository';

const ALL = 'all';

/** Lista de todos os projetos, com filtro por portfólio. */
export function ProjectsPage() {
  const { t } = useTranslation(['projects']);
  const user = useAuthenticatedUser();
  const { errorMessage } = useMessages();
  const [filter, setFilter] = useState(ALL);

  const state = useAsyncData(
    async () => {
      const [projects, portfolios] = await Promise.all([listProjects(user.uid), listPortfolios(user.uid)]);
      return { projects, portfolios };
    },
    [user.uid],
    'projects.list',
  );

  const portfolioNames = useMemo(
    () => new Map(state.status === 'success' ? state.data.portfolios.map((p) => [p.id, p.name]) : []),
    [state],
  );
  const visible = state.status === 'success' ? state.data.projects.filter((p) => filter === ALL || p.portfolioId === filter) : [];

  return (
    <>
      <PageHeader
        title={t('projects:list.title')}
        description={t('projects:list.description')}
        actions={<LinkButton to={ROUTES.projectNew()}>{t('projects:list.new')}</LinkButton>}
      />
      <RouteNotice />
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && (
        <ErrorState message={`${t('projects:list.loadError')} ${errorMessage(state.error)}`} onRetry={state.reload} />
      )}
      {state.status === 'success' && state.data.projects.length === 0 && (
        <EmptyState
          title={t('projects:list.empty.title')}
          description={t('projects:list.empty.description')}
          action={<LinkButton to={ROUTES.projectNew()}>{t('projects:list.empty.action')}</LinkButton>}
        />
      )}
      {state.status === 'success' && state.data.projects.length > 0 && (
        <>
          <div className="mb-6 max-w-xs">
            <SelectField
              label={t('projects:list.filterLabel')}
              value={filter}
              options={[
                { value: ALL, label: t('projects:list.filterAll') },
                ...state.data.portfolios.map((p) => ({ value: p.id, label: p.name })),
              ]}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
          {visible.length === 0 ? (
            <p className="text-ink-soft">{t('projects:list.emptyFiltered')}</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} portfolioName={portfolioNames.get(project.portfolioId)} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
