import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tag, FileText, PenTool, Gavel, Key, DollarSign, Globe, HelpCircle, LucideIcon } from 'lucide-react';

interface ServiceCategory {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: 'trademark', label: 'Marcas', icon: Tag, color: '#7C3AED', bg: '#EDE9FE' },
  { key: 'patent', label: 'Patentes', icon: FileText, color: '#6366F1', bg: '#E0E7FF' },
  { key: 'design', label: 'Diseños', icon: PenTool, color: '#EC4899', bg: '#FCE7F3' },
  { key: 'litigation', label: 'Litigios', icon: Gavel, color: '#EF4444', bg: '#FEE2E2' },
  { key: 'licensing', label: 'Licencias', icon: Key, color: '#F59E0B', bg: '#FEF3C7' },
  { key: 'valuation', label: 'Valoración', icon: DollarSign, color: '#10B981', bg: '#D1FAE5' },
  { key: 'domain', label: 'Dominios', icon: Globe, color: '#8B5CF6', bg: '#EDE9FE' },
  { key: 'general', label: 'Consultoría', icon: HelpCircle, color: '#6B7280', bg: '#F3F4F6' },
];

export function ServiceCategoriesSection() {
  return (
    <section className="py-20" style={{ background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
            Servicios disponibles
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', marginTop: '8px' }}>
            Encuentra profesionales para cualquier necesidad de PI
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={`/market/agents?category=${cat.key}`}
              className="group rounded-2xl p-6 text-center transition-all hover:scale-[1.02] no-underline"
              style={{ 
                background: '#FAFAFE',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                borderRadius: '16px',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: cat.bg }}>
                <cat.icon className="w-7 h-7" style={{ color: cat.color }} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1B4B', marginTop: '14px' }}
                className="group-hover:text-violet-600 transition-colors">
                {cat.label}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
