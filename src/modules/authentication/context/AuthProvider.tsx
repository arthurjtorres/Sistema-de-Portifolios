import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/config/routes';
import * as authService from '../services/authService';
import type { AuthStatus, AuthUser, SignInInput, SignUpInput } from '../types';
import { AuthContext, type AuthContextValue } from './AuthContext';

/**
 * Mantém o estado de sessão sincronizado com o Firebase Authentication.
 * Enquanto a sessão persistida é restaurada, `status` permanece `loading`
 * para que as rotas não redirecionem prematuramente.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthState((nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'unauthenticated');
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (input: SignInInput) => {
    const signedIn = await authService.signIn(input);
    setUser(signedIn);
    setStatus('authenticated');
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    // O observador de sessão dispara antes do updateProfile; atualizamos com o nome definido.
    const created = await authService.signUp(input);
    setUser(created);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    // Recarregar descarta todo estado em memória (inclusive o cache do Firestore),
    // evitando que dados do usuário anterior fiquem visíveis em dispositivo compartilhado.
    window.location.assign(ROUTES.login);
  }, []);

  const sendPasswordReset = useCallback(
    (email: string) => authService.sendPasswordReset(email, i18n.language),
    [i18n.language],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signOut, sendPasswordReset }),
    [status, user, signIn, signUp, signOut, sendPasswordReset],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
