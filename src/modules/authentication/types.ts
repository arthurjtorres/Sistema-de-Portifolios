/** Dados mínimos do usuário autenticado expostos à aplicação. */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

/** Estado da sessão. `loading` cobre a restauração inicial da sessão persistida. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Dados do formulário de cadastro. */
export interface SignUpInput {
  displayName: string;
  email: string;
  password: string;
}

/** Dados do formulário de login. */
export interface SignInInput {
  email: string;
  password: string;
}
