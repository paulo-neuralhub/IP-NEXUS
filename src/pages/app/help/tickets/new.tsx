// ============================================================
// IP-NEXUS APP - NEW TICKET PAGE
// ============================================================

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketForm } from '@/components/features/help/TicketForm';

export default function NewTicketPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/app/help/tickets">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Mis Tickets
        </Button>
      </Link>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Crear Ticket de Soporte</CardTitle>
          <CardDescription>
            Describe tu problema o consulta y te responderemos lo antes posible.
            Cuanta más información nos proporciones, mejor podremos ayudarte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketForm />
        </CardContent>
      </Card>
    </div>
  );
}
