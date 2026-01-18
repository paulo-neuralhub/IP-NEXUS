export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
] as const;

// Idiomas para RAG/documentos legales (10 PCT)
export const RAG_LANGUAGES = [
  'ar', 'zh', 'en', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'es'
] as const;

export type UILanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];
export type RAGLanguageCode = typeof RAG_LANGUAGES[number];

export const DEFAULT_LANGUAGE: UILanguageCode = 'en';

// Detectar idioma del navegador y mapear a soportados
export function getInitialLanguage(): UILanguageCode {
  const browserLang = navigator.language.split('-')[0];
  const supported = SUPPORTED_LANGUAGES.find(l => l.code === browserLang);
  return supported?.code || DEFAULT_LANGUAGE;
}
