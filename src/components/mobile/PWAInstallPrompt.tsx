import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone, Share } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  delay?: number;
  className?: string;
}

export function PWAInstallPrompt({ delay = 30000, className }: PWAInstallPromptProps) {
  const { isInstallable, isInstalled, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if previously dismissed
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        setDismissed(true);
        return;
      }
    }

    // Show after delay if installable and not installed
    if ((isInstallable || iOS) && !isInstalled && !dismissed) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed, delay]);

  if (!visible || isInstalled || dismissed) return null;

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return (
    <div 
      className={cn(
        'fixed left-4 right-4 z-50',
        'bottom-20 md:bottom-8',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">
                Instalar IP-NEXUS
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isIOS ? (
                  <>
                    Toca <Share className="inline h-4 w-4 mx-1" /> y luego 
                    "Añadir a pantalla de inicio"
                  </>
                ) : (
                  'Añade la app a tu pantalla de inicio para acceso rápido y trabajar offline.'
                )}
              </p>
              
              {/* Actions */}
              {!isIOS && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleInstall}>
                    <Download className="h-4 w-4 mr-1" />
                    Instalar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    Ahora no
                  </Button>
                </div>
              )}
              
              {isIOS && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="mt-2"
                >
                  Entendido
                </Button>
              )}
            </div>
            
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
