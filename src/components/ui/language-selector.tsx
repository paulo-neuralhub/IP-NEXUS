import { useLanguage } from '@/hooks/use-language';
import { Globe } from 'lucide-react';
import { UILanguageCode } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Props {
  variant?: 'dropdown' | 'compact';
}

export function LanguageSelector({ variant = 'dropdown' }: Props) {
  const { currentLanguage, currentLanguageInfo, setUserLanguage, supportedLanguages } = useLanguage();
  
  if (variant === 'compact') {
    return (
      <select
        value={currentLanguage}
        onChange={(e) => setUserLanguage(e.target.value as UILanguageCode)}
        className="bg-transparent border-none text-sm cursor-pointer focus:outline-none"
      >
        {supportedLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.code.toUpperCase()}
          </option>
        ))}
      </select>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{currentLanguageInfo?.flag}</span>
          <span className="hidden sm:inline text-sm">{currentLanguageInfo?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map(lang => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setUserLanguage(lang.code)}
            className={currentLanguage === lang.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
