import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, Plus } from 'lucide-react';

interface AIBrainHeaderProps {
  onAddProvider: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function AIBrainHeader({ onAddProvider, onRefresh, isRefreshing }: AIBrainHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI Brain
        </h1>
        <p className="text-muted-foreground">
          Sistema centralizado de IA con redundancia y optimización
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Sincronizar estado
        </Button>
        <Button onClick={onAddProvider}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir provider
        </Button>
      </div>
    </div>
  );
}
