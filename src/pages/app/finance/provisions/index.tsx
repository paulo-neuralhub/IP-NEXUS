// ============================================
// src/pages/app/finance/provisions/index.tsx
// Lista de provisiones de fondos
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Receipt,
  Coins,
  RotateCcw,
  Filter,
  AlertCircle,
  RefreshCw,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
} from 'lucide-react';
import { usePageTitle } from '@/hooks/use-page-title';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProvisions, useProvisionStats, type ProvisionStatus } from '@/hooks/finance/useProvisions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import { ProvisionDialog } from '@/components/features/finance/provisions/ProvisionDialog';
import { ProvisionMovementDialog } from '@/components/features/finance/provisions/ProvisionMovementDialog';

const statusConfig: Record<ProvisionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <Clock className="w-3 h-3" /> },
  requested: { label: 'Solicitada', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <ArrowUpCircle className="w-3 h-3" /> },
  received: { label: 'Recibida', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <ArrowDownCircle className="w-3 h-3" /> },
  used: { label: 'Utilizada', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <Coins className="w-3 h-3" /> },
  returned: { label: 'Devuelta', color: 'bg-muted text-muted-foreground', icon: <RotateCcw className="w-3 h-3" /> },
};

export default function ProvisionsPage() {
  usePageTitle('Provisiones');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProvisionStatus | 'all'>('all');
  const [showProvisionDialog, setShowProvisionDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [selectedProvisionId, setSelectedProvisionId] = useState<string | null>(null);
  const [movementType, setMovementType] = useState<'request' | 'receipt' | 'use' | 'return'>('receipt');

  const { data: provisions, isLoading, error, refetch } = useProvisions();
  const { data: stats } = useProvisionStats();

  // Filter provisions
  const filteredProvisions = (provisions || []).filter(p => {
    const matchesSearch = 
      (p.concept || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.matter?.reference || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRegisterMovement = (provisionId: string, type: 'request' | 'receipt' | 'use' | 'return') => {
    setSelectedProvisionId(provisionId);
    setMovementType(type);
    setShowMovementDialog(true);
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Provisiones de Fondos</h1>
            <p className="text-muted-foreground">
              Gestiona provisiones para tasas y gastos
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error al cargar provisiones: {error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provisiones de Fondos</h1>
          <p className="text-muted-foreground">
            Gestiona provisiones para tasas y gastos de clientes
          </p>
        </div>
        <Button onClick={() => setShowProvisionDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva provisión
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Pendientes
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(stats?.pendingAmount || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="w-4 h-4" />
              En cuenta
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.receivedAmount || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Coins className="w-4 h-4" />
              Disponible
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(stats?.availableAmount || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lista de provisiones</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter === 'all' ? 'Todos' : statusConfig[statusFilter].label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    Todos
                  </DropdownMenuItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <DropdownMenuItem key={key} onClick={() => setStatusFilter(key as ProvisionStatus)}>
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Expediente</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead className="text-right">Recibido</TableHead>
                <TableHead className="text-right">Usado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProvisions.map((provision) => {
                const status = statusConfig[provision.status] || statusConfig.pending;
                const available = Number(provision.amount) - Number(provision.used_amount) - Number(provision.returned_amount);
                
                return (
                  <TableRow key={provision.id}>
                    <TableCell className="font-medium">
                      {provision.client?.name || '-'}
                    </TableCell>
                    <TableCell>
                      {provision.matter ? (
                        <Link 
                          to={`/app/docket/${provision.matter.id}`}
                          className="text-primary hover:underline"
                        >
                          {provision.matter.reference}
                        </Link>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{provision.concept}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(provision.amount)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {provision.status === 'received' || provision.status === 'used' || provision.status === 'returned'
                        ? formatCurrency(provision.amount)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right text-purple-600">
                      {Number(provision.used_amount) > 0 
                        ? formatCurrency(provision.used_amount)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status.color} gap-1`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/app/finance/provisions/${provision.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalle
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {provision.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleRegisterMovement(provision.id, 'request')}>
                              <ArrowUpCircle className="w-4 h-4 mr-2" />
                              Solicitar al cliente
                            </DropdownMenuItem>
                          )}
                          {(provision.status === 'pending' || provision.status === 'requested') && (
                            <DropdownMenuItem onClick={() => handleRegisterMovement(provision.id, 'receipt')}>
                              <Receipt className="w-4 h-4 mr-2" />
                              Registrar ingreso
                            </DropdownMenuItem>
                          )}
                          {provision.status === 'received' && available > 0 && (
                            <>
                              <DropdownMenuItem onClick={() => handleRegisterMovement(provision.id, 'use')}>
                                <Coins className="w-4 h-4 mr-2" />
                                Registrar uso
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRegisterMovement(provision.id, 'return')}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Devolver excedente
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Loading */}
              {isLoading && (
                <>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              
              {/* Empty */}
              {!isLoading && filteredProvisions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">No hay provisiones</p>
                        <p className="text-sm text-muted-foreground">
                          Crea tu primera provisión de fondos
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setShowProvisionDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear provisión
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProvisionDialog
        open={showProvisionDialog}
        onOpenChange={setShowProvisionDialog}
        onSuccess={() => refetch()}
      />

      <ProvisionMovementDialog
        open={showMovementDialog}
        onOpenChange={setShowMovementDialog}
        provisionId={selectedProvisionId}
        movementType={movementType}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
