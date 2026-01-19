import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarketAssets } from '@/hooks/use-market';
import { ASSET_TYPE_CONFIG, type AssetType } from '@/types/market.types';

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  
  const { data: assets, isLoading } = useMarketAssets();

  const filteredAssets = assets?.filter(asset => {
    if (assetTypeFilter !== 'all' && asset.asset_type !== assetTypeFilter) return false;
    if (verificationFilter !== 'all' && asset.verification_status !== verificationFilter) return false;
    if (searchQuery && !asset.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: assets?.length || 0,
    verified: assets?.filter(a => a.verification_status === 'verified').length || 0,
    pending: assets?.filter(a => a.verification_status === 'pending').length || 0,
    listed: 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.listed}</p>
                <p className="text-xs text-muted-foreground">En Venta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar activos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de activo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(ASSET_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.icon} {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={verificationFilter} onValueChange={setVerificationFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="verified">Verificado</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
          </SelectContent>
        </Select>
        <Button asChild>
          <Link to="/app/market/assets/new">
            <Plus className="h-4 w-4 mr-2" />
            Añadir Activo
          </Link>
        </Button>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAssets && filteredAssets.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes activos registrados</h3>
            <p className="text-muted-foreground mb-4">
              Registra tus activos de PI para poder listarlos en el marketplace
            </p>
            <Button asChild>
              <Link to="/app/market/assets/new">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Activo
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AssetCard({ asset }: { asset: any }) {
  const assetConfig = ASSET_TYPE_CONFIG[asset.asset_type as AssetType];
  
  const verificationColors = {
    verified: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    unverified: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
              {assetConfig?.icon || '📦'}
            </div>
            <div>
              <CardTitle className="text-base">{asset.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {assetConfig?.label || asset.asset_type}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/app/market/assets/${asset.id}`}>Ver Detalles</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/market/assets/${asset.id}/edit`}>Editar</Link>
              </DropdownMenuItem>
              {!asset.is_listed && (
                <DropdownMenuItem asChild>
                  <Link to={`/app/market/listings/new?asset=${asset.id}`}>
                    Crear Listing
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {asset.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {asset.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className={verificationColors[asset.verification_status as keyof typeof verificationColors]}
            >
              {asset.verification_status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
              {asset.verification_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {asset.verification_status}
            </Badge>
            {asset.is_listed && (
              <Badge variant="secondary">En venta</Badge>
            )}
          </div>

          {asset.jurisdictions && asset.jurisdictions.length > 0 && (
            <p className="text-xs text-muted-foreground">
              📍 {asset.jurisdictions.join(', ')}
            </p>
          )}

          {asset.estimated_value && (
            <p className="text-sm font-medium">
              Valor estimado: €{asset.estimated_value.toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
