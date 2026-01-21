import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { Bell, CheckCheck, MessageSquare, AlertTriangle, Calendar, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  mention: <MessageSquare className="w-4 h-4 text-primary" />,
  comment: <MessageSquare className="w-4 h-4 text-primary" />,
  deadline: <Calendar className="w-4 h-4 text-warning" />,
  alert: <AlertTriangle className="w-4 h-4 text-destructive" />,
  document: <FileText className="w-4 h-4 text-accent-foreground" />,
  system: <Bell className="w-4 h-4 text-muted-foreground" />,
};

export function NotificationBell() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id || !currentOrganization?.id) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, body, is_read, action_url, created_at')
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setNotifications((data || []) as NotificationItem[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id, currentOrganization?.id]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user?.id || !currentOrganization?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentOrganization?.id]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    if (!user?.id || !currentOrganization?.id) return;
    setIsMarkingAll(true);
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('organization_id', currentOrganization.id)
        .eq('is_read', false);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              disabled={isMarkingAll}
              className="text-xs h-7"
            >
              {isMarkingAll ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Marcar todas leídas
                </>
              )}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[350px]">
          {isLoading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    !notification.is_read && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm line-clamp-1",
                        !notification.is_read && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.body}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
