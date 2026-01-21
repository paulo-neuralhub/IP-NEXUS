import { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock,
  TestTube,
  Loader2
} from 'lucide-react';
import { 
  useNotificationPreferences,
  useUpdateNotificationPreferences 
} from '@/hooks/use-notifications';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationsSettings() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  
  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading: pushLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();
  
  const [formData, setFormData] = useState({
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    deadline_reminders: true,
    deadline_reminder_days: [7, 3, 1],
    renewal_reminders: true,
    renewal_reminder_days: [90, 60, 30],
    watch_alerts: true,
    invoice_notifications: true,
    team_notifications: true,
    marketing_notifications: false,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });
  
  useEffect(() => {
    if (preferences) {
      setFormData({
        email_enabled: preferences.email_enabled,
        push_enabled: preferences.push_enabled,
        in_app_enabled: preferences.in_app_enabled,
        deadline_reminders: preferences.deadline_reminders,
        deadline_reminder_days: preferences.deadline_reminder_days,
        renewal_reminders: preferences.renewal_reminders,
        renewal_reminder_days: preferences.renewal_reminder_days,
        watch_alerts: preferences.watch_alerts,
        invoice_notifications: preferences.invoice_notifications,
        team_notifications: preferences.team_notifications,
        marketing_notifications: preferences.marketing_notifications,
        quiet_hours_enabled: preferences.quiet_hours_enabled,
        quiet_hours_start: preferences.quiet_hours_start,
        quiet_hours_end: preferences.quiet_hours_end,
      });
    }
  }, [preferences]);
  
  const handleToggle = (key: keyof typeof formData) => {
    const newValue = !formData[key];
    setFormData({ ...formData, [key]: newValue });
    updateMutation.mutate({ [key]: newValue } as any);
  };
  
  const handleEnablePush = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Permiso denegado');
        return;
      }
    }
    
    const success = await subscribe();
    if (success) {
      toast.success('Notificaciones push activadas');
    } else {
      toast.error('Error al activar notificaciones');
    }
  };
  
  const handleDisablePush = async () => {
    await unsubscribe();
    toast.success('Notificaciones push desactivadas');
  };
  
  const handleTestPush = async () => {
    await sendTestNotification();
    toast.success('Notificación de prueba enviada');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Notificaciones</h2>
        <p className="text-muted-foreground">Configura cómo y cuándo recibir notificaciones</p>
      </div>
      
      {/* Canales */}
      <Section title="Canales de notificación" icon={Bell}>
        <ToggleRow
          label="Email"
          description="Recibir notificaciones por correo electrónico"
          icon={Mail}
          checked={formData.email_enabled}
          onChange={() => handleToggle('email_enabled')}
        />
        
        <ToggleRow
          label="Push (navegador/móvil)"
          description={
            !isSupported 
              ? 'No soportado en este dispositivo'
              : permission === 'denied'
              ? 'Permiso denegado en el navegador'
              : isSubscribed
              ? 'Activo'
              : 'Desactivado'
          }
          icon={Smartphone}
          checked={isSubscribed}
          onChange={isSubscribed ? handleDisablePush : handleEnablePush}
          disabled={!isSupported || permission === 'denied'}
          loading={pushLoading}
        />
        
        {isSubscribed && (
          <div className="pl-12 pb-4">
            <button
              onClick={handleTestPush}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <TestTube className="w-4 h-4" /> Enviar notificación de prueba
            </button>
          </div>
        )}
        
        <ToggleRow
          label="In-app"
          description="Mostrar notificaciones dentro de la aplicación"
          icon={Bell}
          checked={formData.in_app_enabled}
          onChange={() => handleToggle('in_app_enabled')}
        />
      </Section>
      
      {/* Tipos */}
      <Section title="Tipos de notificación" icon={Bell}>
        <ToggleRow
          label="Recordatorios de plazos"
          description={`${formData.deadline_reminder_days.join(', ')} días antes`}
          checked={formData.deadline_reminders}
          onChange={() => handleToggle('deadline_reminders')}
        />
        
        <ToggleRow
          label="Recordatorios de renovación"
          description={`${formData.renewal_reminder_days.join(', ')} días antes`}
          checked={formData.renewal_reminders}
          onChange={() => handleToggle('renewal_reminders')}
        />
        
        <ToggleRow
          label="Alertas de vigilancia"
          description="Nuevas marcas similares detectadas"
          checked={formData.watch_alerts}
          onChange={() => handleToggle('watch_alerts')}
        />
        
        <ToggleRow
          label="Facturas"
          description="Nuevas facturas y pagos recibidos"
          checked={formData.invoice_notifications}
          onChange={() => handleToggle('invoice_notifications')}
        />
        
        <ToggleRow
          label="Equipo"
          description="Invitaciones y cambios en el equipo"
          checked={formData.team_notifications}
          onChange={() => handleToggle('team_notifications')}
        />
        
        <ToggleRow
          label="Marketing"
          description="Novedades, ofertas y actualizaciones"
          checked={formData.marketing_notifications}
          onChange={() => handleToggle('marketing_notifications')}
        />
      </Section>
      
      {/* Horario silencioso */}
      <Section title="Horario silencioso" icon={Clock}>
        <ToggleRow
          label="Activar horario silencioso"
          description="No recibir notificaciones push durante este horario"
          checked={formData.quiet_hours_enabled}
          onChange={() => handleToggle('quiet_hours_enabled')}
        />
        
        {formData.quiet_hours_enabled && (
          <div className="pl-12 pb-4 flex items-center gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Desde</label>
              <input
                type="time"
                value={formData.quiet_hours_start}
                onChange={(e) => {
                  setFormData({ ...formData, quiet_hours_start: e.target.value });
                  updateMutation.mutate({ quiet_hours_start: e.target.value });
                }}
                className="block mt-1 border rounded px-2 py-1 bg-background"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Hasta</label>
              <input
                type="time"
                value={formData.quiet_hours_end}
                onChange={(e) => {
                  setFormData({ ...formData, quiet_hours_end: e.target.value });
                  updateMutation.mutate({ quiet_hours_end: e.target.value });
                }}
                className="block mt-1 border rounded px-2 py-1 bg-background"
              />
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border">
      <div className="p-4 border-b flex items-center gap-2">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y">
        {children}
      </div>
    </div>
  );
}

function ToggleRow({ 
  label, 
  description, 
  icon: Icon,
  checked, 
  onChange,
  disabled,
  loading
}: { 
  label: string;
  description: string;
  icon?: React.ElementType;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mt-0.5">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      <button
        onClick={onChange}
        disabled={disabled || loading}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
          (disabled || loading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <span 
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 bg-background rounded-full shadow transition-transform",
            checked && "translate-x-5"
          )}
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin m-1 text-muted-foreground" />}
        </span>
      </button>
    </div>
  );
}
