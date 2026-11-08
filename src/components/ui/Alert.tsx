import type { ReactNode } from 'react';

/** Tom da mensagem. Cada tom tem ícone próprio para não depender só de cor. */
export type AlertTone = 'error' | 'success' | 'info' | 'warning';

const TONE_CLASS: Record<AlertTone, string> = {
  error: 'border-danger/30 bg-danger-soft text-danger',
  success: 'border-success/30 bg-success-soft text-success',
  info: 'border-accent/25 bg-accent-soft text-accent-strong',
  warning: 'border-warning/30 bg-warning-soft text-warning',
};

const ICON_PATH: Record<AlertTone, string> = {
  error: 'M12 8v5m0 3h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  success: 'm5 12.5 4.5 4.5L19 7.5',
  info: 'M12 16v-5m0-3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  warning: 'M12 8v5m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

/** Mensagem contextual. Erros usam `role="alert"`; demais, `role="status"`. */
export function Alert({ tone, children }: { tone: AlertTone; children: ReactNode }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm ${TONE_CLASS[tone]}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={ICON_PATH[tone]} />
      </svg>
      <div>{children}</div>
    </div>
  );
}
