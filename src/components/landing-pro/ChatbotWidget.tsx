import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatbotWidgetProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
}

const MODULE_COLORS = {
  spider: 'bg-indigo-600 hover:bg-indigo-700',
  market: 'bg-teal-600 hover:bg-teal-700',
  docket: 'bg-blue-600 hover:bg-blue-700',
  nexus: 'bg-blue-700 hover:bg-blue-800',
};

export function ChatbotWidget({ moduleCode }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className={cn(
            'px-6 py-4 text-white',
            MODULE_COLORS[moduleCode]
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">¿Necesitas ayuda?</h3>
                <p className="text-sm text-white/80">Estamos aquí para ayudarte</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="h-80 p-4 overflow-y-auto bg-slate-50">
            {/* Welcome Message */}
            <div className="flex gap-3 mb-4">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                MODULE_COLORS[moduleCode]
              )}>
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
                <p className="text-sm text-slate-700">
                  ¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?
                </p>
                <div className="mt-3 space-y-2">
                  {['Ver demo', 'Precios', 'Soporte técnico'].map((option) => (
                    <button
                      key={option}
                      className="block w-full text-left text-sm px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMessage('');
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                className={MODULE_COLORS[moduleCode]}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-white z-50 transition-all duration-200 hover:scale-110',
          MODULE_COLORS[moduleCode],
          'shadow-lg'
        )}
        style={{
          boxShadow: '0 10px 25px -5px rgba(30, 64, 175, 0.4)',
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
