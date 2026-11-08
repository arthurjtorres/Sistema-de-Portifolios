import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { Alert } from '@/components/ui/Alert';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { noticeState } from '@/components/shared/RouteNotice';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useMessages } from '@/hooks/useMessages';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { listPortfolios } from '@/modules/portfolios/repositories/portfolioRepository';
import { ProjectForm } from '@/modules/projects/components/ProjectForm';
import { getProject } from '@/modules/projects/repositories/projectRepository';
import { updateProjectWithImages } from '@/modules/projects/services/projectService';

/** Edição de projeto. */
export function EditProjectPage() {
  const { projectId = '' } = useParams();
  const { t } = useTranslation(['projects']);
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const { errorMessage } = useMessages();
  const state = useAsyncData(
    async () => {
      const [project, portfolios] = await Promise.all([getProject(user.uid, projectId), listPortfolios(user.uid)]);
      return { project, portfolios };
    },
    [user.uid, projectId],
    'projects.edit',
  );

  if (state.status === 'loading') {
    return <LoadingState />;
  }
  if (state.status === 'error') {
    return <ErrorState message={`${t('projects:detail.loadError')} ${errorMessage(state.error)}`} onRetry={state.reload} />;
  }
  const { project, portfolios } = state.data;
  if (!project) {
    return <Alert tone="error">{t('projects:detail.notFound')}</Alert>;
  }

  return (
    <>
      <PageHeader
        title={t('projects:form.editTitle')}
        back={{ to: ROUTES.projectDetail(project.id), label: project.name }}
      />
      <ProjectForm
        initial={project}
        portfolios={portfolios}
        submitLabel={t('projects:form.submitEdit')}
        cancelTo={ROUTES.projectDetail(project.id)}
        onSubmit={async (values, cover, gallery, onProgress) => {
          const imagesNotRemoved = await updateProjectWithImages(user.uid, project, values, cover, gallery, onProgress);
          navigate(ROUTES.projectDetail(project.id), {
            state: noticeState('projects', imagesNotRemoved ? 'updatedWithWarning' : 'updated'),
          });
        }}
      />
    </>
  );
}
