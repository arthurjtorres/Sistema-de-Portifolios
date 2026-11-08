import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { ReorderButtons } from '@/components/shared/ReorderButtons';
import { RouteNotice, noticeState } from '@/components/shared/RouteNotice';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useMessages } from '@/hooks/useMessages';
import { logError, toAppError } from '@/lib/errors';
import { applySwap, computeSwap } from '@/lib/ordering';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { getPortfolio } from '@/modules/portfolios/repositories/portfolioRepository';
import { deletePortfolio } from '@/modules/portfolios/services/portfolioService';
import { ImageThumb } from '@/components/shared/ImageThumb';
import { Link } from 'react-router';
import { listProjectsByPortfolio, setProjectSortOrder } from '@/modules/projects/repositories/projectRepository';

/** Detalhe do portfólio: capa, descrição e projetos relacionados (com reordenação). */
export function PortfolioDetailPage() {
  const { portfolioId = '' } = useParams();
  const { t } = useTranslation(['portfolios', 'projects', 'common']);
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const { errorMessage } = useMessages();

  const state = useAsyncData(
    async () => {
      const portfolio = await getPortfolio(user.uid, portfolioId);
      const projects = portfolio ? await listProjectsByPortfolio(user.uid, portfolioId) : [];
      return { portfolio, projects };
    },
    [user.uid, portfolioId],
    'portfolios.detail',
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState(false);

  if (state.status === 'loading') {
    return <LoadingState />;
  }
  if (state.status === 'error') {
    return <ErrorState message={`${t('portfolios:detail.loadError')} ${errorMessage(state.error)}`} onRetry={state.reload} />;
  }
  const loaded = state.data;
  const { portfolio, projects } = loaded;
  if (!portfolio) {
    return <Alert tone="error">{t('portfolios:detail.notFound')}</Alert>;
  }

  async function handleDelete() {
    if (!portfolio) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deletePortfolio(user.uid, portfolio);
      navigate(ROUTES.portfolios, { state: noticeState('portfolios', 'deleted') });
    } catch (error) {
      logError('portfolios.delete', error);
      setDeleteError(errorMessage(toAppError(error)));
      setIsDeleting(false);
    }
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const swap = computeSwap(projects, id, direction);
    if (!swap) {
      return;
    }
    setReorderError(false);
    setIsReordering(true);
    const previous = loaded;
    state.setData((current) => ({ ...current, projects: applySwap(current.projects, swap) }));
    try {
      await Promise.all([
        setProjectSortOrder(user.uid, swap.first.id, swap.first.sortOrder),
        setProjectSortOrder(user.uid, swap.second.id, swap.second.sortOrder),
      ]);
    } catch (error) {
      logError('projects.reorder', error);
      state.setData(() => previous);
      setReorderError(true);
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <>
      <PageHeader
        title={portfolio.name}
        description={portfolio.description || undefined}
        back={{ to: ROUTES.portfolios, label: t('portfolios:detail.backToList') }}
        actions={
          <>
            <LinkButton to={ROUTES.portfolioEdit(portfolio.id)} variant="secondary">
              {t('common:actions.edit')}
            </LinkButton>
            <Button variant="ghost" className="text-danger" onClick={() => setIsDeleteOpen(true)}>
              {t('portfolios:delete.action')}
            </Button>
          </>
        }
      />
      <RouteNotice />

      {portfolio.coverImage && (
        <img
          src={portfolio.coverImage.url}
          alt=""
          className="mb-10 aspect-[16/6] w-full rounded-lg object-cover"
        />
      )}

      <section aria-labelledby="portfolio-projects">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="portfolio-projects" className="text-xl font-semibold">
            {t('portfolios:detail.projectsTitle')}
          </h2>
          {projects.length > 0 && (
            <LinkButton to={ROUTES.projectNew(portfolio.id)} size="sm">
              {t('portfolios:detail.addProject')}
            </LinkButton>
          )}
        </div>
        {reorderError && (
          <div className="mb-4">
            <Alert tone="error">{t('projects:list.reorderFailed')}</Alert>
          </div>
        )}
        {projects.length === 0 ? (
          <EmptyState
            title={t('portfolios:detail.emptyProjects.title')}
            description={t('portfolios:detail.emptyProjects.description')}
            action={<LinkButton to={ROUTES.projectNew(portfolio.id)}>{t('portfolios:detail.emptyProjects.action')}</LinkButton>}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {projects.map((project, index, all) => (
              <li key={project.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 sm:gap-4">
                <ImageThumb image={project.coverImage} alt="" className="hidden w-28 shrink-0 rounded-md sm:block" />
                <Link to={ROUTES.projectDetail(project.id)} className="min-w-0 flex-1 text-lg font-semibold break-words hover:text-accent">
                  {project.name}
                </Link>
                <ReorderButtons
                  name={project.name}
                  canMoveUp={index > 0}
                  canMoveDown={index < all.length - 1}
                  disabled={isReordering}
                  onMove={(direction) => void handleMove(project.id, direction)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={isDeleteOpen}
        title={t('portfolios:delete.title', { name: portfolio.name })}
        description={t('portfolios:delete.description')}
        confirmLabel={t('portfolios:delete.confirm')}
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteError(undefined);
        }}
      />
    </>
  );
}
