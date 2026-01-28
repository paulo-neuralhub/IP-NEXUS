import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Globe,
  Calendar,
  FileText,
  Shield
} from 'lucide-react';
import { ASSET_TYPE_CONFIG, type AssetType } from '@/types/market.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['market-asset', id],
    queryFn: async () => {
      if (!id) throw new Error('Asset ID required');
      
      const { data, error } = await supabase
        .from('market_assets')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Activo no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          El activo que buscas no existe o no tienes acceso a él.
        </p>
        <Button asChild variant="outline">
          <Link to="/app/market/assets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Activos
          </Link>
        </Button>
      </div>
    );
  }

  const assetConfig = ASSET_TYPE_CONFIG[asset.asset_type as AssetType];
  
  const verificationConfig = {
    verified: { label: 'Verificado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    unverified: { label: 'Sin verificar', color: 'bg-gray-100 text-gray-800', icon: Shield },
  };

  const status = asset.verification_status as keyof typeof verificationConfig;
  const VerificationIcon = verificationConfig[status]?.icon || Shield;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app/market/assets">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
              {assetConfig?.icon || '📦'}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{asset.title}</h1>
              <p className="text-muted-foreground">{assetConfig?.label || asset.asset_type}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/app/market/assets/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/app/market/listings/new?asset=${id}`}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Crear Listing
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Activo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {asset.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h4>
                  <p>{asset.description}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {asset.registration_number && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Nº Registro</h4>
                    <p className="font-mono">{asset.registration_number}</p>
                  </div>
                )}
                
                {asset.jurisdiction && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Jurisdicción</h4>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{asset.jurisdiction}</span>
                    </div>
                  </div>
                )}

                {asset.filing_date && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Fecha Solicitud</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(asset.filing_date), 'PP', { locale: es })}</span>
                    </div>
                  </div>
                )}

                {asset.registration_date && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Fecha Registro</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(asset.registration_date), 'PP', { locale: es })}</span>
                    </div>
                  </div>
                )}

                {asset.expiration_date && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Fecha Expiración</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(asset.expiration_date), 'PP', { locale: es })}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Trademark specific */}
              {asset.word_mark && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Marca Denominativa</h4>
                  <p className="text-xl font-bold">{asset.word_mark}</p>
                </div>
              )}

              {asset.nice_classes && Array.isArray(asset.nice_classes) && asset.nice_classes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Clases Niza</h4>
                  <div className="flex flex-wrap gap-2">
                    {(asset.nice_classes as number[]).map((cls: number) => (
                      <Badge key={cls} variant="secondary">Clase {cls}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Patent specific */}
              {asset.abstract && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Resumen</h4>
                  <p className="text-sm">{asset.abstract}</p>
                </div>
              )}

              {asset.inventors && Array.isArray(asset.inventors) && asset.inventors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Inventores</h4>
                  <p>{(asset.inventors as string[]).join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          {asset.documents && Array.isArray(asset.documents) && asset.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(asset.documents as string[]).map((doc: string, i: number) => (
                    <a
                      key={i}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Documento {i + 1}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Estado de Verificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${verificationConfig[status]?.color} flex items-center gap-1 w-fit`}>
                <VerificationIcon className="h-4 w-4" />
                {verificationConfig[status]?.label}
              </Badge>
              
              {asset.verified_at && (
                <p className="text-sm text-muted-foreground mt-2">
                  Verificado el {format(new Date(asset.verified_at), 'PP', { locale: es })}
                </p>
              )}

              {asset.verification_expires_at && (
                <p className="text-sm text-muted-foreground">
                  Expira el {format(new Date(asset.verification_expires_at), 'PP', { locale: es })}
                </p>
              )}

              {asset.verification_status !== 'verified' && (
                <Button className="w-full mt-4" variant="outline">
                  Solicitar Verificación
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {asset.images && Array.isArray(asset.images) && asset.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Imágenes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {(asset.images as string[]).map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Asset image ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logo */}
          {asset.logo_url && (
            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={asset.logo_url}
                  alt="Asset logo"
                  className="w-full max-w-[200px] mx-auto"
                />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Activo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
