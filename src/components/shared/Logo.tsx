import { useTranslation } from 'react-i18next';

/** Marca do produto: duas molduras sobrepostas (portfólio e projeto) e o nome. */
export function Logo({ className = '' }: { className?: string }) {
  const { t } = useTranslation(['common']);
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <rect x="5" y="8" width="14" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect x="13" y="6" width="14" height="17" rx="2" className="fill-accent" />
      </svg>
      <span className="font-display text-lg font-bold">{t('common:app.name')}</span>
    </span>
  );
}
