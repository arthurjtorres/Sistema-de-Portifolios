import { useTranslation } from 'react-i18next';

/** Botões acessíveis de subir/descer para definir a ordem de exibição (alternativa a arrastar). */
export function ReorderButtons({
  name,
  canMoveUp,
  canMoveDown,
  disabled,
  onMove,
}: {
  name: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
  onMove: (direction: 'up' | 'down') => void;
}) {
  const { t } = useTranslation(['common']);
  const base =
    'grid size-8 place-items-center rounded-md text-ink-soft hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30';
  return (
    <div className="flex">
      <button type="button" className={base} disabled={disabled || !canMoveUp} aria-label={t('common:actions.moveUp', { name })} onClick={() => onMove('up')}>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button type="button" className={base} disabled={disabled || !canMoveDown} aria-label={t('common:actions.moveDown', { name })} onClick={() => onMove('down')}>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}
