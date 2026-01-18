import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { SUPPORTED_LANGUAGES, UILanguageCode, changeLanguage, getCurrentLanguage } from '@/lib/i18n';

export function useLanguage() {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = getCurrentLanguage();
  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
  
  const setLanguage = useCallback(async (lang: UILanguageCode) => {
    await changeLanguage(lang);
  }, []);
  
  return {
    t,
    i18n,
    currentLanguage,
    currentLanguageInfo,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL: false, // All current languages are LTR
  };
}
