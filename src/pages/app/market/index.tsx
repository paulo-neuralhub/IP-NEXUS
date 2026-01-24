import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Package, 
  ArrowRight,
  Bell,
  User,
  LayoutGrid,
  Terminal
} from 'lucide-react';
import { useMarketListings, useToggleFavorite, useMarketFavorites } from '@/hooks/use-market';
import { 
  ASSET_TYPE_CONFIG, 
  TRANSACTION_TYPE_CONFIG,
  type AssetType,
  type TransactionType 
} from '@/types/market.types';
import { ListingCard } from '@/components/market/listings/ListingCard';
import { 
  MarketSummaryCards, 
  ActiveRequestsList, 
  MyQuotesList,
  type RfqRequest,
  type RfqQuote 
} from '@/components/features/market';
import { 
  MarketTicker, 
  TopAgents, 
  RecentRequests, 
  MarketStats, 
  JurisdictionGrid 
} from '@/components/market/terminal';
import { cn } from '@/lib/utils';

export default function MarketDashboard() {
  const [viewMode, setViewMode] = useState<'terminal' | 'classic'>('terminal');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  
  const { data: listings, isLoading } = useMarketListings({
    status: 'active',
    asset_type: assetTypeFilter !== 'all' ? assetTypeFilter as AssetType : undefined,
    transaction_type: transactionTypeFilter !== 'all' ? transactionTypeFilter as TransactionType : undefined,
    search: searchQuery || undefined,
  });

  const { data: favorites } = useMarketFavorites();
  const toggleFavorite = useToggleFavorite();
  
  const favoriteIds = favorites?.map(f => f.listing_id) || [];

  // Mock stats - en producción vendrían de queries reales
  const marketStats = {
    active: { count: 12, value: 45000 },
    pending: { count: 5, value: 12500 },
    won: { count: 8, value: 32000 },
    rejected: { count: 2, value: 5200 },
  };

  // Mock RFQ requests - en producción vendrían de la tabla rfq_requests
  const mockRequests: RfqRequest[] = [
    {
      id: '1',
      reference: '#REQ-2026-001',
      title: 'Registro marca "TechBrand" España + EUIPO',
      service_category: 'trademark_registration',
      jurisdictions: ['ES', 'EUIPO'],
      budget_min: 2500,
      budget_max: 4000,
      currency: 'EUR',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      quotes_count: 4,
      status: 'open',
      client_name: 'Cliente Corp',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      reference: '#REQ-2026-002',
      title: 'Búsqueda de anterioridades EU-wide',
      service_category: 'trademark_search',
      jurisdictions: ['EU'],
      budget_min: 800,
      budget_max: 1500,
      currency: 'EUR',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      quotes_count: 2,
      status: 'evaluating',
      client_name: 'Startup SL',
      created_at: new Date().toISOString(),
    },
  ];

  // Mock quotes - en producción vendrían de rfq_quotes
  const mockQuotes: RfqQuote[] = [
    {
      id: '1',
      rfq_request_id: '3',
      request_reference: '#REQ-2026-003',
      request_title: 'Oposición marca clase 9',
      client_name: 'Acme Inc',
      amount: 3200,
      currency: 'EUR',
      status: 'submitted',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      rfq_request_id: '1',
      request_reference: '#REQ-2026-001',
      request_title: 'Registro marca España + EUIPO',
      client_name: 'Beta Corp',
      amount: 4500,
      currency: 'EUR',
      status: 'accepted',
      submitted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      rfq_request_id: '2',
      request_reference: '#REQ-2026-002',
      request_title: 'Búsqueda anterioridades',
      client_name: 'Gamma Ltd',
      amount: 2800,
      currency: 'EUR',
      status: 'rejected',
      created_at: new Date().toISOString(),
    },
  ];

  const handleFavoriteToggle = (listingId: string) => {
    const isFav = favoriteIds.includes(listingId);
    toggleFavorite.mutate({ listingId, isFavorite: isFav });
  };

  // Terminal View
  if (viewMode === 'terminal') {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-[#0a0a0f] text-white -m-6 -mt-0 rounded-lg overflow-hidden">
        {/* View Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d12]">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <span className="font-mono text-sm font-medium">Terminal View</span>
            <span className="ml-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono rounded flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('classic')}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Vista Clásica
          </Button>
        </div>

        {/* Ticker */}
        <MarketTicker />

        {/* Stats */}
        <div className="p-4 border-b border-white/10">
          <MarketStats />
        </div>

        {/* Main Grid */}
        <div className="p-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <TopAgents />
            <JurisdictionGrid />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <RecentRequests showBidButton />
          </div>
        </div>
      </div>
    );
  }

  // Classic View
  return (
    <div className="space-y-6">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode('terminal')}
        >
          <Terminal className="h-4 w-4 mr-2" />
          Vista Terminal
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/market/alerts">
              <Bell className="h-4 w-4 mr-1" />
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">3</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/market/profile">
              <User className="h-4 w-4 mr-1" />
              Mi Perfil
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <MarketSummaryCards stats={marketStats} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="requests">Mis Solicitudes</TabsTrigger>
          <TabsTrigger value="quotes">Mis Presupuestos</TabsTrigger>
          <TabsTrigger value="explore">Explorar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ActiveRequestsList requests={mockRequests.slice(0, 3)} />
            <MyQuotesList quotes={mockQuotes.slice(0, 5)} />
          </div>

          {/* Recent Listings Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Listings Recientes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('explore')}>
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : listings && listings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {listings.slice(0, 3).map((listing: any) => (
                    <ListingCard 
                      key={listing.id} 
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        description: listing.description,
                        price: listing.asking_price || 0,
                        currency: listing.currency || 'EUR',
                        is_featured: listing.is_featured,
                        is_negotiable: listing.price_type === 'negotiable',
                        views_count: listing.views_count,
                        created_at: listing.created_at,
                        transaction_types: listing.transaction_types || [listing.transaction_type],
                        asset: {
                          type: listing.asset?.asset_type,
                          jurisdiction: listing.asset?.jurisdictions?.[0],
                          images: listing.asset?.images,
                          is_verified: listing.asset?.is_verified,
                        }
                      }}
                      isFavorite={favoriteIds.includes(listing.id)}
                      onFavoriteToggle={() => handleFavoriteToggle(listing.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No hay listings activos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          <ActiveRequestsList requests={mockRequests} />
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="mt-6">
          <MyQuotesList quotes={mockQuotes} />
        </TabsContent>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-6 mt-6">
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
                  <SelectItem key={key} value={key}>{config.labelEs}</SelectItem>
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
                  <SelectItem key={key} value={key}>{config.labelEs}</SelectItem>
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
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Marcas</h3>
                    <p className="text-muted-foreground text-sm">Marcas registradas y solicitudes</p>
                    <p className="text-2xl font-bold mt-2">45 activos</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-2xl">®️</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Patentes</h3>
                    <p className="text-muted-foreground text-sm">Patentes y modelos de utilidad</p>
                    <p className="text-2xl font-bold mt-2">28 activos</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-2xl">📜</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/30 to-accent/10 border-accent/30 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Dominios</h3>
                    <p className="text-muted-foreground text-sm">Dominios web premium</p>
                    <p className="text-2xl font-bold mt-2">67 activos</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-accent/30 flex items-center justify-center">
                    <span className="text-2xl">🌐</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Listings Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Todos los Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : listings && listings.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing: any) => (
                    <ListingCard 
                      key={listing.id} 
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        description: listing.description,
                        price: listing.asking_price || 0,
                        currency: listing.currency || 'EUR',
                        is_featured: listing.is_featured,
                        is_negotiable: listing.price_type === 'negotiable',
                        views_count: listing.views_count,
                        created_at: listing.created_at,
                        transaction_types: listing.transaction_types || [listing.transaction_type],
                        asset: {
                          type: listing.asset?.asset_type,
                          jurisdiction: listing.asset?.jurisdictions?.[0],
                          images: listing.asset?.images,
                          is_verified: listing.asset?.is_verified,
                        }
                      }}
                      isFavorite={favoriteIds.includes(listing.id)}
                      onFavoriteToggle={() => handleFavoriteToggle(listing.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay listings activos</h3>
                  <p className="text-muted-foreground mb-4">Sé el primero en publicar un activo de PI</p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
