import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { Alert } from '@/components/ui/Alert';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { noticeState } from '@/components/shared/RouteNotice';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useMessages } from '@/hooks/useMessages';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { listPortfolios } from '@/modules/portfolios/repositories/portfolioRepository';
import { ProjectForm } from '@/modules/projects/components/ProjectForm';
import { createProjectWithImages } from '@/modules/projects/services/projectService';

/** Criação de projeto. Exige ao menos um portfólio existente. */
export function NewProjectPage() {
  const { t } = useTranslation(['projects']);
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { errorMessage } = useMessages();
  const state = useAsyncData(() => listPortfolios(user.uid), [user.uid], 'projects.new.portfolios');

  const header = <PageHeader title={t('projects:form.createTitle')} back={{ to: ROUTES.projects, label: t('projects:detail.backToList') }} />;

  if (state.status === 'loading') {
    return <>{header}<LoadingState /></>;
  }
  if (state.status === 'error') {
    return <>{header}<ErrorState message={errorMessage(state.error)} onRetry={state.reload} /></>;
  }
  if (state.data.length === 0) {
    return (
      <>
        {header}
        <div className="flex max-w-xl flex-col items-start gap-4">
          <Alert tone="info">
            <strong className="block">{t('projects:noPortfolios.title')}</strong>
            {t('projects:noPortfolios.description')}
          </Alert>
          <LinkButton to={ROUTES.portfolioNew}>{t('projects:noPortfolios.action')}</LinkButton>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <ProjectForm
        portfolios={state.data}
        defaultPortfolioId={params.get('portfolioId') ?? undefined}
        submitLabel={t('projects:form.submitCreate')}
        cancelTo={ROUTES.projects}
        onSubmit={async (values, cover, gallery, onProgress) => {
          const id = await createProjectWithImages(user.uid, values, cover, gallery, onProgress);
          navigate(ROUTES.projectDetail(id), { state: noticeState('projects', 'created') });
        }}
      />
    </>
  );
}
