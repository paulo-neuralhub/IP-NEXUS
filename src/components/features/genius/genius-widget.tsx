import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Send,
} from 'lucide-react';
import { AGENTS, QUICK_PROMPTS } from '@/lib/constants/genius';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function GeniusWidget() {
  const [input, setInput] = useState('');
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const navigate = useNavigate();
  
  const handleSubmit = (message: string) => {
    if (!message.trim()) return;
    // Navigate to Genius page with the message as a query param
    navigate(`/app/genius?agent=legal&message=${encodeURIComponent(message)}`);
  };
  
  return (
    <Card className="border-l-4 border-l-module-genius overflow-hidden">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">IP-GENIUS</h3>
          </div>
          <Link 
            to="/app/genius" 
            className="text-sm opacity-80 hover:opacity-100 flex items-center gap-1 transition-opacity"
          >
            Abrir chat <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <p className="text-sm opacity-90 mb-4">
          Tu asistente de IA para propiedad intelectual
        </p>
        
        {/* Quick input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowQuickPrompts(e.target.value === '');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(input)}
            placeholder="Pregunta algo..."
            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/20 backdrop-blur-sm placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white/50"
          />
          <button
            onClick={() => handleSubmit(input)}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick prompts */}
        {showQuickPrompts && (
          <div className="space-y-2">
            <p className="text-xs opacity-70">Prueba con:</p>
            {QUICK_PROMPTS.legal.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(prompt)}
                className="w-full text-left text-sm p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        )}
        
        {/* Agent shortcuts */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/20">
          {Object.entries(AGENTS).slice(0, 4).map(([key, agent]) => (
            <Link
              key={key}
              to={`/app/genius?agent=${key}`}
              className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-center"
              title={agent.name}
            >
              <span className="text-xs">{agent.name.replace('NEXUS ', '')}</span>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  );
}
