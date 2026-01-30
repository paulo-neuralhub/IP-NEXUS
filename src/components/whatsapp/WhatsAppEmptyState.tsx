/**
 * WhatsApp Empty State Component
 */

import { MessageCircle, ArrowLeft } from 'lucide-react';

export function WhatsAppEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/20">
      <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
        <MessageCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">
        Bandeja de WhatsApp
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-6">
        Selecciona una conversación de la lista para ver los mensajes 
        o espera a que lleguen nuevos mensajes.
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        <span>Elige una conversación para comenzar</span>
      </div>
    </div>
  );
}
