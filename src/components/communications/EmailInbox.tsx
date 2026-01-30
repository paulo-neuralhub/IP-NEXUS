// =============================================
// COMPONENTE: EmailInbox
// Bandeja de Email profesional estilo Outlook
// =============================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Mail, 
  Send, 
  Reply, 
  ReplyAll, 
  Forward,
  Paperclip,
  Trash2,
  Archive,
  Star,
  StarOff,
  MoreHorizontal,
  Search,
  Plus,
  RefreshCw,
  FileText,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fromTable } from '@/lib/supabase';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import { EmailComposer } from './EmailComposer';
import { cn } from '@/lib/utils';

interface EmailMessage {
  id: string;
  organization_id: string;
  from_email: string;
  from_name?: string | null;
  to_emails: string[];
  cc_emails?: string[] | null;
  subject: string | null;
  body_html: string | null;
  body_text?: string | null;
  body_preview?: string | null;
  status?: string | null;
  direction: string;
  contact_id?: string | null;
  matter_id?: string | null;
  thread_id?: string | null;
  attachments?: any[];
  created_at: string;
}

type FilterType = 'all' | 'unread' | 'starred' | 'sent';

export function EmailInbox() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [replyMode, setReplyMode] = useState<'reply' | 'reply-all' | 'forward' | null>(null);

  // Fetch emails
  const { data: emails = [], isLoading, refetch } = useQuery({
    queryKey: ['email-inbox', currentOrganization?.id, filter],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = fromTable('email_messages')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter === 'sent') {
        query = query.eq('direction', 'outbound');
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EmailMessage[];
    },
    enabled: !!currentOrganization?.id,
  });

  // Mark email as read - simplified since table may not have is_read field
  const handleSelectEmail = (email: EmailMessage) => {
    setSelectedEmail(email);
  };

  // Handle reply
  const handleReply = (mode: 'reply' | 'reply-all' | 'forward') => {
    setReplyMode(mode);
    setShowCompose(true);
  };

  // Delete email mutation
  const deleteEmail = useMutation({
    mutationFn: async (emailId: string) => {
      const { error } = await fromTable('email_messages')
        .delete()
        .eq('id', emailId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Email eliminado');
      setSelectedEmail(null);
      queryClient.invalidateQueries({ queryKey: ['email-inbox'] });
    },
  });

  // Filter emails by search
  const filteredEmails = emails.filter(email => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(search) ||
      email.body_preview?.toLowerCase().includes(search) ||
      email.from_email?.toLowerCase().includes(search) ||
      email.from_name?.toLowerCase().includes(search)
    );
  });

  // Get default values for composer based on reply mode
  const getComposerDefaults = () => {
    if (!selectedEmail || !replyMode) return {};
    
    if (replyMode === 'reply' || replyMode === 'reply-all') {
      return {
        defaultTo: [{ email: selectedEmail.from_email, name: selectedEmail.from_name }],
        defaultSubject: `RE: ${selectedEmail.subject}`,
        defaultBody: `<br/><br/>
          <p>---</p>
          <p><strong>De:</strong> ${selectedEmail.from_name || selectedEmail.from_email}</p>
          <p><strong>Enviado:</strong> ${format(new Date(selectedEmail.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
          <p><strong>Para:</strong> ${selectedEmail.to_emails.join(', ')}</p>
          <p><strong>Asunto:</strong> ${selectedEmail.subject}</p>
          <br/>
          ${selectedEmail.body_html}`,
      };
    } else if (replyMode === 'forward') {
      return {
        defaultTo: [],
        defaultSubject: `FW: ${selectedEmail.subject}`,
        defaultBody: `<br/><br/>
          <p>---------- Mensaje reenviado ----------</p>
          <p><strong>De:</strong> ${selectedEmail.from_name || selectedEmail.from_email}</p>
          <p><strong>Fecha:</strong> ${format(new Date(selectedEmail.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</p>
          <p><strong>Asunto:</strong> ${selectedEmail.subject}</p>
          <p><strong>Para:</strong> ${selectedEmail.to_emails.join(', ')}</p>
          <br/>
          ${selectedEmail.body_html}`,
      };
    }
    return {};
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Lista de emails */}
      <Card className="w-[400px] flex flex-col">
        <div className="p-4 space-y-3 border-b">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Bandeja de Email</h3>
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {emails.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                size="sm" 
                onClick={() => {
                  setReplyMode(null);
                  setShowCompose(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Nuevo
              </Button>
              <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-1">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'sent', label: 'Enviados' },
            ].map(f => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f.value as FilterType)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">No hay emails</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEmails.map((email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  isSelected={selectedEmail?.id === email.id}
                  onSelect={() => handleSelectEmail(email)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Panel de visualización */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <EmailViewer
            email={selectedEmail}
            onReply={() => handleReply('reply')}
            onReplyAll={() => handleReply('reply-all')}
            onForward={() => handleReply('forward')}
            onDelete={() => deleteEmail.mutate(selectedEmail.id)}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-muted-foreground font-medium">Selecciona un email</p>
              <p className="text-sm text-muted-foreground/70">para ver los detalles</p>
            </div>
          </Card>
        )}
      </div>

      {/* Compositor */}
      <EmailComposer
        open={showCompose}
        onOpenChange={(open) => {
          setShowCompose(open);
          if (!open) setReplyMode(null);
        }}
        {...getComposerDefaults()}
        onSuccess={() => {
          setShowCompose(false);
          setReplyMode(null);
          refetch();
        }}
      />
    </div>
  );
}

// Componente para cada item de la lista
interface EmailListItemProps {
  email: EmailMessage;
  isSelected: boolean;
  onSelect: () => void;
}

function EmailListItem({ email, isSelected, onSelect }: EmailListItemProps) {
  const senderName = email.direction === 'outbound' 
    ? `Para: ${email.to_emails[0]}`
    : email.from_name || email.from_email;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-3 cursor-pointer transition-colors",
        isSelected ? "bg-accent" : "hover:bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "mt-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
          email.direction === 'outbound' 
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}>
          {email.direction === 'outbound' ? (
            <Send className="w-4 h-4" />
          ) : (
            (email.from_name || email.from_email).charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm truncate font-medium">{senderName}</span>
            <div className="flex items-center gap-1">
              {email.attachments && email.attachments.length > 0 && (
                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(email.created_at), { addSuffix: false, locale: es })}
              </span>
            </div>
          </div>

          <p className="text-sm truncate mt-0.5 text-muted-foreground">
            {email.subject || '(Sin asunto)'}
          </p>

          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {email.body_preview || '[Sin contenido]'}
          </p>

          {email.direction === 'outbound' && (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-1">
              <Send className="w-2.5 h-2.5 mr-0.5" />
              Enviado
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Visor de email
interface EmailViewerProps {
  email: EmailMessage;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onDelete: () => void;
}

function EmailViewer({ 
  email, 
  onReply, 
  onReplyAll, 
  onForward,
  onDelete
}: EmailViewerProps) {
  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onReply}>
            <Reply className="w-4 h-4 mr-1" />
            Responder
          </Button>
          <Button variant="outline" size="sm" onClick={onReplyAll}>
            <ReplyAll className="w-4 h-4 mr-1" />
            Todos
          </Button>
          <Button variant="outline" size="sm" onClick={onForward}>
            <Forward className="w-4 h-4 mr-1" />
            Reenviar
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Header del email */}
      <div className="p-4 border-b space-y-3">
        <h2 className="text-xl font-semibold">{email.subject || '(Sin asunto)'}</h2>
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {(email.from_name || email.from_email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">
                {email.from_name || email.from_email}
              </p>
              <p className="text-sm text-muted-foreground">
                &lt;{email.from_email}&gt;
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>{format(new Date(email.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
            <p>{format(new Date(email.created_at), "HH:mm", { locale: es })}</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Para:</span> {email.to_emails.join(', ')}
          {email.cc_emails && email.cc_emails.length > 0 && (
            <><br/><span className="font-medium">CC:</span> {email.cc_emails.join(', ')}</>
          )}
        </div>
      </div>

      {/* Cuerpo del email */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: email.body_html }}
          />

          {/* Adjuntos */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Adjuntos ({email.attachments.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {email.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted transition-colors"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{att.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {(att.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
