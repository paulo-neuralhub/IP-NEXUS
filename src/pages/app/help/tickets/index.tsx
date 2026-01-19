// ============================================================
// IP-NEXUS APP - MY TICKETS LIST
// ============================================================

import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketList } from '@/components/features/help/TicketList';

export default function MyTicketsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mis Tickets de Soporte</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona tus consultas y solicitudes de ayuda
          </p>
        </div>
        <Link to="/app/help/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Button>
        </Link>
      </div>

      {/* Ticket List */}
      <TicketList 
        basePath="/app/help" 
        onCreateClick={() => navigate('/app/help/tickets/new')}
      />
    </div>
  );
}
