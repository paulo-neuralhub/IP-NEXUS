import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { supabase } from '@/integrations/supabase/client';
import { 
  SUPPORTED_LANGUAGES, 
  UILanguageCode, 
  changeLanguage, 
  getCurrentLanguage,
  DEFAULT_LANGUAGE
} from '@/lib/i18n';

interface UserWithLanguage {
  id: string;
  preferred_language?: string | null;
}

interface OrgWithLanguage {
  id: string;
  default_language?: string | null;
}

export function useLanguage() {
  const { t, i18n } = useTranslation();
  const { user, profile } = useAuth();
  const { currentOrganization } = useOrganization();
  
  // Cast to include language fields
  const userLang = (profile as UserWithLanguage | null)?.preferred_language;
  const orgLang = (currentOrganization as OrgWithLanguage | null)?.default_language;
  
  // Determinar idioma efectivo: user > org > navegador > default
  const effectiveLanguage = 
    userLang || 
    orgLang || 
    getCurrentLanguage();
  
  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === effectiveLanguage);
  
  // Sincronizar idioma al cargar
  useEffect(() => {
    if (effectiveLanguage && effectiveLanguage !== i18n.language) {
      changeLanguage(effectiveLanguage as UILanguageCode);
    }
  }, [effectiveLanguage, i18n.language]);
  
  // Cambiar idioma del usuario
  const setUserLanguage = useCallback(async (lang: UILanguageCode) => {
    await changeLanguage(lang);
    
    // Guardar en BD si hay usuario logueado
    if (user?.id) {
      await supabase
        .from('users')
        .update({ preferred_language: lang } as Record<string, unknown>)
        .eq('id', user.id);
    }
  }, [user?.id]);
  
  // Cambiar idioma de la organización (solo admins)
  const setOrgLanguage = useCallback(async (lang: UILanguageCode) => {
    if (currentOrganization?.id) {
      await supabase
        .from('organizations')
        .update({ default_language: lang } as Record<string, unknown>)
        .eq('id', currentOrganization.id);
    }
  }, [currentOrganization?.id]);
  
  // Resetear a idioma de org (quitar override de usuario)
  const resetToOrgLanguage = useCallback(async () => {
    if (user?.id) {
      await supabase
        .from('users')
        .update({ preferred_language: null } as Record<string, unknown>)
        .eq('id', user.id);
      
      const orgDefault = orgLang || DEFAULT_LANGUAGE;
      await changeLanguage(orgDefault as UILanguageCode);
    }
  }, [user?.id, orgLang]);
  
  return {
    t,
    i18n,
    currentLanguage: effectiveLanguage as UILanguageCode,
    currentLanguageInfo,
    setUserLanguage,
    setOrgLanguage,
    resetToOrgLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isUserOverride: !!userLang,
    orgLanguage: orgLang,
    isRTL: false, // All current languages are LTR
  };
}
