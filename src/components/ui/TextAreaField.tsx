import type { TextareaHTMLAttributes } from 'react';
import { CONTROL_CLASS, FormField } from './FormField';

/** Área de texto com rótulo, dica e erro. */
export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextAreaField({ label, error, hint, className = '', ...props }: TextAreaFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint}>
      {({ inputId, describedBy }) => (
        <textarea
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${CONTROL_CLASS} min-h-28 py-2.5 leading-relaxed ${error ? 'border-danger' : 'border-line-strong'} ${className}`}
          {...props}
        />
      )}
    </FormField>
  );
}
