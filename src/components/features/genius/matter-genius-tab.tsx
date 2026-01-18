import { useState } from 'react';
import { Sparkles, FileText, MessageSquare, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GeniusChat } from '@/components/features/genius/chat';
import { DocumentGenerator } from '@/components/features/genius/document-generator';
import { useConversations, useGeneratedDocuments } from '@/hooks/use-genius';
import type { Matter } from '@/types/matters';
import { cn } from '@/lib/utils';

interface Props {
  matter: Matter;
}

export function MatterGeniusTab({ matter }: Props) {
  const [activeTab, setActiveTab] = useState<'chat' | 'generate' | 'history'>('chat');
  
  const { data: conversations } = useConversations();
  const { data: generatedDocs } = useGeneratedDocuments(matter.id);
  
  const matterConversations = conversations?.filter(c => c.matter_id === matter.id) || [];
  
  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 p-4 border-b">
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === 'chat' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <MessageSquare className="w-4 h-4" />
          Consultar IA
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === 'generate' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <FileText className="w-4 h-4" />
          Generar documento
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === 'history' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <Sparkles className="w-4 h-4" />
          Historial
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <GeniusChat
            agentType="legal"
            matterId={matter.id}
          />
        )}
        
        {activeTab === 'generate' && (
          <div className="p-4 overflow-y-auto h-full">
            <DocumentGenerator matterId={matter.id} />
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="p-4 overflow-y-auto h-full space-y-4">
            {/* Linked conversations */}
            <div>
              <h3 className="font-medium text-foreground mb-3">
                Conversaciones ({matterConversations.length})
              </h3>
              {matterConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay conversaciones vinculadas a este expediente
                </p>
              ) : (
                <div className="space-y-2">
                  {matterConversations.map(conv => (
                    <Link
                      key={conv.id}
                      to={`/app/genius?conversation=${conv.id}`}
                      className="block p-3 rounded-lg border hover:border-primary transition-colors"
                    >
                      <p className="font-medium text-sm">{conv.title || 'Sin título'}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.message_count} mensajes
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Generated documents */}
            <div>
              <h3 className="font-medium text-foreground mb-3">
                Documentos generados ({generatedDocs?.length || 0})
              </h3>
              {!generatedDocs?.length ? (
                <p className="text-sm text-muted-foreground">
                  No hay documentos generados para este expediente
                </p>
              ) : (
                <div className="space-y-2">
                  {generatedDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{doc.title}</p>
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded-full",
                          doc.status === 'draft' && "bg-muted text-muted-foreground",
                          doc.status === 'approved' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        )}>
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        v{doc.version} · {new Date(doc.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
