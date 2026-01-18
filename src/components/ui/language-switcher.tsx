import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { UILanguageCode } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { currentLanguage, currentLanguageInfo, setUserLanguage, supportedLanguages } = useLanguage();
  
  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = async (code: UILanguageCode) => {
    await setUserLanguage(code);
    setIsOpen(false);
  };
  
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
        title="Cambiar idioma"
      >
        <span className="text-lg">{currentLanguageInfo?.flag}</span>
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
          {currentLanguage.toUpperCase()}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-background rounded-xl shadow-lg border py-1 min-w-[140px] z-50">
          {supportedLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors",
                currentLanguage === lang.code && "bg-primary/10 text-primary"
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
