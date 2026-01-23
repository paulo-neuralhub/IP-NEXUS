import { useCommunication, useToggleStar, useArchiveCommunication } from '@/hooks/legal-ops/useCommunications';
import { useAIClassification } from '@/hooks/legal-ops/useAIClassification';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Reply, Forward, Archive, Trash2, Star, MoreHorizontal,
  Link2, Bot, FileText, Play, Pause, Volume2, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AIClassificationBadge } from './AIClassificationBadge';
import { CommCategory, COMM_CATEGORIES } from '@/types/legal-ops';
import { useState } from 'react';

interface CommunicationDetailProps {
  communicationId: string;
}

export function CommunicationDetail({ communicationId }: CommunicationDetailProps) {
  const { data: comm, isLoading } = useCommunication(communicationId);
  const { reclassifyWithFeedback } = useAIClassification();
  const toggleStar = useToggleStar();
  const archive = useArchiveCommunication();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!comm) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Comunicación no encontrada</div>
      </Card>
    );
  }

  const effectiveCategory = comm.manual_category || comm.ai_category;

  const handleReclassify = (newCategory: CommCategory) => {
    reclassifyWithFeedback.mutate({
      communicationId: comm.id,
      correctCategory: newCategory
    });
  };

  const handleToggleStar = () => {
    toggleStar.mutate({ id: comm.id, is_starred: !comm.is_starred });
  };

  const handleArchive = () => {
    archive.mutate(comm.id);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header con acciones */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Reply className="w-4 h-4 mr-1" />
              Responder
            </Button>
            <Button variant="outline" size="sm">
              <Forward className="w-4 h-4 mr-1" />
              Reenviar
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleToggleStar}
            >
              <Star className={`w-4 h-4 ${comm.is_starred ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleArchive}
            >
              <Archive className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link2 className="w-4 h-4 mr-2" />
                  Vincular a asunto
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Crear tarea
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info del mensaje */}
        <div className="mt-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {comm.subject || '[Sin asunto]'}
              </h2>
              <p className="text-sm text-muted-foreground">
                De: {comm.email_from || comm.whatsapp_from || 'Desconocido'}
              </p>
              {comm.email_to && comm.email_to.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Para: {comm.email_to.join(', ')}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(comm.received_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
              </p>
            </div>

            {/* Clasificación con dropdown para cambiar */}
            <div className="flex items-center gap-2">
              {effectiveCategory && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">
                      <AIClassificationBadge
                        category={effectiveCategory}
                        confidence={comm.ai_confidence}
                        isManual={!!comm.manual_category}
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      Cambiar clasificación
                    </div>
                    <DropdownMenuSeparator />
                    {(Object.keys(COMM_CATEGORIES) as CommCategory[]).map(cat => (
                      <DropdownMenuItem 
                        key={cat}
                        onClick={() => handleReclassify(cat)}
                        disabled={cat === effectiveCategory}
                      >
                        {cat === effectiveCategory && '✓ '}
                        {COMM_CATEGORIES[cat]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Contenido del mensaje */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            {/* Disclaimer de IA si hay clasificación automática */}
            {comm.ai_category && !comm.manual_category && (
                 <div className="mb-4 p-3 bg-muted border border-border rounded-lg">
                <div className="flex items-start gap-2">
                    <Bot className="w-4 h-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                    Este mensaje ha sido clasificado automáticamente por IA. 
                    La clasificación es una sugerencia y puede contener errores. 
                    Puede cambiarla usando el menú de clasificación.
                  </p>
                </div>
              </div>
            )}

            {/* Transcripción de audio (si aplica) */}
            {comm.transcription && (
              <div className="mb-4 p-4 bg-slate-50 rounded-lg dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Transcripción de audio</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {(comm.transcription as { transcription_text?: string })?.transcription_text || 'Sin transcripción disponible'}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Transcripción generada por IA. Puede contener errores.
                </p>
              </div>
            )}

            {/* Cuerpo del mensaje */}
            {comm.body_html ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: comm.body_html }}
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm">
                {comm.body || '[Sin contenido]'}
              </div>
            )}

            {/* Adjuntos */}
            {comm.attachments && comm.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">
                  Adjuntos ({comm.attachments.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {comm.attachments.map((att, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2 p-2 border rounded hover:bg-muted cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{att.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(att.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
