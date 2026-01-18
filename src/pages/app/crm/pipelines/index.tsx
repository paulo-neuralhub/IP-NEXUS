import { usePageTitle } from '@/contexts/page-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Plus } from 'lucide-react';

export default function PipelineList() {
  usePageTitle('Pipelines');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
          <p className="text-muted-foreground">Configura tus procesos de venta</p>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pipeline
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Configuración de Pipelines próximamente</h3>
          <p className="text-muted-foreground text-center max-w-md">
            La configuración de pipelines con drag & drop de etapas se implementará en el siguiente prompt (3C).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
