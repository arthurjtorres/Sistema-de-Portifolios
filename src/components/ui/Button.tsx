import type { ComponentProps } from 'react';
import { buttonClassName, type ButtonSize, type ButtonVariant } from './buttonStyles';
import { Spinner } from './Spinner';

/** Propriedades do botão. */
export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Exibe indicador de progresso, desabilita o botão e marca `aria-busy`. */
  isLoading?: boolean;
}

/** Botão padrão. O tipo padrão é `button` para evitar submissões acidentais. */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, size, className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}
