import { useId, type ReactNode } from 'react';

/** Ids gerados para ligar rótulo, dica e erro ao controle (acessibilidade). */
export interface FieldIds {
  inputId: string;
  describedBy: string | undefined;
}

/** Propriedades comuns aos campos de formulário. */
export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  /** Renderiza o controle recebendo os ids corretos. */
  children: (ids: FieldIds) => ReactNode;
}

/**
 * Estrutura de campo: rótulo, controle, dica e mensagem de erro associada via
 * `aria-describedby`. O erro também é anunciado por leitores de tela.
 */
export function FormField({ label, error, hint, children }: FormFieldProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children({ inputId, describedBy: describedBy || undefined })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Classes base de controles de texto; o estado de erro muda a borda. */
export const CONTROL_CLASS =
  'w-full rounded-md border bg-surface px-3 text-ink placeholder:text-muted/80 transition-colors focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25 disabled:bg-paper';
