import { describe, expect, it } from 'vitest';
import { applySwap, computeSwap } from './ordering';

const items = [
  { id: 'a', sortOrder: 10 },
  { id: 'b', sortOrder: 20 },
  { id: 'c', sortOrder: 30 },
];

describe('ordenação', () => {
  it('troca o item com o vizinho', () => {
    const swap = computeSwap(items, 'b', 'up');
    expect(swap).toEqual({ first: { id: 'b', sortOrder: 10 }, second: { id: 'a', sortOrder: 20 } });
    expect(applySwap(items, swap!).map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('retorna null nas extremidades e para id inexistente', () => {
    expect(computeSwap(items, 'a', 'up')).toBeNull();
    expect(computeSwap(items, 'c', 'down')).toBeNull();
    expect(computeSwap(items, 'z', 'up')).toBeNull();
  });

  it('separa valores iguais (dados legados)', () => {
    const tied = [
      { id: 'a', sortOrder: 5 },
      { id: 'b', sortOrder: 5 },
    ];
    const swap = computeSwap(tied, 'b', 'up')!;
    expect(applySwap(tied, swap).map((i) => i.id)).toEqual(['b', 'a']);
  });
});
