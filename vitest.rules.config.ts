import { defineConfig } from 'vitest/config';

/**
 * Testes das Security Rules do Firestore e do Storage.
 * Devem ser executados via `npm run test:rules`, que sobe os emuladores
 * com `firebase emulators:exec` antes de rodar o Vitest.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});
