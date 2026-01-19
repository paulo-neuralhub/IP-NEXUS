import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Heart,
  HeartOff,
  Clock,
  MapPin,
  Trash2
} from 'lucide-react';
import { useMarketFavorites, useDeleteFavorite } from '@/hooks/use-market';
import { 
  ASSET_TYPE_CONFIG, 
  TRANSACTION_TYPE_CONFIG,
  type AssetType,
  type TransactionType 
} from '@/types/market.types';

export default function FavoritesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: favorites, isLoading } = useMarketFavorites();
  const removeFavorite = useDeleteFavorite();

  const filteredFavorites = favorites?.filter(fav => {
    if (!searchQuery) return true;
    return fav.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleRemoveFavorite = (e: React.MouseEvent, favoriteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFavorite.mutate(favoriteId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Mis Favoritos
          </h2>
          <p className="text-muted-foreground text-sm">
            {favorites?.length || 0} listings guardados
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en favoritos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Favorites Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-40 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredFavorites && filteredFavorites.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((favorite) => (
            <FavoriteCard 
              key={favorite.id} 
              favorite={favorite} 
              onRemove={(e) => handleRemoveFavorite(e, favorite.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <HeartOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes favoritos</h3>
            <p className="text-muted-foreground mb-4">
              Guarda listings que te interesen para verlos más tarde
            </p>
            <Button asChild>
              <Link to="/app/market">Explorar Marketplace</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FavoriteCard({ 
  favorite, 
  onRemove 
}: { 
  favorite: any; 
  onRemove: (e: React.MouseEvent) => void;
}) {
  const listing = favorite.listing;
  if (!listing) return null;

  const assetConfig = listing.asset?.asset_type 
    ? ASSET_TYPE_CONFIG[listing.asset.asset_type as AssetType] 
    : null;
  const transactionConfig = TRANSACTION_TYPE_CONFIG[listing.transaction_type as TransactionType];

  return (
    <Link to={`/app/market/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
        <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
          <span className="text-5xl">{assetConfig?.icon || '📦'}</span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
              Guardado {new Date(favorite.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
