import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import auth from './locales/pt-BR/auth.json';
import common from './locales/pt-BR/common.json';
import dashboard from './locales/pt-BR/dashboard.json';
import errors from './locales/pt-BR/errors.json';
import media from './locales/pt-BR/media.json';
import portfolios from './locales/pt-BR/portfolios.json';
import projects from './locales/pt-BR/projects.json';

/** Idioma padrão da aplicação. */
export const DEFAULT_LANGUAGE = 'pt-BR';

/** Namespaces de tradução, organizados por domínio. */
export const NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'portfolios',
  'projects',
  'media',
  'errors',
] as const;

/**
 * Recursos carregados de forma estática. Para adicionar um idioma, crie
 * `locales/<idioma>/` com os mesmos arquivos e registre-o aqui.
 */
export const resources = {
  'pt-BR': { common, auth, dashboard, portfolios, projects, media, errors },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  ns: NAMESPACES,
  interpolation: {
    // React já escapa o conteúdo renderizado.
    escapeValue: false,
  },
  // Chave ausente: i18next devolve a própria chave (comportamento previsível) e,
  // em desenvolvimento, registramos o aviso para corrigir a tradução.
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: (languages, namespace, key) => {
    console.warn(`[i18n] chave ausente: ${namespace}:${key} (${languages.join(', ')})`);
  },
});

export default i18n;
