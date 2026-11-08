import { createContext, useContext } from 'react';
import type { AuthStatus, AuthUser, SignInInput, SignUpInput } from '../types';

/** Contrato exposto pelo provedor de autenticação. */
export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  /** Encerra a sessão e reinicia o estado da aplicação (limpa caches em memória). */
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Acessa a sessão. Deve ser usado dentro de `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }
  return value;
}

/** Retorna o usuário autenticado; para uso exclusivo em telas protegidas. */
export function useAuthenticatedUser(): AuthUser {
  const { user } = useAuth();
  if (!user) {
    throw new Error('useAuthenticatedUser usado fora de uma rota protegida.');
  }
  return user;
}
