import { maxLength, required, validate, type FieldErrors } from '@/lib/validation';
import type { PortfolioFormValues } from '../services/portfolioService';

/** Limites de texto de portfólios (espelhados em `firestore.rules`). */
export const PORTFOLIO_LIMITS = { nameMax: 100, descriptionMax: 2000 } as const;

/** Valida o formulário de portfólio. */
export function validatePortfolioForm(values: PortfolioFormValues): FieldErrors<PortfolioFormValues> {
  return validate(values, {
    name: [required, maxLength(PORTFOLIO_LIMITS.nameMax)],
    description: [maxLength(PORTFOLIO_LIMITS.descriptionMax)],
  });
}
