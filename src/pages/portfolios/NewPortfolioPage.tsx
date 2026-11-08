import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { noticeState } from '@/components/shared/RouteNotice';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { PortfolioForm } from '@/modules/portfolios/components/PortfolioForm';
import { createPortfolioWithCover } from '@/modules/portfolios/services/portfolioService';

/** Criação de portfólio. */
export function NewPortfolioPage() {
  const { t } = useTranslation(['portfolios']);
  const user = useAuthenticatedUser();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={t('portfolios:form.createTitle')}
        back={{ to: ROUTES.portfolios, label: t('portfolios:detail.backToList') }}
      />
      <PortfolioForm
        submitLabel={t('portfolios:form.submitCreate')}
        cancelTo={ROUTES.portfolios}
        onSubmit={async (values, cover, onProgress) => {
          const id = await createPortfolioWithCover(user.uid, values, cover, onProgress);
          navigate(ROUTES.portfolioDetail(id), { state: noticeState('portfolios', 'created') });
        }}
      />
    </>
  );
}
