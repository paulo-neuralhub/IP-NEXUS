import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users,
  ArrowRight,
  Star,
  Shield,
  Clock
} from 'lucide-react';
import { useMarketListings } from '@/hooks/use-market';
import { 
  ASSET_TYPE_CONFIG, 
  TRANSACTION_TYPE_CONFIG,
  LISTING_STATUS_CONFIG,
  type AssetType,
  type TransactionType 
} from '@/types/market.types';

export default function MarketDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  
  const { data: listings, isLoading } = useMarketListings({
    status: 'active',
    asset_type: assetTypeFilter !== 'all' ? assetTypeFilter as AssetType : undefined,
    transaction_type: transactionTypeFilter !== 'all' ? transactionTypeFilter as TransactionType : undefined,
    search: searchQuery || undefined,
  });

  // Stats simulados por ahora
  const stats = {
    activeListings: listings?.length || 0,
    totalTransactions: 156,
    totalVolume: 2450000,
    activeUsers: 342
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listings Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{(stats.totalVolume / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              +23% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +5% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar activos de PI..."
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
        <Select value={transactionTypeFilter} onValueChange={setTransactionTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de transacción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(TRANSACTION_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <Link to="/app/market/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Crear Listing
          </Link>
        </Button>
      </div>

      {/* Featured Categories */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Marcas</h3>
                <p className="text-muted-foreground text-sm">Marcas registradas y solicitudes</p>
                <p className="text-2xl font-bold mt-2">45 activos</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">®️</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Patentes</h3>
                <p className="text-muted-foreground text-sm">Patentes y modelos de utilidad</p>
                <p className="text-2xl font-bold mt-2">28 activos</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">📜</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/50 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Dominios</h3>
                <p className="text-muted-foreground text-sm">Dominios web premium</p>
                <p className="text-2xl font-bold mt-2">67 activos</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Listings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Listings Recientes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app/market/listings">
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="space-y-4">
              {listings.slice(0, 5).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay listings activos</h3>
              <p className="text-muted-foreground mb-4">
                Sé el primero en publicar un activo de PI
              </p>
              <Button asChild>
                <Link to="/app/market/listings/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Listing
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  const assetConfig = listing.asset?.asset_type 
    ? ASSET_TYPE_CONFIG[listing.asset.asset_type as AssetType] 
    : null;
  const transactionConfig = TRANSACTION_TYPE_CONFIG[listing.transaction_type as TransactionType];
  const statusConfig = LISTING_STATUS_CONFIG[listing.status as keyof typeof LISTING_STATUS_CONFIG];

  return (
    <Link to={`/app/market/listings/${listing.id}`}>
      <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
          {assetConfig?.icon || '📦'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{listing.title}</h4>
            {listing.is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                Destacado
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {listing.asset?.title || 'Activo'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {transactionConfig?.label || listing.transaction_type}
            </Badge>
            {listing.asset?.jurisdictions?.length > 0 && (
              <span className="text-xs text-muted-foreground">
                📍 {listing.asset.jurisdictions.slice(0, 2).join(', ')}
                {listing.asset.jurisdictions.length > 2 && ` +${listing.asset.jurisdictions.length - 2}`}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">
            {listing.price_type === 'fixed' && listing.asking_price
              ? `€${listing.asking_price.toLocaleString()}`
              : listing.price_type === 'negotiable'
              ? 'Negociable'
              : 'Consultar'}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(listing.created_at).toLocaleDateString()}
          </div>
        </div>
        <Badge 
          variant="outline" 
          style={{ 
            backgroundColor: statusConfig?.color + '20',
            borderColor: statusConfig?.color,
            color: statusConfig?.color 
          }}
        >
          {statusConfig?.label || listing.status}
        </Badge>
      </div>
    </Link>
  );
}
