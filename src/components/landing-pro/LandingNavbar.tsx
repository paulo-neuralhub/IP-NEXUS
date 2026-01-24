import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LandingNavbarProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  moduleName: string;
  logo?: React.ReactNode;
}

const MODULE_ACCENTS = {
  spider: 'hover:text-indigo-500',
  market: 'hover:text-teal-500',
  docket: 'hover:text-blue-500',
  nexus: 'hover:text-blue-600',
};

export function LandingNavbar({ moduleCode, moduleName, logo }: LandingNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const accentClass = MODULE_ACCENTS[moduleCode];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to={`/${moduleCode}`} className="flex items-center gap-2">
            {logo || (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            )}
            <span className={cn(
              'text-xl font-bold transition-colors',
              isScrolled ? 'text-slate-900' : 'text-white'
            )}>
              IP-{moduleName.toUpperCase()}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {['Features', 'Precios', 'Integraciones', 'Recursos'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white',
                  accentClass
                )}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              variant="ghost"
              asChild
              className={cn(
                'font-medium',
                isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'
              )}
            >
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              <Link to="/register">Probar gratis</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            )}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            {['Features', 'Precios', 'Integraciones', 'Recursos'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <hr className="my-2 border-slate-200" />
            <Link
              to="/login"
              className="px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium text-center"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-center"
            >
              Probar gratis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
