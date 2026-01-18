import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Filter, 
  Download,
  Building,
  Briefcase,
  Users,
  Languages,
  MoreHorizontal,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMatterCosts, useDeleteMatterCost } from '@/hooks/use-finance';
import { COST_TYPES, COST_STATUSES, formatCurrency } from '@/lib/constants/finance';
import type { CostFilters, CostType, CostStatus } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface CostsListProps {
  matterId?: string;
  showMatterColumn?: boolean;
}

const CostTypeIcon = ({ type }: { type: CostType }) => {
  const icons = {
    official_fee: Building,
    service_fee: Briefcase,
    third_party: Users,
    translation: Languages,
    other: MoreHorizontal,
  };
  const Icon = icons[type];
  return <Icon className="w-4 h-4" />;
};

export function CostsList({ matterId, showMatterColumn = true }: CostsListProps) {
  const [filters, setFilters] = useState<CostFilters>({ matter_id: matterId });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: costs = [], isLoading } = useMatterCosts(filters);
  const deleteMutation = useDeleteMatterCost();
  
  const totalPending = costs
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + (c.total_amount || 0), 0);
  
  const totalBillable = costs
    .filter(c => c.is_billable && c.status !== 'invoiced')
    .reduce((sum, c) => sum + (c.total_amount || 0), 0);
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const selectAll = () => {
    if (selectedIds.length === costs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(costs.map(c => c.id));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success('Coste eliminado');
      setDeleteId(null);
    } catch (error) {
      toast.error('Error al eliminar el coste');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-foreground">Costes</h3>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              Pendiente: <span className="font-medium text-orange-600">{formatCurrency(totalPending)}</span>
            </span>
            <span className="text-muted-foreground">
              Facturable: <span className="font-medium text-primary">{formatCurrency(totalBillable)}</span>
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" /> Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Exportar
          </Button>
          <Button asChild size="sm">
            <Link to={matterId ? `/app/finance/costs/new?matter=${matterId}` : '/app/finance/costs/new'}>
              <Plus className="w-4 h-4 mr-2" /> Añadir coste
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Filtros rápidos */}
      <div className="flex gap-2">
        {Object.entries(COST_STATUSES).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilters(prev => ({
              ...prev,
              status: prev.status === key ? undefined : key as CostStatus,
            }))}
            className={cn(
              "px-3 py-1 text-sm rounded-full transition-colors",
              filters.status === key
                ? "text-white"
                : "bg-muted hover:bg-muted/80"
            )}
            style={filters.status === key ? { backgroundColor: config.color } : undefined}
          >
            {config.label}
          </button>
        ))}
      </div>
      
      {/* Acciones masivas */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} seleccionados
          </span>
          <Button variant="link" size="sm" className="text-primary">
            Crear factura
          </Button>
          <Button variant="link" size="sm" className="text-primary">
            Marcar como pagados
          </Button>
        </div>
      )}
      
      {/* Tabla */}
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === costs.length && costs.length > 0}
                  onCheckedChange={selectAll}
                />
              </TableHead>
              <TableHead>Fecha</TableHead>
              {showMatterColumn && <TableHead>Expediente</TableHead>}
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Importe</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Facturable</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.map(cost => (
              <TableRow key={cost.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(cost.id)}
                    onCheckedChange={() => toggleSelect(cost.id)}
                  />
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(cost.cost_date), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                {showMatterColumn && (
                  <TableCell>
                    {cost.matter && (
                      <Link 
                        to={`/app/docket/${cost.matter_id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {cost.matter.reference}
                      </Link>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <p className="text-sm font-medium text-foreground">{cost.description}</p>
                  {cost.notes && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{cost.notes}</p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: `${COST_TYPES[cost.cost_type].color}20` }}
                    >
                      <CostTypeIcon type={cost.cost_type} />
                    </span>
                    <span className="text-sm">{COST_TYPES[cost.cost_type].label}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">{formatCurrency(cost.total_amount || 0, cost.currency)}</span>
                  {cost.quantity && cost.quantity > 1 && (
                    <span className="text-xs text-muted-foreground block">
                      {cost.quantity} x {formatCurrency(cost.amount, cost.currency)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span 
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{ 
                      backgroundColor: `${COST_STATUSES[cost.status].color}20`,
                      color: COST_STATUSES[cost.status].color,
                    }}
                  >
                    {COST_STATUSES[cost.status].label}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {cost.is_billable ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setDeleteId(cost.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {costs.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay costes registrados</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar coste?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El coste será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
