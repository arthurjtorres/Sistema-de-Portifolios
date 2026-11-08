/**
 * Códigos de erro de domínio exibíveis ao usuário. Cada código possui uma chave
 * correspondente em `src/i18n/locales/<idioma>/errors.json`.
 */
export type ErrorCode =
  | 'invalidCredentials'
  | 'emailInUse'
  | 'weakPassword'
  | 'invalidEmail'
  | 'userDisabled'
  | 'tooManyRequests'
  | 'network'
  | 'unauthenticated'
  | 'permissionDenied'
  | 'notFound'
  | 'unavailable'
  | 'quotaExceeded'
  | 'uploadCanceled'
  | 'uploadFailed'
  | 'invalidFileType'
  | 'fileTooLarge'
  | 'tooManyImages'
  | 'portfolioHasProjects'
  | 'portfolioNotFound'
  | 'unknown';

/**
 * Erro da aplicação com código estável. A mensagem técnica (`message`) serve para logs;
 * a mensagem exibida ao usuário vem da tradução do `code`.
 */
export class AppError extends Error {
  /** Código usado para escolher a mensagem traduzida. */
  readonly code: ErrorCode;

  constructor(code: ErrorCode, options?: { message?: string; cause?: unknown }) {
    super(options?.message ?? code, { cause: options?.cause });
    this.name = 'AppError';
    this.code = code;
  }
}

/** Mapa de códigos do SDK do Firebase (Auth, Firestore, Storage) para códigos de domínio. */
const FIREBASE_CODE_MAP: Record<string, ErrorCode> = {
  'auth/invalid-credential': 'invalidCredentials',
  'auth/wrong-password': 'invalidCredentials',
  'auth/user-not-found': 'invalidCredentials',
  'auth/invalid-login-credentials': 'invalidCredentials',
  'auth/email-already-in-use': 'emailInUse',
  'auth/weak-password': 'weakPassword',
  'auth/password-does-not-meet-requirements': 'weakPassword',
  'auth/invalid-email': 'invalidEmail',
  'auth/missing-email': 'invalidEmail',
  'auth/user-disabled': 'userDisabled',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'network',
  'permission-denied': 'permissionDenied',
  'not-found': 'notFound',
  unavailable: 'unavailable',
  'deadline-exceeded': 'unavailable',
  unauthenticated: 'unauthenticated',
  'resource-exhausted': 'quotaExceeded',
  'storage/unauthorized': 'permissionDenied',
  'storage/unauthenticated': 'unauthenticated',
  'storage/canceled': 'uploadCanceled',
  'storage/quota-exceeded': 'quotaExceeded',
  'storage/object-not-found': 'notFound',
  'storage/retry-limit-exceeded': 'network',
};

/** Extrai a propriedade `code` de um erro desconhecido, quando existir. */
function readErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

/** Converte qualquer erro (Firebase, rede, AppError) em um código de domínio. */
export function mapErrorCode(error: unknown): ErrorCode {
  if (error instanceof AppError) {
    return error.code;
  }
  const code = readErrorCode(error);
  if (code && code in FIREBASE_CODE_MAP) {
    return FIREBASE_CODE_MAP[code] ?? 'unknown';
  }
  return 'unknown';
}

/** Normaliza um erro desconhecido em `AppError`, preservando a causa original. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError(mapErrorCode(error), {
    message: error instanceof Error ? error.message : String(error),
    cause: error,
  });
}

/**
 * Registra um erro técnico sem dados pessoais: apenas contexto, código e mensagem do SDK.
 * Ponto único para futura integração com um serviço de observabilidade.
 */
export function logError(context: string, error: unknown): void {
  const appError = toAppError(error);
  const firebaseCode = readErrorCode(appError.cause);
  console.error(`[${context}]`, appError.code, firebaseCode ?? '', appError.message);
}
