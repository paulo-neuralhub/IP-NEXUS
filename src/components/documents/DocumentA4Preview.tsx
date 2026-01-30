/**
 * Document A4 Preview Component
 * Professional A4 paper preview with letterhead styling
 */

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrganizationSettings {
  name?: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  legal_disclaimer?: string;
}

interface DocumentA4PreviewProps {
  content: string;
  matterReference?: string;
  organizationSettings?: OrganizationSettings;
  className?: string;
}

export function DocumentA4Preview({
  content,
  matterReference,
  organizationSettings,
  className,
}: DocumentA4PreviewProps) {
  const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div className={cn('bg-muted/50 p-6 overflow-auto', className)}>
      {/* A4 Paper Container - 210mm x 297mm aspect ratio */}
      <div
        className="mx-auto bg-white shadow-lg"
        style={{
          width: '210mm',
          minHeight: '297mm',
          maxWidth: '100%',
          padding: '25mm 20mm 20mm 25mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Header / Letterhead */}
        <div className="flex items-start justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-4">
            {organizationSettings?.logo_url ? (
              <img
                src={organizationSettings.logo_url}
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="h-12 w-12 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {organizationSettings?.name?.charAt(0) || 'IP'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {organizationSettings?.name || 'IP-NEXUS'}
              </h1>
              {organizationSettings?.address && (
                <p className="text-xs text-muted-foreground">{organizationSettings.address}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {[organizationSettings?.phone, organizationSettings?.email]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {matterReference && (
              <p className="font-medium">
                Ref: <span className="font-mono">{matterReference}</span>
              </p>
            )}
            <p>Fecha: {today}</p>
          </div>
        </div>

        {/* Document Content */}
        <div
          className="prose prose-sm max-w-none text-foreground leading-relaxed"
          style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Footer */}
        <div className="mt-auto pt-8 border-t text-xs text-muted-foreground text-center">
          {organizationSettings?.legal_disclaimer || 
            'Este documento es confidencial y está destinado únicamente a su destinatario.'}
        </div>
      </div>
    </div>
  );
}
