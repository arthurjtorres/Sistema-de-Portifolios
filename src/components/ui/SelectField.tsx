import type { SelectHTMLAttributes } from 'react';
import { CONTROL_CLASS, FormField } from './FormField';

/** Opção de seleção. */
export interface SelectOption {
  value: string;
  label: string;
}

/** Seleção nativa (acessível e adequada a dispositivos móveis). */
export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
}

export function SelectField({
  label,
  options,
  placeholder,
  error,
  hint,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <FormField label={label} error={error} hint={hint}>
      {({ inputId, describedBy }) => (
        <select
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${CONTROL_CLASS} h-11 ${error ? 'border-danger' : 'border-line-strong'} ${className}`}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
