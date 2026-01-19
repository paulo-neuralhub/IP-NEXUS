// src/pages/app/genius/translator.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LegalTranslator } from '@/components/features/genius/legal-translator';
import { usePageTitle } from '@/contexts/page-context';
import { Button } from '@/components/ui/button';
import { Languages, ArrowLeft, MessageSquare, History } from 'lucide-react';

export default function TranslatorPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Traductor Legal');
  }, [setTitle]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/genius">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <Languages className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">NEXUS TRANSLATOR</h1>
              <p className="text-sm text-muted-foreground">
                Traduce documentos de PI con terminología especializada
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/app/genius">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Genius
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Translator Component */}
      <LegalTranslator />
    </div>
  );
}
