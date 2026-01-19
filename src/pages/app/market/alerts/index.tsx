import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarketAlerts, useCreateMarketAlert, useUpdateMarketAlert, useDeleteMarketAlert } from '@/hooks/use-market';
import { ASSET_TYPE_CONFIG, TRANSACTION_TYPE_CONFIG, type AssetType, type TransactionType } from '@/types/market.types';

export default function AlertsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: alerts, isLoading } = useMarketAlerts();
  const createAlert = useCreateMarketAlert();
  const updateAlert = useUpdateMarketAlert();
  const deleteAlert = useDeleteMarketAlert();

  const [newAlert, setNewAlert] = useState({
    name: '',
    asset_type: '' as AssetType | '',
    transaction_type: '' as TransactionType | '',
    min_price: '',
    max_price: '',
    jurisdictions: [] as string[],
    keywords: [] as string[],
  });

  const handleCreateAlert = () => {
    const criteria: any = {};
    if (newAlert.asset_type) criteria.asset_type = newAlert.asset_type;
    if (newAlert.transaction_type) criteria.transaction_type = newAlert.transaction_type;
    if (newAlert.min_price) criteria.min_price = parseFloat(newAlert.min_price);
    if (newAlert.max_price) criteria.max_price = parseFloat(newAlert.max_price);
    if (newAlert.jurisdictions.length) criteria.jurisdictions = newAlert.jurisdictions;
    if (newAlert.keywords.length) criteria.keywords = newAlert.keywords;

    createAlert.mutate({
      name: newAlert.name,
      criteria,
      is_active: true,
    } as any, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewAlert({
          name: '',
          asset_type: '',
          transaction_type: '',
          min_price: '',
          max_price: '',
          jurisdictions: [],
          keywords: [],
        });
      }
    });
  };

  const toggleAlert = (alertId: string, isActive: boolean) => {
    updateAlert.mutate({ id: alertId, is_active: !isActive });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas de Mercado
          </h2>
          <p className="text-muted-foreground text-sm">
            Recibe notificaciones cuando aparezcan listings que te interesen
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Alerta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Alerta</DialogTitle>
              <DialogDescription>
                Define los criterios para recibir notificaciones de nuevos listings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la alerta</Label>
                <Input
                  id="name"
                  placeholder="Ej: Marcas tecnológicas en España"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de activo</Label>
                  <Select
                    value={newAlert.asset_type}
                    onValueChange={(v) => setNewAlert({ ...newAlert, asset_type: v as AssetType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ASSET_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de transacción</Label>
                  <Select
                    value={newAlert.transaction_type}
                    onValueChange={(v) => setNewAlert({ ...newAlert, transaction_type: v as TransactionType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquiera" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TRANSACTION_TYPE_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_price">Precio mínimo (€)</Label>
                  <Input
                    id="min_price"
                    type="number"
                    placeholder="0"
                    value={newAlert.min_price}
                    onChange={(e) => setNewAlert({ ...newAlert, min_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_price">Precio máximo (€)</Label>
                  <Input
                    id="max_price"
                    type="number"
                    placeholder="Sin límite"
                    value={newAlert.max_price}
                    onChange={(e) => setNewAlert({ ...newAlert, max_price: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateAlert} 
                disabled={!newAlert.name || createAlert.isPending}
              >
                Crear Alerta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard 
              key={alert.id} 
              alert={alert}
              onToggle={() => toggleAlert(alert.id, alert.is_active)}
              onDelete={() => deleteAlert.mutate(alert.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes alertas configuradas</h3>
            <p className="text-muted-foreground mb-4">
              Crea una alerta para recibir notificaciones de nuevos listings
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Alerta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AlertCard({ 
  alert, 
  onToggle, 
  onDelete 
}: { 
  alert: any; 
  onToggle: () => void;
  onDelete: () => void;
}) {
  const criteria = alert.criteria || {};
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            alert.is_active ? 'bg-market/20 text-market' : 'bg-muted text-muted-foreground'
          }`}>
            <Bell className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{alert.name}</h4>
              {!alert.is_active && (
                <Badge variant="secondary">Pausada</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {criteria.asset_type && (
                <Badge variant="outline" className="text-xs">
                  {ASSET_TYPE_CONFIG[criteria.asset_type as AssetType]?.label || criteria.asset_type}
                </Badge>
              )}
              {criteria.transaction_type && (
                <Badge variant="outline" className="text-xs">
                  {TRANSACTION_TYPE_CONFIG[criteria.transaction_type as TransactionType]?.label || criteria.transaction_type}
                </Badge>
              )}
              {(criteria.min_price || criteria.max_price) && (
                <Badge variant="outline" className="text-xs">
                  €{criteria.min_price || 0} - €{criteria.max_price || '∞'}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alert.match_count > 0 && (
              <Badge variant="secondary">{alert.match_count} matches</Badge>
            )}
            <Switch
              checked={alert.is_active}
              onCheckedChange={onToggle}
            />
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
