// ============================================
// src/pages/backoffice/landings/leads.tsx
// Leads List - View and manage captured leads
// ============================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { useChatbotLeads, useBulkUpdateLeads, LeadFilters } from '@/hooks/backoffice/useChatbotLeads';
import { useLandingPages } from '@/hooks/backoffice/useLandingPages';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Cualificado' },
  { value: 'demo', label: 'Demo' },
  { value: 'converted', label: 'Convertido' },
  { value: 'lost', label: 'Perdido' },
];

export default function LeadsListPage() {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: leads, isLoading } = useChatbotLeads(filters);
  const { data: landingPages } = useLandingPages();
  const bulkUpdateMutation = useBulkUpdateLeads();

  // Pagination
  const totalPages = Math.ceil((leads?.length || 0) / pageSize);
  const paginatedLeads = leads?.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedLeads?.map(l => l.id) || []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  const handleBulkStatusChange = (status: string) => {
    bulkUpdateMutation.mutate({
      ids: selectedIds,
      updates: { status },
    });
    setSelectedIds([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500/10 text-blue-500">Nuevo</Badge>;
      case 'contacted':
        return <Badge className="bg-purple-500/10 text-purple-500">Contactado</Badge>;
      case 'qualified':
        return <Badge className="bg-amber-500/10 text-amber-500">Cualificado</Badge>;
      case 'demo':
        return <Badge className="bg-cyan-500/10 text-cyan-500">Demo</Badge>;
      case 'converted':
        return <Badge className="bg-green-500/10 text-green-500">Convertido</Badge>;
      case 'lost':
        return <Badge variant="outline" className="text-muted-foreground">Perdido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderScore = (score: number | null) => {
    const stars = Math.min(score || 0, 5);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < stars ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
            {leads?.length || 0} leads capturados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email, nombre o empresa..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {STATUS_OPTIONS.find(s => s.value === (filters.status || 'all'))?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setFilters({ ...filters, status: opt.value === 'all' ? undefined : opt.value })}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filters.landing ? landingPages?.find(l => l.slug === filters.landing)?.name : 'Todas las landings'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilters({ ...filters, landing: undefined })}>
              Todas las landings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {landingPages?.map((lp) => (
              <DropdownMenuItem
                key={lp.id}
                onClick={() => setFilters({ ...filters, landing: lp.slug })}
              >
                {lp.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm">
            Seleccionados: <strong>{selectedIds.length}</strong>
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Cambiar estado
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUS_OPTIONS.filter(s => s.value !== 'all').map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleBulkStatusChange(opt.value)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedIds.length === paginatedLeads?.length && paginatedLeads?.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads && paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectOne(lead.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.email}</p>
                        {lead.name && (
                          <p className="text-xs text-muted-foreground">{lead.name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{lead.company || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit capitalize text-xs">
                          {lead.conversation?.landing_slug || 'N/A'}
                        </Badge>
                        {lead.conversation?.utm_source && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {lead.conversation.utm_source}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderScore(lead.lead_score)}</TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/backoffice/landings/leads/${lead.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No se encontraron leads
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
