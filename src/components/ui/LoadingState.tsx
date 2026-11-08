import { useTranslation } from 'react-i18next';
import { Spinner } from './Spinner';

/** Carregamento de seção, anunciado a leitores de tela. */
export function LoadingState({ label }: { label?: string }) {
  const { t } = useTranslation(['common']);
  return (
    <div role="status" className="flex items-center gap-2.5 py-10 text-muted">
      <Spinner className="size-5" />
      <span>{label ?? t('common:states.loading')}</span>
    </div>
  );
}
