import 'i18next';
import type { resources } from './index';

/** Tipagem das chaves de tradução a partir dos recursos pt-BR (idioma de referência). */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['pt-BR'];
  }
}
