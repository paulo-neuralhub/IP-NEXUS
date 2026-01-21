import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { supabase } from '@/integrations/supabase/client';
import { 
  useMatterComments, 
  useCreateComment, 
  useUpdateComment, 
  useDeleteComment,
  type MatterComment 
} from '@/hooks/use-realtime-collab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MessageSquare, Send, MoreHorizontal, Edit, Trash2, Reply, Loader2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Simple org user type to avoid TS deep instantiation
type OrgUser = { id: string; full_name: string | null; avatar_url: string | null };
interface Props {
  matterId: string;
}

export function MatterComments({ matterId }: Props) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const { data: comments, isLoading } = useMatterComments(matterId);
  const createMutation = useCreateComment();
  const updateMutation = useUpdateComment();
  const deleteMutation = useDeleteComment();

  // Org users for mentions - using useState to avoid deep type issues
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  
  useEffect(() => {
    if (!currentOrganization?.id) return;
    
    // Using raw query to avoid TS deep instantiation issues
    (async () => {
      const { data } = await (supabase as any)
        .from('users')
        .select('id, full_name, avatar_url')
        .eq('organization_id', currentOrganization.id);
      setOrgUsers((data || []) as OrgUser[]);
    })();
  }, [currentOrganization?.id]);

  // Scroll to bottom on new comments
  useEffect(() => {
    if (comments?.length) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments?.length]);

  const extractMentions = (content: string): string[] => {
    const mentionMatches = content.match(/@(\w+)/g) || [];
    return mentionMatches
      .map(m => {
        const name = m.slice(1).toLowerCase();
        return orgUsers?.find(u => 
          u.full_name?.toLowerCase().includes(name)
        )?.id;
      })
      .filter(Boolean) as string[];
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    const mentions = extractMentions(newComment);
    
    createMutation.mutate({
      matterId,
      content: newComment,
      parentId: replyingTo || undefined,
      mentions,
    }, {
      onSuccess: () => {
        setNewComment('');
        setReplyingTo(null);
        toast({ title: 'Comentario añadido' });
      },
      onError: () => {
        toast({ title: 'Error al añadir comentario', variant: 'destructive' });
      },
    });
  };

  const handleEdit = () => {
    if (!editingId || !editContent.trim()) return;
    
    updateMutation.mutate({
      id: editingId,
      content: editContent,
      matterId,
    }, {
      onSuccess: () => {
        setEditingId(null);
        setEditContent('');
        toast({ title: 'Comentario editado' });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id, matterId }, {
      onSuccess: () => {
        toast({ title: 'Comentario eliminado' });
      },
    });
  };

  const renderComment = (comment: MatterComment, isReply = false) => (
    <div 
      key={comment.id}
      className={cn(
        "flex gap-3 animate-fade-in",
        isReply && "ml-10 mt-3"
      )}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={comment.user?.avatar_url || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {comment.user?.full_name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">
            {comment.user?.full_name || 'Usuario'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
          </span>
          {comment.is_edited && (
            <span className="text-xs text-muted-foreground italic">(editado)</span>
          )}
        </div>

        {editingId === comment.id ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Guardar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditContent(''); }}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm mt-1 whitespace-pre-wrap text-foreground/90">
            {comment.content}
          </p>
        )}

        {!isReply && !editingId && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setReplyingTo(comment.id)}
            >
              <Reply className="w-3 h-3 mr-1" />
              Responder
            </Button>
          </div>
        )}

        {/* Replies */}
        {comment.replies?.filter(r => !r.is_deleted).map(reply => 
          renderComment(reply, true)
        )}

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="mt-3 ml-10 flex gap-2 animate-fade-in">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={2}
              className="flex-1 text-sm"
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <Button 
                size="icon" 
                className="h-8 w-8"
                onClick={handleSubmit}
                disabled={createMutation.isPending || !newComment.trim()}
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                className="h-8 w-8"
                onClick={() => { setReplyingTo(null); setNewComment(''); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {comment.user_id === user?.id && !editingId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(comment.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Comentarios
          {comments?.length ? (
            <span className="text-muted-foreground font-normal text-sm">
              ({comments.length})
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[350px] pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay comentarios</p>
              <p className="text-sm">Sé el primero en comentar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments?.map(comment => (
                <div key={comment.id} className="group">
                  {renderComment(comment)}
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* New comment input */}
        {!replyingTo && (
          <div className="flex gap-2 pt-3 border-t">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario... (usa @ para mencionar)"
              rows={2}
              className="flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit();
                }
              }}
            />
            <Button 
              onClick={handleSubmit}
              disabled={!newComment.trim() || createMutation.isPending}
              className="self-end"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Cmd/Ctrl + Enter para enviar
        </p>
      </CardContent>
    </Card>
  );
}
