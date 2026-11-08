import { describe, expect, it } from 'vitest';
import { email, hasErrors, isHttpUrl, maxLength, minLength, optionalHttpUrl, required, validate } from './validation';

describe('regras de validação', () => {
  it('required rejeita vazio e só espaços', () => {
    expect(required('')).toEqual({ key: 'required' });
    expect(required('   ')).toEqual({ key: 'required' });
    expect(required('a')).toBeNull();
  });

  it('minLength e maxLength informam o limite', () => {
    expect(minLength(6)('abc')).toEqual({ key: 'minLength', params: { min: 6 } });
    expect(minLength(3)('abc')).toBeNull();
    expect(maxLength(3)('abcd')).toEqual({ key: 'maxLength', params: { max: 3 } });
    expect(maxLength(3)('  abc  ')).toBeNull();
  });

  it('email valida formato básico', () => {
    expect(email('a@b.co')).toBeNull();
    expect(email('a@b')).toEqual({ key: 'email' });
    expect(email('sem-arroba')).toEqual({ key: 'email' });
  });

  it('URL aceita apenas http(s)', () => {
    expect(isHttpUrl('https://exemplo.com/x')).toBe(true);
    expect(isHttpUrl('http://exemplo.com')).toBe(true);
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('exemplo.com')).toBe(false);
    expect(optionalHttpUrl('')).toBeNull();
    expect(optionalHttpUrl('ftp://x.com')).toEqual({ key: 'url' });
  });

  it('validate retorna o primeiro erro de cada campo', () => {
    const errors = validate({ name: '', mail: 'x' }, { name: [required, maxLength(5)], mail: [required, email] });
    expect(errors.name).toEqual({ key: 'required' });
    expect(errors.mail).toEqual({ key: 'email' });
    expect(hasErrors(errors)).toBe(true);
    expect(hasErrors({})).toBe(false);
  });
});
