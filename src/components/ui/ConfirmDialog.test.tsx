import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

const props = {
  title: 'Excluir “X”?',
  description: 'Não pode ser desfeito.',
  confirmLabel: 'Excluir portfólio',
};

describe('ConfirmDialog', () => {
  it('não renderiza conteúdo quando fechado', () => {
    render(<ConfirmDialog {...props} open={false} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByText(props.description)).not.toBeInTheDocument();
  });

  it('só confirma quando o usuário aciona o botão destrutivo', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...props} open onConfirm={onConfirm} onCancel={onCancel} />);
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir portfólio' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('exibe erro e desabilita ações durante a exclusão', () => {
    render(<ConfirmDialog {...props} open isLoading error="Falhou" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Falhou')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
