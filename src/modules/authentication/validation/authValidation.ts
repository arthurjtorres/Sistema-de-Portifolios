import {
  email,
  maxLength,
  minLength,
  required,
  validate,
  type FieldErrors,
  type ValidationSchema,
} from '@/lib/validation';
import type { SignInInput, SignUpInput } from '../types';

/** Tamanho mínimo de senha exigido pelo Firebase Authentication (padrão). */
export const PASSWORD_MIN_LENGTH = 6;
/** Limite do nome de exibição. */
export const DISPLAY_NAME_MAX_LENGTH = 80;

/** Valores do formulário de cadastro, incluindo a confirmação de senha. */
export interface SignUpFormValues extends SignUpInput {
  passwordConfirmation: string;
}

const signInSchema: ValidationSchema<SignInInput> = {
  email: [required, email],
  password: [required],
};

const signUpSchema: ValidationSchema<SignUpFormValues> = {
  displayName: [required, maxLength(DISPLAY_NAME_MAX_LENGTH)],
  email: [required, email],
  password: [required, minLength(PASSWORD_MIN_LENGTH)],
  passwordConfirmation: [required],
};

/** Valida o formulário de login. */
export function validateSignIn(values: SignInInput): FieldErrors<SignInInput> {
  return validate(values, signInSchema);
}

/** Valida o formulário de cadastro, incluindo a igualdade das senhas. */
export function validateSignUp(values: SignUpFormValues): FieldErrors<SignUpFormValues> {
  const errors = validate(values, signUpSchema);
  if (!errors.passwordConfirmation && values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation = { key: 'passwordMismatch' };
  }
  return errors;
}

/** Valida o formulário de recuperação de senha. */
export function validatePasswordReset(values: { email: string }): FieldErrors<{ email: string }> {
  return validate(values, { email: [required, email] });
}
