// =====================================================
// IP-NEXUS - CLIENT QUICK ACTIONS (PROMPT 27)
// Acciones rápidas para la ficha de cliente
// =====================================================

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Briefcase,
  CreditCard,
  Calendar,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ClientQuickActionsProps {
  client: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  onRefresh?: () => void;
  onAddNote?: () => void;
  onSendEmail?: () => void;
  onCall?: () => void;
}

export function ClientQuickActions({
  client,
  onRefresh,
  onAddNote,
  onSendEmail,
  onCall,
}: ClientQuickActionsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAction = (action: string) => {
    switch (action) {
      case 'email':
        if (onSendEmail) {
          onSendEmail();
        } else if (client.email) {
          window.location.href = `mailto:${client.email}`;
        } else {
          toast({ title: 'Este cliente no tiene email configurado', variant: 'destructive' });
        }
        break;
      case 'call':
        if (onCall) {
          onCall();
        } else if (client.phone) {
          window.location.href = `tel:${client.phone}`;
        } else {
          toast({ title: 'Este cliente no tiene teléfono configurado', variant: 'destructive' });
        }
        break;
      case 'matter':
        navigate(`/app/expedientes/nuevo?client=${client.id}`);
        break;
      case 'document':
        toast({ title: 'Funcionalidad en desarrollo' });
        break;
      case 'invoice':
        navigate(`/app/finanzas/facturas/nueva?client=${client.id}`);
        break;
      case 'task':
        toast({ title: 'Funcionalidad en desarrollo' });
        break;
      case 'note':
        if (onAddNote) {
          onAddNote();
        } else {
          toast({ title: 'Funcionalidad en desarrollo' });
        }
        break;
      default:
        console.log('Action:', action, 'for client:', client.id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleAction('email')}>
        <Mail className="w-4 h-4 mr-2" />
        Email
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleAction('call')}>
        <Phone className="w-4 h-4 mr-2" />
        Llamar
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleAction('matter')}>
            <Briefcase className="w-4 h-4 mr-2" />
            Nuevo expediente
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('document')}>
            <FileText className="w-4 h-4 mr-2" />
            Nuevo documento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('invoice')}>
            <CreditCard className="w-4 h-4 mr-2" />
            Nueva factura
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction('task')}>
            <Calendar className="w-4 h-4 mr-2" />
            Nueva tarea
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('note')}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Añadir nota
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
