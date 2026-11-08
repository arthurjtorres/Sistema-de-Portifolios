import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ImageThumb } from '@/components/shared/ImageThumb';
import { ROUTES } from '@/config/routes';
import type { Portfolio } from '../types';

/** Cartão de portfólio; toda a área é um único link para o detalhe. */
export function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  const { t } = useTranslation(['portfolios']);
  return (
    <Link
      to={ROUTES.portfolioDetail(portfolio.id)}
      aria-label={t('portfolios:card.open', { name: portfolio.name })}
      className="group block overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-accent"
    >
      <ImageThumb image={portfolio.coverImage} alt="" />
      <div className="p-4">
        <h3 className="text-lg font-semibold break-words group-hover:text-accent">{portfolio.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
          {portfolio.description || t('portfolios:card.noDescription')}
        </p>
      </div>
    </Link>
  );
}
