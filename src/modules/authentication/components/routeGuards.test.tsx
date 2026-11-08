import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { makeAuth, renderWithAuth } from '@/test/renderWithAuth';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

const user = { uid: 'u1', email: 'a@b.co', displayName: 'Ana' };

function Tree() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<p>tela de login</p>} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<p>área privada</p>} />
      </Route>
    </Routes>
  );
}

describe('proteção de rotas', () => {
  it('redireciona visitante de rota privada para o login', () => {
    renderWithAuth(<Tree />, makeAuth({ status: 'unauthenticated' }), '/dashboard');
    expect(screen.getByText('tela de login')).toBeInTheDocument();
    expect(screen.queryByText('área privada')).not.toBeInTheDocument();
  });

  it('não redireciona nem mostra conteúdo enquanto a sessão carrega', () => {
    renderWithAuth(<Tree />, makeAuth({ status: 'loading' }), '/dashboard');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('tela de login')).not.toBeInTheDocument();
    expect(screen.queryByText('área privada')).not.toBeInTheDocument();
  });

  it('libera a área privada para usuário autenticado', () => {
    renderWithAuth(<Tree />, makeAuth({ status: 'authenticated', user }), '/dashboard');
    expect(screen.getByText('área privada')).toBeInTheDocument();
  });

  it('tira usuário autenticado das telas públicas', () => {
    renderWithAuth(<Tree />, makeAuth({ status: 'authenticated', user }), '/login');
    expect(screen.queryByText('tela de login')).not.toBeInTheDocument();
  });
});
