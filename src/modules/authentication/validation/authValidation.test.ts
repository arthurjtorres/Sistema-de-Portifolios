import { describe, expect, it } from 'vitest';
import { validatePasswordReset, validateSignIn, validateSignUp } from './authValidation';

describe('validação de autenticação', () => {
  it('login exige e-mail válido e senha', () => {
    const errors = validateSignIn({ email: 'x', password: '' });
    expect(errors.email?.key).toBe('email');
    expect(errors.password?.key).toBe('required');
    expect(validateSignIn({ email: 'a@b.co', password: '123' })).toEqual({});
  });

  it('cadastro exige senha mínima e confirmação igual', () => {
    const base = { displayName: 'Ana', email: 'a@b.co', password: '123456', passwordConfirmation: '123456' };
    expect(validateSignUp(base)).toEqual({});
    expect(validateSignUp({ ...base, password: '123', passwordConfirmation: '123' }).password?.key).toBe('minLength');
    expect(validateSignUp({ ...base, passwordConfirmation: 'outra' }).passwordConfirmation?.key).toBe('passwordMismatch');
    expect(validateSignUp({ ...base, displayName: ' ' }).displayName?.key).toBe('required');
  });

  it('recuperação valida o e-mail', () => {
    expect(validatePasswordReset({ email: '' }).email?.key).toBe('required');
    expect(validatePasswordReset({ email: 'a@b.co' })).toEqual({});
  });
});
