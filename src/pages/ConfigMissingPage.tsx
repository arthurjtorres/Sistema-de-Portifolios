import { useTranslation } from 'react-i18next';

/** Exibida quando faltam variáveis de ambiente do Firebase; lista exatamente quais. */
export function ConfigMissingPage({ missing }: { missing: string[] }) {
  const { t } = useTranslation(['common']);
  return (
    <main id="conteudo" className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-bold">{t('common:config.title')}</h1>
      <p className="text-ink-soft">{t('common:config.description')}</p>
      <ul className="rounded-md border border-line bg-surface p-4 font-mono text-sm">
        {missing.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p className="text-sm text-muted">{t('common:config.docs')}</p>
    </main>
  );
}
