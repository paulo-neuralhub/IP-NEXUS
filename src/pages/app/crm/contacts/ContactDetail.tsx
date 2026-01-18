import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContact, useActivities, useDeals, useDeleteContact } from '@/hooks/use-crm';
import { usePageTitle } from '@/contexts/page-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { 
  ActivityTimeline, AddActivityModal, ContactFormModal, LifecycleStageBadge 
} from '@/components/features/crm';
import { toast } from 'sonner';
import {
  ArrowLeft, MoreHorizontal, Pencil, Trash2, Mail, Phone,
  Building2, MapPin, Globe, MessageCircle, FileText,
  CheckSquare, Calendar, DollarSign, Tag
} from 'lucide-react';
import type { ActivityType } from '@/types/crm';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [showEditForm, setShowEditForm] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [defaultActivityType, setDefaultActivityType] = useState<ActivityType>('note');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Queries
  const { data: contact, isLoading: loadingContact } = useContact(id);
  const { data: activities = [], isLoading: loadingActivities } = useActivities({ contactId: id });
  const { data: deals = [] } = useDeals({ contact_id: id });
  const deleteContact = useDeleteContact();


  usePageTitle(contact?.name || 'Contacto');

  const handleDelete = async () => {
    if (!contact) return;
    try {
      await deleteContact.mutateAsync(contact.id);
      toast.success('Contacto eliminado');
      navigate('/app/crm/contacts');
    } catch (error) {
      toast.error('Error al eliminar el contacto');
    }
  };

  const openActivityModal = (type: ActivityType) => {
    setDefaultActivityType(type);
    setShowActivityModal(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCurrency = (value: number, currency = 'EUR') => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);
  };

  if (loadingContact) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Contacto no encontrado</p>
        <Button variant="link" onClick={() => navigate('/app/crm/contacts')}>
          Volver a contactos
        </Button>
      </div>
    );
  }

  const openDeals = deals.filter(d => d.status === 'open');
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/crm/contacts')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarImage src={contact.avatar_url || undefined} />
            <AvatarFallback className={contact.type === 'company' ? 'bg-purple-100 text-purple-700 text-xl' : 'bg-blue-100 text-blue-700 text-xl'}>
              {contact.type === 'company' ? <Building2 className="w-8 h-8" /> : getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{contact.name}</h1>
              <LifecycleStageBadge stage={contact.lifecycle_stage} />
            </div>
            <p className="text-muted-foreground">
              {contact.job_title && `${contact.job_title} · `}
              {contact.company_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/app/crm/deals/new?contact=${contact.id}`)}>
                <DollarSign className="w-4 h-4 mr-2" />
                Crear deal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openActivityModal('email')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => openActivityModal('call')}>
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar
                </Button>
                <Button variant="outline" size="sm" onClick={() => openActivityModal('note')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Nota
                </Button>
                <Button variant="outline" size="sm" onClick={() => openActivityModal('task')}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Tarea
                </Button>
                <Button variant="outline" size="sm" onClick={() => openActivityModal('meeting')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Reunión
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline 
                activities={activities} 
                isLoading={loadingActivities}
                onAddActivity={() => setShowActivityModal(true)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              {(contact.phone || contact.mobile) && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    {contact.phone && <p>{contact.phone}</p>}
                    {contact.mobile && <p className="text-muted-foreground">{contact.mobile}</p>}
                  </div>
                </div>
              )}
              {contact.company_name && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p>{contact.company_name}</p>
                    {contact.job_title && (
                      <p className="text-muted-foreground">{contact.job_title}</p>
                    )}
                  </div>
                </div>
              )}
              {(contact.city || contact.country) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">
                    {[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {contact.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <a 
                    href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {contact.website}
                  </a>
                </div>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuente</span>
                  <span>{contact.source || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Deals</CardTitle>
                {openDeals.length > 0 && (
                  <Badge variant="secondary">{openDeals.length} abiertos</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {deals.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">Sin deals asociados</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/app/crm/deals/new?contact=${contact.id}`)}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Crear deal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.slice(0, 5).map((deal) => (
                    <div 
                      key={deal.id}
                      className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/app/crm/deals/${deal.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{deal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deal.stage?.name || 'Sin etapa'}
                          </p>
                        </div>
                        {deal.value && (
                          <p className="font-medium text-sm">
                            {formatCurrency(deal.value, deal.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {deals.length > 5 && (
                    <Button variant="link" className="w-full text-sm" onClick={() => navigate(`/app/crm/deals?contact=${contact.id}`)}>
                      Ver todos ({deals.length})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <Badge key={tag} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ContactFormModal
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        contact={contact}
      />

      <AddActivityModal
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        contactId={contact.id}
        defaultType={defaultActivityType}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el contacto
              "{contact.name}" y toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
