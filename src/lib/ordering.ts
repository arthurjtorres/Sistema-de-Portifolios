/** Item que possui posição de exibição. */
export interface Sortable {
  id: string;
  sortOrder: number;
}

/** Troca de posição entre dois itens vizinhos. */
export interface SortSwap {
  first: { id: string; sortOrder: number };
  second: { id: string; sortOrder: number };
}

/**
 * Calcula a troca necessária para mover o item `id` uma posição para cima ou para baixo.
 * Retorna `null` se o item não existe ou já está na extremidade.
 *
 * @param items itens na ordem atual de exibição
 */
export function computeSwap<T extends Sortable>(
  items: readonly T[],
  id: string,
  direction: 'up' | 'down',
): SortSwap | null {
  const index = items.findIndex((item) => item.id === id);
  const neighborIndex = direction === 'up' ? index - 1 : index + 1;
  const current = items[index];
  const neighbor = items[neighborIndex];
  if (index < 0 || !current || !neighbor) {
    return null;
  }

  // Valores iguais (dados legados) não trocariam nada: separa-os artificialmente.
  const currentOrder = current.sortOrder;
  const neighborOrder =
    neighbor.sortOrder === currentOrder
      ? currentOrder + (direction === 'up' ? -1 : 1)
      : neighbor.sortOrder;

  return {
    first: { id: current.id, sortOrder: neighborOrder },
    second: { id: neighbor.id, sortOrder: currentOrder },
  };
}

/** Aplica uma troca à lista em memória e a reordena (atualização otimista da interface). */
export function applySwap<T extends Sortable>(items: readonly T[], swap: SortSwap): T[] {
  return items
    .map((item) => {
      if (item.id === swap.first.id) {
        return { ...item, sortOrder: swap.first.sortOrder };
      }
      if (item.id === swap.second.id) {
        return { ...item, sortOrder: swap.second.sortOrder };
      }
      return item;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
