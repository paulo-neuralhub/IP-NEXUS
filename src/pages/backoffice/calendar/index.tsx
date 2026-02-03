/**
 * IP-NEXUS Backoffice - Calendar & Booking Management
 * Availability settings and meeting bookings
 * USES REAL DATA from useCalendarBookings
 */

import { useState } from 'react';
import { 
  Calendar, Clock, Video, Users, Plus, 
  MoreHorizontal, ExternalLink, Copy, Check, Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCalendarBookings, useCalendarStats } from '@/hooks/use-calendar-bookings';

const MEETING_TYPES = [
  {
    id: 'demo',
    name: 'Demo Comercial',
    duration: 60,
    color: 'hsl(var(--primary))',
    description: 'Demostración de IP-NEXUS para potenciales clientes',
    enabled: true
  },
  {
    id: 'consultation',
    name: 'Consulta Inicial',
    duration: 30,
    color: 'hsl(var(--module-genius))',
    description: 'Consulta rápida para resolver dudas',
    enabled: true
  },
  {
    id: 'onboarding',
    name: 'Onboarding',
    duration: 60,
    color: 'hsl(var(--success))',
    description: 'Sesión de configuración para nuevos clientes',
    enabled: true
  },
  {
    id: 'support',
    name: 'Soporte Técnico',
    duration: 30,
    color: 'hsl(var(--module-spider))',
    description: 'Resolución de incidencias técnicas',
    enabled: false
  }
];

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function BackofficeCalendarPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Use real data hooks
  const { data: bookings = [], isLoading: loadingBookings } = useCalendarBookings();
  const { data: stats, isLoading: loadingStats } = useCalendarStats();

  const bookingUrl = 'https://ip-nexus.com/book/team';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast({ title: 'Link copiado al portapapeles' });
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Confirmada</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-warning">Pendiente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    const meetingType = MEETING_TYPES.find(t => t.id === type);
    return meetingType?.color || 'hsl(var(--muted))';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendario & Reservas</h1>
          <p className="text-muted-foreground">
            Gestiona tu disponibilidad y reuniones
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copiar link de reserva
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Bloquear tiempo
          </Button>
        </div>
      </div>

      {/* Quick Stats - Real data */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                {loadingStats ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.thisWeek ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Reuniones esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div>
                {loadingStats ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.confirmed ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Confirmadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                {loadingStats ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.pending ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-module-genius/10">
                <Video className="w-5 h-5 text-module-genius" />
              </div>
              <div>
                {loadingStats ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.thisMonth ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Total este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Próximas reuniones</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          <TabsTrigger value="types">Tipos de reunión</TabsTrigger>
        </TabsList>

        {/* Upcoming Meetings - Real data */}
        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Inbox className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">Sin reuniones programadas</h3>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Las próximas reuniones aparecerán aquí cuando se agenden
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Time indicator */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold">{booking.time}</p>
                      <p className="text-xs text-muted-foreground">{booking.duration} min</p>
                    </div>

                    {/* Color bar */}
                    <div 
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: getTypeColor(booking.type) }}
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{booking.title}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {booking.attendee} · {booking.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(booking.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4 mr-1" />
                        Unirse
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Availability Settings */}
        <TabsContent value="availability" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Horario de disponibilidad</CardTitle>
              <CardDescription>
                Configura las horas en las que estás disponible para reuniones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {WEEKDAYS.slice(0, 5).map((day, index) => (
                <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="w-24">
                    <Switch defaultChecked={index < 5} />
                  </div>
                  <span className="w-24 font-medium">{day}</span>
                  <Select defaultValue="09:00">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['08:00', '09:00', '10:00', '11:00'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>a</span>
                  <Select defaultValue="18:00">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['17:00', '18:00', '19:00', '20:00'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tiempo buffer entre reuniones</Label>
                    <p className="text-sm text-muted-foreground">Tiempo de descanso entre reuniones</p>
                  </div>
                  <Select defaultValue="15">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin buffer</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Límite diario de reuniones</Label>
                    <p className="text-sm text-muted-foreground">Máximo de reuniones por día</p>
                  </div>
                  <Select defaultValue="8">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 reuniones</SelectItem>
                      <SelectItem value="6">6 reuniones</SelectItem>
                      <SelectItem value="8">8 reuniones</SelectItem>
                      <SelectItem value="10">10 reuniones</SelectItem>
                      <SelectItem value="0">Sin límite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="mt-4">Guardar cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meeting Types */}
        <TabsContent value="types" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {MEETING_TYPES.map((type) => (
              <Card key={type.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-3 h-12 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{type.name}</h3>
                          <Badge variant="outline">{type.duration} min</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <Switch checked={type.enabled} />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add new type */}
            <Card className="border-dashed">
              <CardContent className="p-4 flex items-center justify-center h-full min-h-[100px]">
                <Button variant="ghost">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir tipo de reunión
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Widget Preview */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Widget de reserva
          </CardTitle>
          <CardDescription>
            Comparte este link para que puedan agendar reuniones contigo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={bookingUrl} readOnly className="flex-1" />
            <Button variant="outline" onClick={handleCopyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
