// ============================================================
// IP-NEXUS APP - HELP CENTER HOME (Enterprise redesign v2)
// Dark hero, getting started banner, improved cards, popular
// guides, support CTA
// ============================================================

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, ChevronRight,
  BookOpen, Zap, Settings, CreditCard, Shield, Users,
  Database, Target, Brain, TrendingUp, Mail, HelpCircle,
  Keyboard, BookMarked, FileText, Headphones, Rocket,
  Clock, Briefcase, Plug, Wrench, Receipt,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  HELP_CATEGORIES,
  getAllUnifiedArticles,
  getUnifiedArticlesByCategory,
  searchUnifiedArticles,
  getFeaturedUnifiedArticles,
  type UnifiedArticle,
} from '@/lib/helpUnifiedArticles';

// ── Icon map (extended for all categories) ──
const iconMap: Record<string, LucideIcon> = {
  'book-open': BookOpen, 'zap': Zap, 'settings': Settings,
  'credit-card': CreditCard, 'shield': Shield, 'users': Users,
  'database': Database, 'target': Target, 'brain': Brain,
  'trending-up': TrendingUp, 'mail': Mail, 'help-circle': HelpCircle,
  'rocket': Rocket, 'briefcase': Briefcase, 'clock': Clock,
  'file-text': FileText, 'receipt': Receipt, 'plug': Plug, 'wrench': Wrench,
};

// ── Article type badges ──
const typeBadge: Record<string, string> = {
  guide: 'Guía', tutorial: 'Tutorial', faq: 'FAQ',
  troubleshooting: 'Solución', reference: 'Referencia',
};

// ── Quick tags for search ──
const QUICK_TAGS = [
  'Crear expediente', 'Importar datos', 'Plazos', 'Alertas', 'Facturación',
];

// ── Popular guides config ──
const POPULAR_GUIDES = [
  { slug: 'crear-expediente', icon: BookOpen, color: '#0EA5E9' },
  { slug: 'plazos-vencimientos', icon: Clock, color: '#F59E0B' },
  { slug: 'que-es-genius', icon: Brain, color: '#F59E0B' },
  { slug: 'introduccion-crm', icon: Users, color: '#10B981' },
  { slug: 'importar-expedientes', icon: Database, color: '#3B82F6' },
  { slug: 'no-acceso', icon: Wrench, color: '#EF4444' },
];

export default function HelpCenterIndex() {
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length >= 2;

  const searchResults = useMemo(
    () => (isSearching ? searchUnifiedArticles(searchQuery) : []),
    [searchQuery, isSearching],
  );

  const featured = useMemo(() => getFeaturedUnifiedArticles(), []);

  // Resolve popular guides from unified source
  const allUnified = useMemo(() => getAllUnifiedArticles(), []);

  const popularGuides = useMemo(() =>
    POPULAR_GUIDES.map(pg => {
      const article = allUnified.find(a => a.slug === pg.slug);
      return article ? { ...article, iconComponent: pg.icon, accentColor: pg.color } : null;
    }).filter(Boolean) as (UnifiedArticle & { iconComponent: LucideIcon; accentColor: string })[],
  [allUnified]);
  return (
    <div className="space-y-8 -mt-2">
      {/* ═══ HERO — Dark gradient ═══ */}
      <section
        className="relative overflow-hidden rounded-2xl px-8 py-12"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)' }}
      >
        {/* Decorative radial accents */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 25% 50%, rgba(14,165,233,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 75% 50%, rgba(139,92,246,0.05) 0%, transparent 50%)`,
        }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
            ¿En qué podemos <span className="text-[#22d3ee]">ayudarte</span>?
          </h1>
          <p className="text-sm text-white/50 mb-6">
            Busca en nuestra base de conocimiento o explora las categorías
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3.5 focus-within:bg-white/15 focus-within:border-white/20 transition-all">
              <Search className="w-5 h-5 text-white/40 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar artículos, guías, preguntas frecuentes..."
                className="flex-1 bg-transparent text-white text-base placeholder:text-white/30 outline-none"
              />
              <kbd className="hidden sm:flex px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/30">⌘K</kbd>
            </div>
          </div>

          {/* Quick tags */}
          {!isSearching && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ SEARCH RESULTS ═══ */}
      {isSearching && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Resultados para &ldquo;{searchQuery}&rdquo;
          </h3>
          {searchResults.length === 0 ? (
            <div className="text-center py-10 bg-muted/30 rounded-xl border border-border">
              <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No encontramos artículos para tu búsqueda.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Intenta con otros términos o{' '}
                <Link to="/app/help/tickets/new" className="text-primary hover:underline">contacta con soporte</Link>.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {searchResults.map((a) => (
                <UnifiedArticleCard key={a.slug} article={a} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      {!isSearching && (
        <>
          {/* ── Getting Started Banner ── */}
          <Link
            to="/app/help/category/getting-started"
            className="group flex items-center gap-5 p-5 rounded-2xl bg-card border border-border hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#2563eb] flex items-center justify-center shadow-lg flex-shrink-0">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground">¿Nuevo en IP-NEXUS?</h3>
              <p className="text-sm text-muted-foreground">Guía de inicio rápido en 5 minutos. Te enseñamos lo esencial.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </Link>

          {/* ── Getting Started Cards ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground">Primeros pasos</h3>
              <Link to="/app/help/category/getting-started" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todo <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {getUnifiedArticlesByCategory('getting-started').slice(0, 6).map((a, i) => (
                <GettingStartedCard key={a.slug} article={a} step={i + 1} />
              ))}
            </div>
          </section>

          {/* ── Category Grid ── */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-5">Explorar por categoría</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {HELP_CATEGORIES.map((cat) => {
                const count = getUnifiedArticlesByCategory(cat.slug).length;
                const Icon = iconMap[cat.icon] || HelpCircle;
                return (
                  <Link
                    key={cat.slug}
                    to={`/app/help/category/${cat.slug}`}
                    className="group block"
                  >
                    <div className="p-5 rounded-2xl bg-card border border-border hover:border-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${cat.color}12` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">{cat.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{cat.description}</p>
                      <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: cat.color }}>
                        {count} {count === 1 ? 'artículo' : 'artículos'}
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Popular Guides ── */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Guías más populares</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {popularGuides.map((guide) => {
                const GIcon = guide.iconComponent;
                return (
                  <Link
                    key={guide.slug}
                    to={`/app/help/article/${guide.slug}`}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all"
                  >
                    <GIcon className="w-5 h-5 flex-shrink-0" style={{ color: guide.accentColor }} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{guide.title}</h4>
                      <span className="text-[10px] text-muted-foreground">{guide.readTime} de lectura</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ── Quick Links Row ── */}
          <section className="grid gap-4 md:grid-cols-3">
            <Link to="/app/help/glossary" className="group">
              <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center flex-shrink-0">
                  <BookMarked className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Glosario de PI</h4>
                  <p className="text-sm text-muted-foreground">Términos y definiciones</p>
                </div>
              </div>
            </Link>
            <Link to="/app/help/shortcuts" className="group">
              <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                  <Keyboard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Atajos de teclado</h4>
                  <p className="text-sm text-muted-foreground">Trabaja más rápido</p>
                </div>
              </div>
            </Link>
            <Link to="/app/help/tickets" className="group">
              <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Mis Tickets</h4>
                  <p className="text-sm text-muted-foreground">Consulta tus solicitudes</p>
                </div>
              </div>
            </Link>
          </section>

          {/* ═══ SUPPORT CTA ═══ */}
          <section>
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)' }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                <Headphones className="w-6 h-6 text-[#22d3ee]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">¿No encuentras lo que buscas?</h3>
              <p className="text-sm text-white/40 mb-5 max-w-sm mx-auto">
                Nuestro equipo está disponible para ayudarte.
              </p>
              <Link
                to="/app/help/tickets/new"
                className="inline-flex px-6 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-800 hover:bg-slate-50 transition-colors"
              >
                Contactar soporte
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ── Sub-components ──

function GettingStartedCard({ article, step }: { article: UnifiedArticle; step: number }) {
  return (
    <Link to={`/app/help/article/${article.slug}`} className="group block">
      <div className="relative p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-md transition-all h-full">
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{step}</span>
        </div>
        <div className="mb-3">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 pr-10">
          {article.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {article.articleType && <Badge variant="outline" className="text-[10px]">{typeBadge[article.articleType] || 'Guía'}</Badge>}
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  );
}

function UnifiedArticleCard({ article }: { article: UnifiedArticle }) {
  const cat = HELP_CATEGORIES.find(c => c.slug === article.categorySlug);

  return (
    <Link to={`/app/help/article/${article.slug}`} className="group block">
      <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all h-full">
        <div className="flex items-center gap-2 mb-3">
          {article.articleType && (
            <Badge variant="outline" className="text-[10px]">
              {typeBadge[article.articleType] || 'Guía'}
            </Badge>
          )}
          {cat && (
            <span className="text-[10px] text-muted-foreground">{cat.name}</span>
          )}
        </div>
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
          {article.title}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.summary}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  );
}