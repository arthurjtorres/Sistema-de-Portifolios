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
import { PortfolioForm } from '@/modules/portfolios/components/PortfolioForm';
import { getPortfolio } from '@/modules/portfolios/repositories/portfolioRepository';
import { updatePortfolioWithCover } from '@/modules/portfolios/services/portfolioService';

/** Edição de portfólio. */
export function EditPortfolioPage() {
  const { portfolioId = '' } = useParams();
  const { t } = useTranslation(['portfolios']);
  const user = useAuthenticatedUser();
  const navigate = useNavigate();
  const { errorMessage } = useMessages();
  const state = useAsyncData(() => getPortfolio(user.uid, portfolioId), [user.uid, portfolioId], 'portfolios.get');

  const back = { to: ROUTES.portfolioDetail(portfolioId), label: t('portfolios:detail.backToList') };

  if (state.status === 'loading') {
    return <LoadingState />;
  }
  if (state.status === 'error') {
    return <ErrorState message={`${t('portfolios:detail.loadError')} ${errorMessage(state.error)}`} onRetry={state.reload} />;
  }
  const portfolio = state.data;
  if (!portfolio) {
    return <Alert tone="error">{t('portfolios:detail.notFound')}</Alert>;
  }

  return (
    <>
      <PageHeader title={t('portfolios:form.editTitle')} back={{ ...back, label: portfolio.name }} />
      <PortfolioForm
        initial={portfolio}
        submitLabel={t('portfolios:form.submitEdit')}
        cancelTo={ROUTES.portfolioDetail(portfolio.id)}
        onSubmit={async (values, cover, onProgress) => {
          const imagesNotRemoved = await updatePortfolioWithCover(user.uid, portfolio, values, cover, onProgress);
          navigate(ROUTES.portfolioDetail(portfolio.id), {
            state: noticeState('portfolios', imagesNotRemoved ? 'updatedWithWarning' : 'updated'),
          });
        }}
      />
    </>
  );
}
