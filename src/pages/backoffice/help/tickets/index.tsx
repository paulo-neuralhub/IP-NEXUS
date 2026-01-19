// ============================================================
// IP-NEXUS BACKOFFICE - TICKETS MANAGEMENT
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupportTickets, useUpdateSupportTicket } from '@/hooks/help/useSupportTickets';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Abierto', variant: 'default' },
  in_progress: { label: 'En Proceso', variant: 'secondary' },
  waiting_response: { label: 'Esperando', variant: 'outline' },
  resolved: { label: 'Resuelto', variant: 'secondary' },
  closed: { label: 'Cerrado', variant: 'secondary' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'text-muted-foreground' },
  medium: { label: 'Media', color: 'text-yellow-500' },
  high: { label: 'Alta', color: 'text-orange-500' },
  urgent: { label: 'Urgente', color: 'text-destructive' },
};

export default function TicketsManagementPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const { data: tickets = [], isLoading } = useSupportTickets();
  const updateTicket = useUpdateSupportTicket();

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicket.mutateAsync({ 
        id: ticketId, 
        status: newStatus as any,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : undefined,
      });
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar el estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abiertos</SelectItem>
            <SelectItem value="in_progress">En Proceso</SelectItem>
            <SelectItem value="waiting_response">Esperando</SelectItem>
            <SelectItem value="resolved">Resueltos</SelectItem>
            <SelectItem value="closed">Cerrados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay tickets
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <span className="font-mono text-sm">
                        #{ticket.ticket_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium max-w-[300px] truncate">
                        {ticket.subject}
                      </p>
                    </TableCell>
                    <TableCell className="capitalize">
                      {ticket.category.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.status}
                        onValueChange={(v) => handleStatusChange(ticket.id, v)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <Badge variant={statusConfig[ticket.status]?.variant || 'secondary'}>
                            {statusConfig[ticket.status]?.label || ticket.status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([value, config]) => (
                            <SelectItem key={value} value={value}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={priorityConfig[ticket.priority]?.color || 'text-foreground'}>
                        {priorityConfig[ticket.priority]?.label || ticket.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(ticket.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/backoffice/help/tickets/${ticket.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
