import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '@/lib/errors';
import { makeAuth, renderWithAuth } from '@/test/renderWithAuth';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('renderiza o formulário', () => {
    renderWithAuth(<LoginPage />, makeAuth());
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/signup');
  });

  it('valida campos e não chama o login quando inválido', async () => {
    const signIn = vi.fn();
    renderWithAuth(<LoginPage />, makeAuth({ signIn }));
    await userEvent.type(screen.getByLabelText('E-mail'), 'invalido');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText(/Informe um e-mail válido/)).toBeInTheDocument();
    expect(screen.getByText('Preencha este campo.')).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  it('envia credenciais válidas', async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    renderWithAuth(<LoginPage />, makeAuth({ signIn }));
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(signIn).toHaveBeenCalledWith({ email: 'ana@exemplo.com', password: 'segredo123' }));
  });

  it('mostra mensagem compreensível quando o login falha', async () => {
    const signIn = vi.fn().mockRejectedValue(new AppError('invalidCredentials'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithAuth(<LoginPage />, makeAuth({ signIn }));
    await userEvent.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'errada');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeInTheDocument();
  });
});
