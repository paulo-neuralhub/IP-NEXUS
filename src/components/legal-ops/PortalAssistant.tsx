// ============================================
// src/components/legal-ops/PortalAssistant.tsx
// Portal AI Assistant for Clients (RESTRICTED)
// ============================================

import { useState } from 'react';
import { useAssistantChat } from '@/hooks/legal-ops/useAssistantChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot, Calendar, FileText, Phone, 
  AlertCircle, ChevronRight, ArrowLeft, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined Quick Actions (NO free chat allowed)
const QUICK_ACTIONS = [
  {
    id: 'status',
    icon: FileText,
    label: '¿Cuál es el estado de mis asuntos?',
    message: 'Quiero saber el estado actual de mis asuntos en trámite'
  },
  {
    id: 'deadlines',
    icon: Calendar,
    label: '¿Qué fechas importantes tengo próximas?',
    message: 'Muéstrame los próximos vencimientos y fechas importantes'
  },
  {
    id: 'documents',
    icon: FileText,
    label: '¿Qué documentos tengo pendientes?',
    message: '¿Hay algún documento pendiente de entregar o revisar?'
  },
  {
    id: 'contact',
    icon: Phone,
    label: 'Quiero contactar con mi abogado',
    message: 'Necesito contactar con el abogado responsable de mi caso'
  }
];

interface PortalAssistantProps {
  className?: string;
  onContactRequest?: () => void;
}

export function PortalAssistant({ className, onContactRequest }: PortalAssistantProps) {
  const [showChat, setShowChat] = useState(false);
  
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearConversation 
  } = useAssistantChat({ 
    assistantType: 'portal' 
  });

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setShowChat(true);
    sendMessage.mutate(action.message);
  };

  const handleBack = () => {
    setShowChat(false);
    clearConversation();
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3 space-y-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          Asistente Virtual
        </CardTitle>
        
        {/* MANDATORY Permanent Disclaimer */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium">Información importante</p>
              <p className="mt-1">
                Este asistente proporciona información general sobre el estado de sus asuntos. 
                <strong> No proporciona asesoramiento legal.</strong> Para consultas legales, 
                contacte directamente con su abogado.
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!showChat ? (
          // Quick Actions View
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              ¿En qué puedo ayudarle?
            </p>
            
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-between h-auto py-3 px-4"
                  onClick={() => handleQuickAction(action)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-left">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </Button>
              );
            })}

            <div className="pt-4 border-t mt-4">
              <p className="text-xs text-muted-foreground text-center mb-2">
                ¿Necesita hablar con un profesional?
              </p>
              <Button 
                variant="default" 
                className="w-full"
                onClick={onContactRequest}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contactar con el despacho
              </Button>
            </div>
          </div>
        ) : (
          // Chat View (limited)
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a opciones
            </Button>
            
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={cn(
                      "p-3 rounded-lg",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground ml-8" 
                        : "bg-muted mr-8"
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="w-3 h-3" />
                        <span className="text-[10px] font-medium opacity-70">Asistente</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Show if response was blocked */}
                    {msg.blocked && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">
                          Respuesta informativa - no constituye asesoramiento legal
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Consultando...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Additional quick actions in chat */}
            <div className="flex flex-wrap gap-2 pt-3 border-t">
              {QUICK_ACTIONS.slice(0, 2).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage.mutate(action.message)}
                  disabled={isLoading}
                >
                  {action.label.length > 30 
                    ? action.label.substring(0, 30) + '...' 
                    : action.label
                  }
                </Button>
              ))}
            </div>

            {/* Contact CTA always visible */}
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full"
              onClick={onContactRequest}
            >
              <Phone className="w-3 h-3 mr-2" />
              Contactar con un profesional
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
