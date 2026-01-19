import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface StepOfficesSetupProps {
  data: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

interface IPOOffice {
  id: string;
  code: string;
  name: string;
  country_code: string;
}

const FLAG_EMOJIS: Record<string, string> = {
  'ES': '🇪🇸',
  'EM': '🇪🇺',
  'EU': '🇪🇺',
  'US': '🇺🇸',
  'WO': '🌍',
  'GB': '🇬🇧',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'CN': '🇨🇳',
  'JP': '🇯🇵',
  'MX': '🇲🇽',
  'AR': '🇦🇷',
  'BR': '🇧🇷',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'PT': '🇵🇹',
  'IT': '🇮🇹',
  'NL': '🇳🇱',
  'BE': '🇧🇪',
  'AT': '🇦🇹',
  'CH': '🇨🇭',
  'KR': '🇰🇷',
  'IN': '🇮🇳',
  'AU': '🇦🇺',
  'CA': '🇨🇦',
};

export function StepOfficesSetup({ data, updateData }: StepOfficesSetupProps) {
  const [offices, setOffices] = useState<IPOOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffices, setSelectedOffices] = useState<string[]>(data.selectedOffices || []);

  useEffect(() => {
    const loadOffices = async () => {
      const { data: officesData } = await supabase
        .from('ipo_offices')
        .select('id, code, name, country_code')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('name', { ascending: true })
        .limit(20);
      
      setOffices(officesData || []);
      setIsLoading(false);
    };
    loadOffices();
  }, []);

  const toggleOffice = (officeId: string) => {
    const updated = selectedOffices.includes(officeId)
      ? selectedOffices.filter(id => id !== officeId)
      : [...selectedOffices, officeId];
    setSelectedOffices(updated);
    updateData('selectedOffices', updated);
  };

  const getFlag = (code: string, countryCode: string) => {
    return FLAG_EMOJIS[code] || FLAG_EMOJIS[countryCode] || '🏛️';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">¿Con qué oficinas trabajas habitualmente?</h2>
        <p className="text-muted-foreground text-sm">
          Selecciona para acceso rápido y actualizaciones de tasas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2">
        {offices.map((office) => (
          <div
            key={office.id}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedOffices.includes(office.id)
                ? 'border-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => toggleOffice(office.id)}
          >
            <Checkbox 
              checked={selectedOffices.includes(office.id)} 
              className="pointer-events-none"
            />
            <span className="text-2xl">{getFlag(office.code, office.country_code)}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{office.code}</p>
              <p className="text-xs text-muted-foreground truncate">{office.name}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedOffices.length > 0 && (
        <p className="text-sm text-center text-muted-foreground">
          {selectedOffices.length} oficina{selectedOffices.length !== 1 ? 's' : ''} seleccionada{selectedOffices.length !== 1 ? 's' : ''}
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Podrás añadir más oficinas en cualquier momento desde Configuración
      </p>
    </div>
  );
}
