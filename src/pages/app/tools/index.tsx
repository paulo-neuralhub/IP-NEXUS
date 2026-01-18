import { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Eye, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { OCRProcessor } from '@/components/features/ocr/ocr-processor';
import { TrademarkComparator } from '@/components/features/vision/trademark-comparator';
import { cn } from '@/lib/utils';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: typeof Shield;
  color: string;
  href?: string;
  component?: React.ComponentType;
}

const TOOLS: Tool[] = [
  {
    id: 'ip-chain',
    name: 'IP-CHAIN',
    description: 'Timestamping blockchain para prueba de existencia',
    icon: Shield,
    color: '#8B5CF6',
    href: '/app/ip-chain',
  },
  {
    id: 'ocr',
    name: 'OCR',
    description: 'Extrae texto de imágenes y documentos escaneados',
    icon: FileText,
    color: '#3B82F6',
    component: OCRProcessor,
  },
  {
    id: 'vision',
    name: 'Comparador Visual',
    description: 'Analiza similitud visual de marcas gráficas',
    icon: Eye,
    color: '#EC4899',
    component: TrademarkComparator,
  },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  const ActiveComponent = TOOLS.find(t => t.id === activeTool)?.component;
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          Herramientas Avanzadas
        </h1>
        <p className="text-muted-foreground">
          Potencia tu gestión de PI con tecnologías avanzadas
        </p>
      </div>
      
      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          if (tool.href) {
            return (
              <Link
                key={tool.id}
                to={tool.href}
                className="bg-card rounded-xl border p-4 hover:border-muted-foreground/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${tool.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tool.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          }
          
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(isActive ? null : tool.id)}
              className={cn(
                "bg-card rounded-xl border p-4 text-left transition-all",
                isActive ? "border-primary ring-2 ring-primary/20" : "hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: tool.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Active Tool */}
      {ActiveComponent && (
        <div className="bg-card rounded-xl border p-6">
          <ActiveComponent />
        </div>
      )}
    </div>
  );
}
