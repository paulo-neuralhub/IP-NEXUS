import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, UILanguageCode } from './config';

import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'ipnexus_lang',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export const changeLanguage = async (lang: UILanguageCode) => {
  await i18n.changeLanguage(lang);
  localStorage.setItem('ipnexus_lang', lang);
  document.documentElement.lang = lang;
};

export const getCurrentLanguage = (): UILanguageCode => {
  return (i18n.language?.split('-')[0] || DEFAULT_LANGUAGE) as UILanguageCode;
};

export default i18n;
export * from './config';
