import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import { AuthContext, type AuthContextValue } from '@/modules/authentication/context/AuthContext';

/** Contexto de autenticação falso para testes de interface (sem Firebase). */
export function makeAuth(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    status: 'unauthenticated',
    user: null,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    sendPasswordReset: async () => {},
    ...overrides,
  };
}

/** Renderiza com roteador em memória e contexto de autenticação controlado. */
export function renderWithAuth(ui: ReactElement, auth: AuthContextValue, route = '/') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  );
}
