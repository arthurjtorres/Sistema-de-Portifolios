import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Alert } from '@/components/ui/Alert';

/** Chaves de aviso transportadas no `state` da navegação após uma ação concluída. */
export type NoticeKey = 'created' | 'updated' | 'updatedWithWarning' | 'deleted';

/** Aviso com o domínio de origem, para escolher a mensagem correta na tela de destino. */
export interface RouteNoticeState {
  notice: { scope: 'portfolios' | 'projects'; key: NoticeKey };
}

/** Monta o `state` de navegação para exibir um aviso na próxima tela. */
export function noticeState(scope: 'portfolios' | 'projects', key: NoticeKey): RouteNoticeState {
  return { notice: { scope, key } };
}

/**
 * Mostra o resultado de uma ação feita na tela anterior (ex.: "Portfólio criado.").
 * O estado vive no histórico de navegação e é descartado ao recarregar a página.
 */
export function RouteNotice() {
  const { t } = useTranslation(['portfolios', 'projects']);
  const notice = (useLocation().state as Partial<RouteNoticeState> | null)?.notice;
  if (!notice) {
    return null;
  }
  if (notice.key === 'updatedWithWarning') {
    return (
      <div className="mb-6">
        <Alert tone="warning">{t('projects:toast.imagesNotRemoved')}</Alert>
      </div>
    );
  }
  const message =
    notice.scope === 'portfolios' ? t(`portfolios:toast.${notice.key}`) : t(`projects:toast.${notice.key}`);
  return (
    <div className="mb-6">
      <Alert tone="success">{message}</Alert>
    </div>
  );
}
