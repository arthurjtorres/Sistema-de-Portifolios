import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { logError, toAppError, type AppError } from '@/lib/errors';

/** Estado de uma leitura assíncrona. */
export type AsyncState<TData> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'success'; data: TData; error: undefined }
  | { status: 'error'; data: undefined; error: AppError };

/** Resultado do hook: estado, função de recarga e atualização local otimista. */
export type AsyncDataResult<TData> = AsyncState<TData> & {
  reload: () => void;
  /** Substitui o dado em memória sem nova leitura (ex.: após reordenar). */
  setData: (updater: (current: TData) => TData) => void;
};

/**
 * Executa uma leitura pontual (sem listener em tempo real) e controla
 * carregamento, erro e recarga. Respostas de requisições obsoletas são descartadas.
 *
 * @param loader função que busca os dados
 * @param deps dependências que disparam nova leitura
 * @param context identificador usado no log de erros
 */
export function useAsyncData<TData>(
  loader: () => Promise<TData>,
  deps: DependencyList,
  context: string,
): AsyncDataResult<TData> {
  const [state, setState] = useState<AsyncState<TData>>({
    status: 'loading',
    data: undefined,
    error: undefined,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    setState({ status: 'loading', data: undefined, error: undefined });

    loader()
      .then((data) => {
        if (currentRequest === requestId.current) {
          setState({ status: 'success', data, error: undefined });
        }
      })
      .catch((error: unknown) => {
        logError(context, error);
        if (currentRequest === requestId.current) {
          setState({ status: 'error', data: undefined, error: toAppError(error) });
        }
      });
    // O loader é recriado a cada render; as dependências reais são informadas por `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const setData = useCallback((updater: (current: TData) => TData) => {
    setState((current) =>
      current.status === 'success'
        ? { status: 'success', data: updater(current.data), error: undefined }
        : current,
    );
  }, []);

  return { ...state, reload, setData };
}
