import type { ReactNode } from 'react';

/**
 * Estado vazio como convite à ação. O desenho de molduras sobrepostas remete
 * a um portfólio aguardando conteúdo.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-line-strong px-6 py-10 sm:px-10">
      <svg viewBox="0 0 64 48" className="h-12 w-16 text-line-strong" aria-hidden="true">
        <rect x="2" y="8" width="34" height="38" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="26" y="2" width="34" height="38" rx="2" className="fill-accent-soft stroke-accent" strokeWidth="2" />
      </svg>
      <div className="max-w-prose">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1.5 text-ink-soft">{description}</p>
      </div>
      {action}
    </section>
  );
}
