import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OfflineBannerProps {
  className?: string;
  onRetry?: () => void;
}

export function OfflineBanner({ className, onRetry }: OfflineBannerProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div 
      className={cn(
        'bg-amber-500 text-white px-4 py-2',
        'flex items-center justify-between gap-3',
        'text-sm animate-in slide-in-from-top duration-300',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span className="font-medium">Sin conexión</span>
        <span className="hidden sm:inline text-amber-100">
          - Trabajando en modo offline
        </span>
      </div>
      
      <Button 
        size="sm" 
        variant="ghost"
        onClick={handleRetry}
        className="h-7 px-2 text-white hover:bg-amber-600 hover:text-white"
      >
        <RefreshCw className="h-3.5 w-3.5 mr-1" />
        Reintentar
      </Button>
    </div>
  );
}
