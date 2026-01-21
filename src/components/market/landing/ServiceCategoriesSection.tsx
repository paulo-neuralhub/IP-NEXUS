import { Link } from 'react-router-dom';
import { Tag, FileText, PenTool, Gavel, Key, DollarSign, Globe, HelpCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: 'trademark', label: 'Marcas', icon: Tag, color: 'bg-pink-100 text-pink-600' },
  { key: 'patent', label: 'Patentes', icon: FileText, color: 'bg-indigo-100 text-indigo-600' },
  { key: 'design', label: 'Diseños', icon: PenTool, color: 'bg-violet-100 text-violet-600' },
  { key: 'litigation', label: 'Litigios', icon: Gavel, color: 'bg-red-100 text-red-600' },
  { key: 'licensing', label: 'Licencias', icon: Key, color: 'bg-amber-100 text-amber-600' },
  { key: 'valuation', label: 'Valoración', icon: DollarSign, color: 'bg-green-100 text-green-600' },
  { key: 'domain', label: 'Dominios', icon: Globe, color: 'bg-cyan-100 text-cyan-600' },
  { key: 'general', label: 'Consultoría', icon: HelpCircle, color: 'bg-gray-100 text-gray-600' },
];

export function ServiceCategoriesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary">Servicios disponibles</h2>
          <p className="text-muted-foreground mt-2">Encuentra profesionales para cualquier necesidad de PI</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={`/market/agents?category=${cat.key}`}
              className="group bg-card rounded-2xl border p-6 text-center hover:shadow-lg hover:border-market/30 transition-all"
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto",
                cat.color
              )}>
                <cat.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-secondary mt-4 group-hover:text-market transition-colors">
                {cat.label}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
