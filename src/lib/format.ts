/**
 * Formata uma data conforme o idioma ativo usando `Intl`, sem depender de bibliotecas.
 * Retorna string vazia para datas ausentes (ex.: timestamp de servidor ainda pendente).
 */
export function formatDate(date: Date | null, locale: string): string {
  if (!date) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(
    date,
  );
}

/** Formata tamanho de arquivo em MB para mensagens ao usuário. */
export function formatMegabytes(bytes: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024));
}
