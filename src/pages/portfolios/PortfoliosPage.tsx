import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ImageThumb } from '@/components/shared/ImageThumb';
import { ReorderButtons } from '@/components/shared/ReorderButtons';
import { RouteNotice } from '@/components/shared/RouteNotice';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LinkButton } from '@/components/ui/LinkButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useMessages } from '@/hooks/useMessages';
import { logError } from '@/lib/errors';
import { applySwap, computeSwap } from '@/lib/ordering';
import { useAuthenticatedUser } from '@/modules/authentication/context/AuthContext';
import { listPortfolios, setPortfolioSortOrder } from '@/modules/portfolios/repositories/portfolioRepository';

/** Lista de portfólios com reordenação. */
export function PortfoliosPage() {
  const { t } = useTranslation(['portfolios', 'common']);
  const user = useAuthenticatedUser();
  const { errorMessage } = useMessages();
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState(false);
  const state = useAsyncData(() => listPortfolios(user.uid), [user.uid], 'portfolios.list');

  async function handleMove(id: string, direction: 'up' | 'down') {
    if (state.status !== 'success') {
      return;
    }
    const swap = computeSwap(state.data, id, direction);
    if (!swap) {
      return;
    }
    setReorderError(false);
    setIsReordering(true);
    const previous = state.data;
    state.setData((items) => applySwap(items, swap));
    try {
      await Promise.all([
        setPortfolioSortOrder(user.uid, swap.first.id, swap.first.sortOrder),
        setPortfolioSortOrder(user.uid, swap.second.id, swap.second.sortOrder),
      ]);
    } catch (error) {
      logError('portfolios.reorder', error);
      state.setData(() => previous);
      setReorderError(true);
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <>
      <PageHeader
        title={t('portfolios:list.title')}
        description={t('portfolios:list.description')}
        actions={<LinkButton to={ROUTES.portfolioNew}>{t('portfolios:list.new')}</LinkButton>}
      />

      <RouteNotice />
      {reorderError && (
        <div className="mb-4">
          <Alert tone="error">{t('portfolios:list.reorderFailed')}</Alert>
        </div>
      )}
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && (
        <ErrorState message={`${t('portfolios:list.loadError')} ${errorMessage(state.error)}`} onRetry={state.reload} />
      )}
      {state.status === 'success' && state.data.length === 0 && (
        <EmptyState
          title={t('portfolios:list.empty.title')}
          description={t('portfolios:list.empty.description')}
          action={<LinkButton to={ROUTES.portfolioNew}>{t('portfolios:list.empty.action')}</LinkButton>}
        />
      )}
      {state.status === 'success' && state.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {state.data.map((portfolio, index, all) => (
            <li
              key={portfolio.id}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 sm:gap-4"
            >
              <ImageThumb image={portfolio.coverImage} alt="" className="hidden w-28 shrink-0 rounded-md sm:block" />
              <div className="min-w-0 flex-1">
                <Link
                  to={ROUTES.portfolioDetail(portfolio.id)}
                  className="text-lg font-semibold break-words hover:text-accent"
                >
                  {portfolio.name}
                </Link>
                <p className="line-clamp-1 text-sm text-ink-soft">
                  {portfolio.description || t('portfolios:card.noDescription')}
                </p>
              </div>
              <ReorderButtons
                name={portfolio.name}
                canMoveUp={index > 0}
                canMoveDown={index < all.length - 1}
                disabled={isReordering}
                onMove={(direction) => void handleMove(portfolio.id, direction)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
