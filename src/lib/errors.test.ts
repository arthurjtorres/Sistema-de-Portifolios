import { describe, expect, it } from 'vitest';
import { AppError, mapErrorCode, toAppError } from './errors';

describe('mapErrorCode', () => {
  it('mapeia códigos conhecidos do Firebase', () => {
    expect(mapErrorCode({ code: 'auth/invalid-credential' })).toBe('invalidCredentials');
    expect(mapErrorCode({ code: 'auth/email-already-in-use' })).toBe('emailInUse');
    expect(mapErrorCode({ code: 'permission-denied' })).toBe('permissionDenied');
    expect(mapErrorCode({ code: 'storage/unauthorized' })).toBe('permissionDenied');
  });

  it('usa unknown para erros não mapeados', () => {
    expect(mapErrorCode(new Error('x'))).toBe('unknown');
    expect(mapErrorCode({ code: 'algo/novo' })).toBe('unknown');
    expect(mapErrorCode(null)).toBe('unknown');
  });

  it('preserva o código de AppError', () => {
    expect(mapErrorCode(new AppError('portfolioHasProjects'))).toBe('portfolioHasProjects');
  });
});

describe('toAppError', () => {
  it('não reembrulha AppError e mantém a causa nos demais', () => {
    const original = new AppError('network');
    expect(toAppError(original)).toBe(original);
    const cause = { code: 'unavailable' };
    const wrapped = toAppError(cause);
    expect(wrapped.code).toBe('unavailable');
    expect(wrapped.cause).toBe(cause);
  });
});
