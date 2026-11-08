import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirebase } from '@/infrastructure/firebase/firebaseApp';
import { mapErrorCode, toAppError } from '@/lib/errors';
import type { AuthUser, SignInInput, SignUpInput } from '../types';

/** Converte o usuário do SDK no modelo da aplicação. */
export function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName };
}

/** Observa mudanças de sessão. Retorna a função para cancelar a inscrição. */
export function subscribeToAuthState(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(getFirebase().auth, (user) => {
    callback(user ? toAuthUser(user) : null);
  });
}

/** Cria a conta e define o nome de exibição. */
export async function signUp({ displayName, email, password }: SignUpInput): Promise<AuthUser> {
  try {
    const { user } = await createUserWithEmailAndPassword(getFirebase().auth, email.trim(), password);
    await updateProfile(user, { displayName: displayName.trim() });
    return toAuthUser(user);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Autentica com e-mail e senha. */
export async function signIn({ email, password }: SignInInput): Promise<AuthUser> {
  try {
    const { user } = await signInWithEmailAndPassword(getFirebase().auth, email.trim(), password);
    return toAuthUser(user);
  } catch (error) {
    throw toAppError(error);
  }
}

/** Encerra a sessão atual. */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(getFirebase().auth);
  } catch (error) {
    throw toAppError(error);
  }
}

/**
 * Envia o e-mail de redefinição de senha no idioma informado.
 * "Usuário inexistente" é tratado como sucesso para não revelar quais e-mails têm conta.
 */
export async function sendPasswordReset(email: string, languageCode: string): Promise<void> {
  const { auth } = getFirebase();
  auth.languageCode = languageCode;
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    if (mapErrorCode(error) === 'invalidCredentials') {
      return;
    }
    throw toAppError(error);
  }
}
