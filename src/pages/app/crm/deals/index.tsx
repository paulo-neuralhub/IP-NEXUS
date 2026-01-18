import { usePageTitle } from '@/contexts/page-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Plus } from 'lucide-react';

export default function DealList() {
  usePageTitle('Deals');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-muted-foreground">Gestiona tus oportunidades de venta</p>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Deal
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Vista Kanban próximamente</h3>
          <p className="text-muted-foreground text-center max-w-md">
            La vista de deals con Kanban interactivo se implementará en el siguiente prompt (3C).
            Por ahora puedes crear contactos y ver sus deals asociados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
