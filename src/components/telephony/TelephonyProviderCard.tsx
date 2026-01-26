import { ExternalLink, Phone, MessageSquare, MessageCircle, Mic, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TelephonyProvider } from '@/hooks/useTelephonyProviders';

interface TelephonyProviderCardProps {
  provider: TelephonyProvider;
  isSelected?: boolean;
  onSelect?: (provider: TelephonyProvider) => void;
}

export function TelephonyProviderCard({ provider, isSelected, onSelect }: TelephonyProviderCardProps) {
  return (
    <Card className={`relative ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {provider.is_default && (
        <Badge className="absolute -top-2 right-4 bg-primary">Recomendado</Badge>
      )}

      <CardHeader>
        <div className="flex items-center gap-3">
          {provider.logo_url ? (
            <img src={provider.logo_url} alt={provider.name} className="h-10 w-10 object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Phone className="h-5 w-5" />
            </div>
          )}
          <div>
            <CardTitle className="text-base">{provider.name}</CardTitle>
            {provider.website_url && (
              <a
                href={provider.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                {provider.website_url.replace('https://', '')}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <CardDescription className="mt-2">{provider.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {provider.supports_voice && (
            <Badge variant="outline" className="gap-1">
              <Phone className="h-3 w-3" />
              Voz
            </Badge>
          )}
          {provider.supports_sms && (
            <Badge variant="outline" className="gap-1">
              <MessageSquare className="h-3 w-3" />
              SMS
            </Badge>
          )}
          {provider.supports_whatsapp && (
            <Badge variant="outline" className="gap-1">
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </Badge>
          )}
          {provider.supports_recording && (
            <Badge variant="outline" className="gap-1">
              <Mic className="h-3 w-3" />
              Grabación
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Credenciales requeridas:</strong>
          <div className="mt-1 flex flex-wrap gap-1">
            {provider.required_credentials.map((cred) => (
              <code key={cred} className="rounded bg-muted px-1 py-0.5">
                {cred}
              </code>
            ))}
          </div>
        </div>

        {onSelect && (
          <Button
            className="w-full"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => onSelect(provider)}
          >
            {isSelected ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Seleccionado
              </>
            ) : (
              'Seleccionar'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
