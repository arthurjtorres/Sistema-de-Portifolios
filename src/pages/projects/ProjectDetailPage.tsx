import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { RouteNotice, noticeState } from '@/components/shared/RouteNotice';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useMessages } from '@/hooks/useMessages';
import { logError, toAppError } from '@/lib/errors';
import { isHttpUrl } from '@/lib/validation';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { getPortfolio } from '@/modules/portfolios/repositories/portfolioRepository';
import { getProject } from '@/modules/projects/repositories/projectRepository';
import { deleteProject } from '@/modules/projects/services/projectService';

/** Detalhe do projeto: capa, descrição, link externo, galeria e exclusão. */
export function ProjectDetailPage() {
  const { projectId = '' } = useParams();
  const { t } = useTranslation(['projects', 'media', 'common']);
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const { errorMessage } = useMessages();
  const state = useAsyncData(
    async () => {
      const project = await getProject(user.uid, projectId);
      const portfolio = project ? await getPortfolio(user.uid, project.portfolioId) : null;
      return { project, portfolio };
    },
    [user.uid, projectId],
    'projects.detail',
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  if (state.status === 'loading') {
    return <LoadingState />;
  }
  if (state.status === 'error') {
    return <ErrorState message={`${t('projects:detail.loadError')} ${errorMessage(state.error)}`} onRetry={state.reload} />;
  }
  const { project, portfolio } = state.data;
  if (!project) {
    return <Alert tone="error">{t('projects:detail.notFound')}</Alert>;
  }

  async function handleDelete() {
    if (!project) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(undefined);
    try {
      await deleteProject(user.uid, project);
      navigate(portfolio ? ROUTES.portfolioDetail(portfolio.id) : ROUTES.projects, { state: noticeState('projects', 'deleted') });
    } catch (error) {
      logError('projects.delete', error);
      setDeleteError(errorMessage(toAppError(error)));
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title={project.name}
        back={
          portfolio
            ? { to: ROUTES.portfolioDetail(portfolio.id), label: portfolio.name }
            : { to: ROUTES.projects, label: t('projects:detail.backToList') }
        }
        actions={
          <>
            <LinkButton to={ROUTES.projectEdit(project.id)} variant="secondary">
              {t('common:actions.edit')}
            </LinkButton>
            <Button variant="ghost" className="text-danger" onClick={() => setIsDeleteOpen(true)}>
              {t('projects:delete.action')}
            </Button>
          </>
        }
      />
      <RouteNotice />

      {project.coverImage && (
        <img
          src={project.coverImage.url}
          alt={t('media:alt.cover', { name: project.name })}
          className="mb-8 aspect-[16/8] w-full rounded-lg object-cover"
        />
      )}

      <div className="flex max-w-2xl flex-col gap-6">
        <p className="whitespace-pre-line text-ink-soft">{project.description || t('projects:detail.noDescription')}</p>
        {portfolio && (
          <p className="text-sm text-muted">
            {t('projects:detail.portfolio')}:{' '}
            <Link to={ROUTES.portfolioDetail(portfolio.id)} className="text-accent underline underline-offset-2">
              {portfolio.name}
            </Link>
          </p>
        )}
        {project.externalUrl && isHttpUrl(project.externalUrl) && (
          <a
            href={project.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit font-medium text-accent underline underline-offset-2"
          >
            {t('projects:detail.externalLink')}
          </a>
        )}
      </div>

      {project.images.length > 0 && (
        <section aria-labelledby="project-gallery" className="mt-10">
          <h2 id="project-gallery" className="mb-4 text-xl font-semibold">
            {t('projects:detail.gallery')}
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {project.images.map((image, index) => (
              <li key={image.path} className="aspect-square overflow-hidden rounded-md border border-line">
                <img
                  src={image.url}
                  alt={t('media:alt.gallery', { index: index + 1, name: project.name })}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        title={t('projects:delete.title', { name: project.name })}
        description={t('projects:delete.description')}
        confirmLabel={t('projects:delete.confirm')}
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
