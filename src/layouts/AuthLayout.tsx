import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/shared/Logo';

/** Moldura das telas de autenticação: formulário à esquerda, painel de identidade à direita. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { t } = useTranslation(['auth']);
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <main id="conteudo" className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-10" />
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 mb-8 text-ink-soft">{subtitle}</p>
          {children}
        </div>
      </main>
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:block" aria-hidden="true">
        <div className="absolute top-24 left-16 h-72 w-56 -rotate-6 rounded-lg border-2 border-white/30" />
        <div className="absolute top-32 left-32 h-72 w-56 rotate-3 rounded-lg bg-accent" />
        <div className="absolute right-16 bottom-16 left-16">
          <p className="font-display text-4xl leading-tight font-bold">{t('auth:aside.headline')}</p>
          <p className="mt-4 max-w-md text-white/75">{t('auth:aside.body')}</p>
        </div>
      </aside>
    </div>
  );
}
