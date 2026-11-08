import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from './Alert';
import { Button } from './Button';

/** Propriedades do diálogo de confirmação. */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isLoading?: boolean;
  /** Mensagem de erro da última tentativa, exibida dentro do diálogo. */
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmação de ação destrutiva usando `<dialog>` nativo (foco preso, Esc para fechar).
 * O botão de cancelar recebe o foco inicial para evitar exclusões acidentais.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation(['common']);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      // jsdom e navegadores antigos podem não implementar showModal.
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg bg-surface p-6 text-ink shadow-xl"
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoading) {
          onCancel();
        }
      }}
    >
      {open && (
        <div className="flex flex-col gap-4">
          <h2 id={titleId} className="text-xl font-semibold break-words">
            {title}
          </h2>
          <p id={descriptionId} className="text-ink-soft">
            {description}
          </p>
          {error && <Alert tone="error">{error}</Alert>}
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={isLoading}>
              {t('common:actions.cancel')}
            </Button>
            <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
