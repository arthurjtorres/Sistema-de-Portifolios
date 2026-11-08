import type { InputHTMLAttributes } from 'react';
import { CONTROL_CLASS, FormField } from './FormField';

/** Campo de texto com rótulo, dica e erro. */
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, className = '', ...inputProps }: TextFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint}>
      {({ inputId, describedBy }) => (
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${CONTROL_CLASS} h-11 ${error ? 'border-danger' : 'border-line-strong'} ${className}`}
          {...inputProps}
        />
      )}
    </FormField>
  );
}
