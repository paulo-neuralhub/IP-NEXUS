import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, FileText, Calendar, User, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic, useIsMobile } from '@/hooks/use-mobile';

interface FABAction {
  icon: typeof FileText;
  label: string;
  href: string;
  color: string;
}

const ACTIONS: FABAction[] = [
  { 
    icon: FileText, 
    label: 'Nuevo Expediente', 
    href: '/app/docket/new', 
    color: 'bg-blue-500 hover:bg-blue-600' 
  },
  { 
    icon: Calendar, 
    label: 'Nuevo Plazo', 
    href: '/app/docket/deadlines/new', 
    color: 'bg-amber-500 hover:bg-amber-600' 
  },
  { 
    icon: User, 
    label: 'Nuevo Contacto', 
    href: '/app/contacts/new', 
    color: 'bg-purple-500 hover:bg-purple-600' 
  },
  { 
    icon: DollarSign, 
    label: 'Nuevo Coste', 
    href: '/app/finance/costs/new', 
    color: 'bg-green-500 hover:bg-green-600' 
  },
];

interface FloatingActionButtonProps {
  className?: string;
  actions?: FABAction[];
  onMainClick?: () => void;
}

export function FloatingActionButton({ 
  className,
  actions = ACTIONS,
  onMainClick
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { lightTap, mediumTap } = useHaptic();
  const isMobile = useIsMobile();

  const toggle = () => {
    mediumTap();
    if (onMainClick && !isOpen) {
      onMainClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleAction = (href: string) => {
    lightTap();
    setIsOpen(false);
    navigate(href);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action buttons */}
      <div 
        className={cn(
          'fixed z-50 flex flex-col-reverse items-end gap-3',
          isMobile ? 'bottom-24 right-4' : 'bottom-8 right-8',
          className
        )}
      >
        {actions.map((action, index) => (
          <div
            key={action.href}
            className={cn(
              'flex items-center gap-2 transition-all duration-200 ease-out',
              isOpen
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
            )}
            style={{ 
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms' 
            }}
          >
            {/* Label */}
            <span className="bg-background px-3 py-1.5 rounded-full shadow-md text-sm font-medium whitespace-nowrap">
              {action.label}
            </span>
            
            {/* Button */}
            <button
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                'shadow-lg text-white transition-all duration-200',
                'active:scale-95',
                action.color
              )}
              onClick={() => handleAction(action.href)}
            >
              <action.icon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        className={cn(
          'fixed z-50',
          'w-14 h-14 rounded-full',
          'bg-primary text-primary-foreground',
          'flex items-center justify-center',
          'shadow-lg transition-all duration-200',
          'hover:bg-primary/90 active:scale-95',
          isOpen && 'rotate-45',
          isMobile ? 'bottom-24 right-4' : 'bottom-8 right-8',
          className
        )}
        onClick={toggle}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú de acciones'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
