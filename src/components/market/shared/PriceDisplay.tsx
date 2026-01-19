import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  originalAmount?: number;
  showNegotiable?: boolean;
  isNegotiable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string }> = {
  EUR: { symbol: '€', locale: 'es-ES' },
  USD: { symbol: '$', locale: 'en-US' },
  GBP: { symbol: '£', locale: 'en-GB' },
  MXN: { symbol: '$', locale: 'es-MX' },
  BRL: { symbol: 'R$', locale: 'pt-BR' },
};

export function PriceDisplay({ 
  amount, 
  currency = 'EUR', 
  originalAmount, 
  showNegotiable = false, 
  isNegotiable = false, 
  size = 'md', 
  className 
}: PriceDisplayProps) {
  const currencyConfig = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.EUR;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat(currencyConfig.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const hasDiscount = originalAmount && originalAmount > amount;
  const discountPercent = hasDiscount ? Math.round((1 - amount / originalAmount!) * 100) : 0;

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold text-foreground', sizeClasses[size])}>
          {formatPrice(amount)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalAmount!)}
            </span>
            <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400 px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </span>
          </>
        )}
      </div>
      {showNegotiable && isNegotiable && (
        <span className="text-xs text-muted-foreground mt-0.5">Precio negociable</span>
      )}
    </div>
  );
}
