import { ListingCard } from './ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AssetType, TransactionType } from '@/types/market.types';

interface ListingData {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  is_featured?: boolean;
  is_negotiable?: boolean;
  views_count?: number;
  created_at?: string;
  published_at?: string;
  transaction_types?: TransactionType[];
  asset?: {
    type?: AssetType;
    jurisdiction?: string;
    images?: string[];
    is_verified?: boolean;
    verification_status?: string;
  };
  seller?: {
    display_name?: string;
    avatar_url?: string;
    is_verified_agent?: boolean;
  };
}

interface ListingGridProps {
  listings: ListingData[];
  isLoading?: boolean;
  favoriteIds?: string[];
  onFavoriteToggle?: (listingId: string) => void;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ListingGrid({
  listings,
  isLoading = false,
  favoriteIds = [],
  onFavoriteToggle,
  columns = 3,
  variant = 'default',
  className
}: ListingGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  if (isLoading) {
    return (
      <div className={cn('grid gap-6', gridClasses[columns], className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron listings</p>
      </div>
    );
  }

  // Separate featured listings
  const featuredListings = listings.filter(l => l.is_featured);
  const regularListings = listings.filter(l => !l.is_featured);

  return (
    <div className={cn('space-y-8', className)}>
      {/* Featured listings */}
      {featuredListings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Destacados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                variant="featured"
                isFavorite={favoriteIds.includes(listing.id)}
                onFavoriteToggle={() => onFavoriteToggle?.(listing.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular listings */}
      {regularListings.length > 0 && (
        <div className={cn('grid gap-6', gridClasses[columns])}>
          {regularListings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              variant={variant}
              isFavorite={favoriteIds.includes(listing.id)}
              onFavoriteToggle={() => onFavoriteToggle?.(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="border rounded-lg p-4">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-8 w-1/3" />
        <div className="flex justify-between pt-3 border-t">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}
