/** Configuração do app Web do Firebase lida das variáveis `VITE_`. */
export interface FirebaseEnvConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  /** Quando verdadeiro, o app conecta aos emuladores locais em vez do projeto real. */
  useEmulators: boolean;
}

/** Resultado da validação do ambiente: configuração válida ou lista de variáveis ausentes. */
export type EnvValidationResult =
  | { ok: true; config: FirebaseEnvConfig }
  | { ok: false; missing: string[] };

/** Variáveis obrigatórias e o campo correspondente na configuração do Firebase. */
const REQUIRED_VARIABLES = {
  VITE_FIREBASE_API_KEY: 'apiKey',
  VITE_FIREBASE_AUTH_DOMAIN: 'authDomain',
  VITE_FIREBASE_PROJECT_ID: 'projectId',
  VITE_FIREBASE_STORAGE_BUCKET: 'storageBucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: 'messagingSenderId',
  VITE_FIREBASE_APP_ID: 'appId',
} as const satisfies Record<string, keyof Omit<FirebaseEnvConfig, 'useEmulators'>>;

/**
 * Valida as variáveis de ambiente necessárias ao Firebase.
 * Função pura (recebe o objeto de ambiente) para ser testável fora do Vite.
 */
export function parseFirebaseEnv(env: Record<string, string | undefined>): EnvValidationResult {
  const missing: string[] = [];
  const partial: Partial<FirebaseEnvConfig> = {};

  for (const [variable, field] of Object.entries(REQUIRED_VARIABLES)) {
    const value = env[variable]?.trim();
    if (!value) {
      missing.push(variable);
    } else {
      partial[field] = value;
    }
  }

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  return {
    ok: true,
    config: { ...(partial as Omit<FirebaseEnvConfig, 'useEmulators'>), useEmulators: env.VITE_USE_FIREBASE_EMULATORS === 'true' },
  };
}
