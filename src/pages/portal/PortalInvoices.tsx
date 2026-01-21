/**
 * Portal Invoices
 * Lista de facturas del cliente
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Receipt, 
  Download,
  Eye,
  Filter,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

// Mock data
const mockInvoices = [
  {
    id: '1',
    number: 'INV-2025-0042',
    date: '2025-01-20',
    dueDate: '2025-02-20',
    amount: 1250.00,
    status: 'paid',
    concept: 'Registro marca NEXUS + Tasas OEPM',
  },
  {
    id: '2',
    number: 'INV-2025-0067',
    date: '2025-02-25',
    dueDate: '2025-03-25',
    amount: 3500.00,
    status: 'pending',
    concept: 'Solicitud patente IoT Device + Búsqueda anterioridades',
  },
  {
    id: '3',
    number: 'INV-2024-0312',
    date: '2024-11-15',
    dueDate: '2024-12-15',
    amount: 850.00,
    status: 'paid',
    concept: 'Renovación marca ACME Corp',
  },
  {
    id: '4',
    number: 'INV-2024-0298',
    date: '2024-10-05',
    dueDate: '2024-11-05',
    amount: 2100.00,
    status: 'paid',
    concept: 'Registro diseño industrial Widget',
  },
  {
    id: '5',
    number: 'INV-2025-0089',
    date: '2025-03-10',
    dueDate: '2025-04-10',
    amount: 450.00,
    status: 'overdue',
    concept: 'Vigilancia de marca mensual',
  },
];

export default function PortalInvoices() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = mockInvoices.filter((inv) => {
    const matchesSearch = 
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.concept.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Pagada
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'overdue':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Vencida
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Stats
  const stats = {
    total: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    pending: mockInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturas</h1>
        <p className="text-muted-foreground">
          Historial de facturación y pagos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total facturado</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(stats.total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Pendiente de pago</p>
            <p className="text-2xl font-bold mt-1 text-amber-600">{formatCurrency(stats.pending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Vencido</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(stats.overdue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número o concepto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="paid">Pagadas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Invoices List */}
          <div className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No se encontraron facturas
              </div>
            ) : (
              filteredInvoices.map((inv) => (
                <div 
                  key={inv.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{inv.number}</p>
                        {getStatusBadge(inv.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{inv.concept}</p>
                      <p className="text-xs text-muted-foreground">
                        Fecha: {new Date(inv.date).toLocaleDateString('es')} • 
                        Vence: {new Date(inv.dueDate).toLocaleDateString('es')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:ml-auto">
                    <p className="text-lg font-semibold">{formatCurrency(inv.amount)}</p>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                      {inv.status !== 'paid' && (
                        <Button size="sm" variant="default">
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
