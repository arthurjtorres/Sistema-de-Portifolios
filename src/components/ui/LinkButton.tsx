import { Link, type LinkProps } from 'react-router';
import { buttonClassName, type ButtonSize, type ButtonVariant } from './buttonStyles';

/** Link de navegação com aparência de botão. */
export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClassName(variant, size, className)} {...rest} />;
}
