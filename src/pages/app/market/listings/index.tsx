import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Grid, 
  List, 
  Star,
  Clock,
  MapPin,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { useMarketListings } from '@/hooks/use-market';
import { 
  ASSET_TYPE_CONFIG, 
  TRANSACTION_TYPE_CONFIG,
  LISTING_STATUS_CONFIG,
  type AssetType,
  type TransactionType,
  type ListingStatus
} from '@/types/market.types';

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ListingStatus>('active');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: listings, isLoading } = useMarketListings({
    status: statusFilter,
    asset_type: assetTypeFilter !== 'all' ? assetTypeFilter as AssetType : undefined,
    transaction_type: transactionTypeFilter !== 'all' ? transactionTypeFilter as TransactionType : undefined,
    search: searchQuery || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Transacción" />
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
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button asChild>
            <Link to="/app/market/listings/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ListingStatus)}>
        <TabsList>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="sold">Vendidos</TabsTrigger>
          <TabsTrigger value="expired">Expirados</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className={viewMode === 'grid' ? 'h-48' : 'h-24'}>
                  <div className="h-full bg-muted animate-pulse rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings && listings.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {listings.map((listing) => (
            viewMode === 'grid' 
              ? <ListingGridCard key={listing.id} listing={listing} />
              : <ListingListCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No se encontraron listings</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar los filtros o crea un nuevo listing
            </p>
            <Button asChild>
              <Link to="/app/market/listings/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ListingGridCard({ listing }: { listing: any }) {
  const assetConfig = listing.asset?.asset_type 
    ? ASSET_TYPE_CONFIG[listing.asset.asset_type as AssetType] 
    : null;
  const transactionConfig = TRANSACTION_TYPE_CONFIG[listing.transaction_type as TransactionType];

  return (
    <Link to={`/app/market/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
          <span className="text-5xl">{assetConfig?.icon || '📦'}</span>
          {listing.is_featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500">
              <Star className="h-3 w-3 mr-1" />
              Destacado
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate mb-1">{listing.title}</h3>
          <p className="text-sm text-muted-foreground truncate mb-3">
            {listing.asset?.title || 'Activo de PI'}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {transactionConfig?.label || listing.transaction_type}
            </Badge>
            {listing.asset?.jurisdictions?.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {listing.asset.jurisdictions[0]}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-market">
              {listing.price_type === 'fixed' && listing.asking_price
                ? `€${listing.asking_price.toLocaleString()}`
                : listing.price_type === 'negotiable'
                ? 'Negociable'
                : 'Consultar'}
            </p>
            <span className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ListingListCard({ listing }: { listing: any }) {
  const assetConfig = listing.asset?.asset_type 
    ? ASSET_TYPE_CONFIG[listing.asset.asset_type as AssetType] 
    : null;
  const transactionConfig = TRANSACTION_TYPE_CONFIG[listing.transaction_type as TransactionType];
  const statusConfig = LISTING_STATUS_CONFIG[listing.status as keyof typeof LISTING_STATUS_CONFIG];

  return (
    <Link to={`/app/market/listings/${listing.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
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
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-market">
                {listing.price_type === 'fixed' && listing.asking_price
                  ? `€${listing.asking_price.toLocaleString()}`
                  : listing.price_type === 'negotiable'
                  ? 'Negociable'
                  : 'Consultar'}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
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
        </CardContent>
      </Card>
    </Link>
  );
}
