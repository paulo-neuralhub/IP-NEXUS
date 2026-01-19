import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Eye, Clock, Star, MapPin } from 'lucide-react';
import { AssetTypeBadge } from '../shared/AssetTypeBadge';
import { TransactionTypeBadge } from '../shared/TransactionTypeBadge';
import { VerificationBadge, VerificationStatus } from '../shared/VerificationBadge';
import { PriceDisplay } from '../shared/PriceDisplay';
import { JurisdictionFlag } from '../shared/JurisdictionFlag';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AssetType, TransactionType } from '@/types/market.types';

interface ListingCardProps {
  listing: {
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
  };
  variant?: 'default' | 'compact' | 'featured';
  showSeller?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export function ListingCard({ 
  listing, 
  variant = 'default', 
  showSeller = true,
  isFavorite = false,
  onFavoriteToggle
}: ListingCardProps) {
  const mainImage = listing.asset?.images?.[0] || '/placeholder.svg';
  const publishedDate = listing.published_at || listing.created_at;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.();
  };

  const verificationStatus: VerificationStatus = listing.asset?.is_verified 
    ? 'verified' 
    : listing.asset?.verification_status === 'pending' 
      ? 'pending' 
      : 'unverified';

  // Compact variant
  if (variant === 'compact') {
    return (
      <Link to={`/app/market/listings/${listing.id}`}>
        <Card className="group hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={mainImage} alt={listing.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 flex-shrink-0" 
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {listing.asset?.type && (
                    <AssetTypeBadge type={listing.asset.type} size="sm" showLabel={false} />
                  )}
                  {listing.asset?.jurisdiction && (
                    <JurisdictionFlag jurisdiction={listing.asset.jurisdiction} size="sm" />
                  )}
                </div>
                <PriceDisplay 
                  amount={listing.price} 
                  currency={listing.currency} 
                  size="sm" 
                  className="mt-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <Link to={`/app/market/listings/${listing.id}`}>
        <Card className="group hover:shadow-xl transition-all border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
              <Star className="h-3 w-3 fill-current" />
              Destacado
            </span>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background" 
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
            </Button>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-lg">
            <img 
              src={mainImage} 
              alt={listing.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-xl font-bold text-white mb-2">{listing.title}</h3>
              <div className="flex flex-wrap gap-2">
                {listing.transaction_types?.slice(0, 2).map(type => (
                  <TransactionTypeBadge key={type} type={type} size="sm" />
                ))}
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <PriceDisplay 
                amount={listing.price} 
                currency={listing.currency} 
                size="lg" 
                showNegotiable 
                isNegotiable={listing.is_negotiable} 
              />
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                {listing.asset?.jurisdiction && (
                  <JurisdictionFlag jurisdiction={listing.asset.jurisdiction} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/app/market/listings/${listing.id}`}>
      <Card className="group hover:shadow-lg transition-all h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <img 
            src={mainImage} 
            alt={listing.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
          {listing.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                <Star className="h-3 w-3 fill-current" />
                Destacado
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background" 
              onClick={handleFavoriteClick}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-red-500 text-red-500')} />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {listing.asset?.type && (
              <AssetTypeBadge type={listing.asset.type} size="sm" />
            )}
            <VerificationBadge status={verificationStatus} size="sm" showLabel={false} />
          </div>
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {listing.title}
          </h3>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {listing.transaction_types?.slice(0, 2).map(type => (
              <TransactionTypeBadge key={type} type={type} size="sm" showIcon={false} />
            ))}
          </div>
          
          <div className="mt-auto">
            <PriceDisplay 
              amount={listing.price} 
              currency={listing.currency} 
              showNegotiable 
              isNegotiable={listing.is_negotiable} 
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t">
              <div className="flex items-center gap-1">
                {listing.asset?.jurisdiction && (
                  <JurisdictionFlag jurisdiction={listing.asset.jurisdiction} size="sm" />
                )}
              </div>
              <div className="flex items-center gap-3">
                {listing.views_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {listing.views_count}
                  </span>
                )}
                {publishedDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDistanceToNow(new Date(publishedDate), { addSuffix: true, locale: es })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
