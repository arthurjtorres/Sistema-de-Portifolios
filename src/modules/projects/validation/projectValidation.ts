import { maxLength, optionalHttpUrl, required, validate, type FieldErrors } from '@/lib/validation';
import type { ProjectFormValues } from '../services/projectService';

/** Limites de texto de projetos (espelhados em `firestore.rules`). */
export const PROJECT_LIMITS = { nameMax: 120, descriptionMax: 5000, urlMax: 2048 } as const;

/** Valida o formulário de projeto. */
export function validateProjectForm(values: ProjectFormValues): FieldErrors<ProjectFormValues> {
  return validate(values, {
    portfolioId: [required],
    name: [required, maxLength(PROJECT_LIMITS.nameMax)],
    description: [maxLength(PROJECT_LIMITS.descriptionMax)],
    externalUrl: [maxLength(PROJECT_LIMITS.urlMax), optionalHttpUrl],
  });
}
