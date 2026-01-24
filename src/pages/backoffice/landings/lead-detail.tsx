// ============================================
// src/pages/backoffice/landings/lead-detail.tsx
// Lead Detail Page - Full lead info with conversation
// ============================================

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Star,
  MessageSquare,
  ExternalLink,
  Clock,
  User,
  Bot,
  Send,
} from 'lucide-react';
import {
  useChatbotLead,
  useUpdateLeadStatus,
  useUpdateLeadNotes,
  useScheduleDemo,
  useCompleteDemo,
} from '@/hooks/backoffice/useChatbotLeads';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contactado', color: 'bg-purple-500' },
  { value: 'qualified', label: 'Cualificado', color: 'bg-amber-500' },
  { value: 'demo', label: 'Demo', color: 'bg-cyan-500' },
  { value: 'converted', label: 'Convertido', color: 'bg-green-500' },
  { value: 'lost', label: 'Perdido', color: 'bg-gray-500' },
];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [notesEdited, setNotesEdited] = useState(false);

  const { data: lead, isLoading } = useChatbotLead(id);
  const updateStatusMutation = useUpdateLeadStatus();
  const updateNotesMutation = useUpdateLeadNotes();
  const scheduleDemoMutation = useScheduleDemo();
  const completeDemoMutation = useCompleteDemo();

  // Initialize notes when data loads
  if (lead && !notesEdited && notes !== (lead.notes || '')) {
    setNotes(lead.notes || '');
  }

  const handleStatusChange = (status: string) => {
    if (id) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleSaveNotes = () => {
    if (id) {
      updateNotesMutation.mutate({ id, notes });
      setNotesEdited(false);
    }
  };

  const handleScheduleDemo = () => {
    // In a real app, open a calendar picker
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 2);
    scheduledAt.setHours(11, 0, 0, 0);
    
    if (id) {
      scheduleDemoMutation.mutate({ id, scheduledAt: scheduledAt.toISOString() });
    }
  };

  const handleCompleteDemo = () => {
    if (id) {
      completeDemoMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lead no encontrado</p>
        <Button variant="link" onClick={() => navigate('/backoffice/landings/leads')}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  const initials = lead.name
    ? lead.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : lead.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/backoffice/landings/leads')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Detalle del Lead</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">{lead.name || lead.email}</h2>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < (lead.lead_score || 0) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </span>
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </span>
                    )}
                  </div>
                  {lead.company && (
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {lead.company}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={lead.status === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(opt.value)}
                    className={lead.status === opt.value ? '' : 'opacity-60'}
                  >
                    <div className={`h-2 w-2 rounded-full mr-2 ${opt.color}`} />
                    {opt.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversación Chatbot
              </CardTitle>
              <Badge variant="outline">
                {lead.messages?.length || 0} mensajes
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {lead.messages && lead.messages.length > 0 ? (
                  lead.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    No hay mensajes en la conversación
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notas Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Añade notas sobre este lead..."
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setNotesEdited(true);
                }}
                rows={4}
              />
              {notesEdited && (
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={handleSaveNotes}>
                    Guardar notas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Origin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Origen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Landing</span>
                <Badge variant="outline" className="capitalize">
                  {lead.conversation?.landing_slug || 'N/A'}
                </Badge>
              </div>
              {lead.conversation?.utm_source && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuente</span>
                  <span className="font-medium">{lead.conversation.utm_source}</span>
                </div>
              )}
              {lead.conversation?.utm_medium && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medio</span>
                  <span className="font-medium">{lead.conversation.utm_medium}</span>
                </div>
              )}
              {lead.conversation?.utm_campaign && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaña</span>
                  <span className="font-medium text-sm truncate max-w-[150px]">
                    {lead.conversation.utm_campaign}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium">
                  {format(new Date(lead.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          {lead.interested_modules && lead.interested_modules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Intereses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lead.interested_modules.map((mod) => (
                    <Badge key={mod} variant="secondary" className="capitalize">
                      {mod}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.demo_scheduled_at ? (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(lead.demo_scheduled_at), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                  {lead.demo_completed ? (
                    <Badge className="bg-green-500/10 text-green-500">Completada</Badge>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCompleteDemo}>
                        Marcar completada
                      </Button>
                      <Button size="sm" variant="ghost">
                        Enviar recordatorio
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Button className="w-full" onClick={handleScheduleDemo}>
                  Agendar demo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Enviar email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Registrar llamada
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Crear cliente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
