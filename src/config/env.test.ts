import { describe, expect, it } from 'vitest';
import { parseFirebaseEnv } from './env';

const valid = {
  VITE_FIREBASE_API_KEY: 'k',
  VITE_FIREBASE_AUTH_DOMAIN: 'd',
  VITE_FIREBASE_PROJECT_ID: 'p',
  VITE_FIREBASE_STORAGE_BUCKET: 'b',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 's',
  VITE_FIREBASE_APP_ID: 'a',
};

describe('parseFirebaseEnv', () => {
  it('aceita configuração completa', () => {
    const result = parseFirebaseEnv(valid);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.projectId).toBe('p');
      expect(result.config.useEmulators).toBe(false);
    }
  });

  it('lista as variáveis ausentes ou em branco', () => {
    const result = parseFirebaseEnv({ ...valid, VITE_FIREBASE_API_KEY: '  ', VITE_FIREBASE_APP_ID: undefined });
    expect(result).toEqual({ ok: false, missing: ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_APP_ID'] });
  });

  it('habilita emuladores somente com "true"', () => {
    const result = parseFirebaseEnv({ ...valid, VITE_USE_FIREBASE_EMULATORS: 'true' });
    expect(result.ok && result.config.useEmulators).toBe(true);
  });
});
