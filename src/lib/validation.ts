/** Chaves de mensagem de validação, definidas em `common.json` sob `validation`. */
export type ValidationKey =
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'email'
  | 'url'
  | 'passwordMismatch';

/** Mensagem de validação traduzível, com parâmetros de interpolação opcionais. */
export interface ValidationMessage {
  key: ValidationKey;
  params?: Record<string, number>;
}

/** Regra que recebe um valor e devolve uma mensagem de erro ou `null` quando válido. */
export type ValidationRule<TValue> = (value: TValue) => ValidationMessage | null;

/** Erros por campo de um formulário. */
export type FieldErrors<TValues> = Partial<Record<keyof TValues, ValidationMessage>>;

/** Conjunto de regras por campo. As regras de cada campo são avaliadas em ordem. */
export type ValidationSchema<TValues> = {
  [K in keyof TValues]?: ValidationRule<TValues[K]>[];
};

/** Exige texto não vazio (desconsiderando espaços). */
export const required: ValidationRule<string> = (value) =>
  value.trim().length === 0 ? { key: 'required' } : null;

/** Exige no mínimo `min` caracteres. */
export const minLength =
  (min: number): ValidationRule<string> =>
  (value) =>
    value.length < min ? { key: 'minLength', params: { min } } : null;

/** Limita o texto (após trim) a `max` caracteres. Valor vazio é considerado válido. */
export const maxLength =
  (max: number): ValidationRule<string> =>
  (value) =>
    value.trim().length > max ? { key: 'maxLength', params: { max } } : null;

/** Formato básico de e-mail. A validação definitiva é feita pelo Firebase Authentication. */
export const email: ValidationRule<string> = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : { key: 'email' };

/** Verifica se o texto é uma URL absoluta com protocolo http(s). */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/** URL http(s) opcional: vazio é válido; preenchido precisa ser uma URL http(s). */
export const optionalHttpUrl: ValidationRule<string> = (value) =>
  value.trim().length === 0 || isHttpUrl(value) ? null : { key: 'url' };

/** Aplica o schema aos valores e retorna apenas os campos com erro. */
export function validate<TValues>(
  values: TValues,
  schema: ValidationSchema<TValues>,
): FieldErrors<TValues> {
  const errors: FieldErrors<TValues> = {};
  for (const field of Object.keys(schema) as (keyof TValues)[]) {
    const rules = schema[field] ?? [];
    for (const rule of rules) {
      const message = rule(values[field]);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}

/** Indica se o objeto de erros possui algum campo inválido. */
export function hasErrors<TValues>(errors: FieldErrors<TValues>): boolean {
  return Object.values(errors).some(Boolean);
}
