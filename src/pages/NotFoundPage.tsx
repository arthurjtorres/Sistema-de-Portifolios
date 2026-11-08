import { useTranslation } from 'react-i18next';
import { LinkButton } from '@/components/ui/LinkButton';
import { ROUTES } from '@/config/routes';

/** Página exibida para rotas inexistentes. */
export function NotFoundPage() {
  const { t } = useTranslation(['common']);
  return (
    <main id="conteudo" className="mx-auto flex min-h-screen max-w-md flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-3xl font-bold">{t('common:notFound.title')}</h1>
      <p className="text-ink-soft">{t('common:notFound.description')}</p>
      <LinkButton to={ROUTES.dashboard}>{t('common:notFound.action')}</LinkButton>
    </main>
  );
}
