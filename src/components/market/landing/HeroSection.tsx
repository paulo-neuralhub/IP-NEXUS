import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag, FileText, PenTool, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const QUICK_CATEGORIES = [
  { key: 'trademark', label: 'Marcas', icon: Tag },
  { key: 'patent', label: 'Patentes', icon: FileText },
  { key: 'design', label: 'Diseños', icon: PenTool },
  { key: 'litigation', label: 'Litigios', icon: Gavel },
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-market/5 via-purple-50 to-background" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-market/10 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            🚀 La plataforma líder de servicios de PI
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-secondary leading-tight">
            El Marketplace de{' '}
            <span className="text-market">Propiedad Intelectual</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mt-6 max-w-2xl">
            Conectamos empresas con los mejores profesionales de PI. 
            Solicita presupuestos, compara y contrata con total confianza.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 flex gap-3">
            <div className="flex-1 relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="¿Qué servicio necesitas? Ej: Registro marca España..."
                className="pl-12 h-14 text-lg rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-14 px-8 rounded-xl bg-market hover:bg-market/90" asChild>
              <Link to={`/app/market/rfq/new${searchQuery ? `?q=${searchQuery}` : ''}`}>
                Solicitar presupuesto
              </Link>
            </Button>
          </div>
          
          {/* Quick Categories */}
          <div className="flex flex-wrap gap-2 mt-6">
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                to={`/market/agents?category=${cat.key}`}
                className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border hover:border-market hover:shadow-md transition-all"
              >
                <cat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
