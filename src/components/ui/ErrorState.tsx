import { useTranslation } from 'react-i18next';
import { Alert } from './Alert';
import { Button } from './Button';

/** Erro de carregamento com opção de tentar novamente. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation(['common']);
  return (
    <div className="flex flex-col items-start gap-3">
      <Alert tone="error">{message}</Alert>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t('common:actions.retry')}
        </Button>
      )}
    </div>
  );
}
