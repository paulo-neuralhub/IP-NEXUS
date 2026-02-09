// ============================================================
// IP-NEXUS HELP — ARTICLE LAYOUT PREMIUM
// Wrapper maestro con TOC sticky, progress bar, feedback
// ============================================================

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ArrowLeft, Clock, Calendar,
  ThumbsUp, ThumbsDown, ChevronUp, BookOpen,
} from 'lucide-react';

interface TocSection {
  id: string;
  title: string;
}

interface RelatedArticle {
  title: string;
  path: string;
  readTime?: string;
}

interface ArticleLayoutProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  accentColor: string;
  category: string;
  categorySlug: string;
  readTime: string;
  lastUpdated: string;
  tags?: string[];
  tocSections: TocSection[];
  relatedArticles?: RelatedArticle[];
  children: ReactNode;
}

export function ArticleLayout({
  title, subtitle, icon: Icon, accentColor, category, categorySlug,
  readTime, lastUpdated, tags, tocSections, relatedArticles, children,
}: ArticleLayoutProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [readProgress, setReadProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  /* ── Reading‑progress bar ── */
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const { top, height } = contentRef.current.getBoundingClientRect();
      const wh = window.innerHeight;
      const pct = Math.max(0, -top) / (height - wh);
      setReadProgress(Math.min(1, Math.max(0, pct)));
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Active TOC section via IntersectionObserver ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-100px 0px -60% 0px' },
    );
    tocSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [tocSections]);

  return (
    <div ref={contentRef}>
      {/* ── Progress bar (fixed top) ── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
        <div
          className="h-full transition-all duration-150 ease-out rounded-r-full"
          style={{
            width: `${readProgress * 100}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}90)`,
          }}
        />
      </div>

      {/* ── Main layout: content + TOC ── */}
      <div className="flex gap-10 max-w-6xl mx-auto px-6 py-8">

        {/* ══ MAIN COLUMN ══ */}
        <div className="flex-1 max-w-3xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] mb-8">
            <Link to="/app/help" className="text-muted-foreground hover:text-foreground transition-colors">
              Centro de Ayuda
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            <Link to={`/app/help/category/${categorySlug}`} className="text-muted-foreground hover:text-foreground transition-colors">
              {category}
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-foreground font-medium truncate max-w-[250px]">{title}</span>
          </nav>

          {/* ── Article header ── */}
          <header className="mb-10">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: `${accentColor}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: accentColor }} />
              </div>
              <span
                className="text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: accentColor }}
              >
                {category}
              </span>
            </div>

            <h1
              className="text-[28px] font-extrabold text-foreground leading-[1.2] mb-3"
              style={{ letterSpacing: '-0.03em' }}
            >
              {title}
            </h1>

            {subtitle && (
              <p className="text-base text-muted-foreground leading-relaxed mb-4">{subtitle}</p>
            )}

            <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {readTime} de lectura
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {lastUpdated}
              </span>
            </div>

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold border"
                    style={{
                      color: accentColor,
                      borderColor: `${accentColor}25`,
                      background: `${accentColor}08`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Separator */}
          <div
            className="h-px mb-10"
            style={{ background: `linear-gradient(90deg, ${accentColor}20, transparent)` }}
          />

          {/* ══ ARTICLE BODY ══ */}
          <article className="article-content">{children}</article>

          <div className="h-px my-10 bg-border" />

          {/* ── Feedback ── */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-muted/60 to-background border border-border">
            {feedback ? (
              <div className="text-center">
                <div className="text-3xl mb-2">{feedback === 'up' ? '🎉' : '🙏'}</div>
                <p className="text-sm font-semibold text-foreground">
                  {feedback === 'up'
                    ? '¡Gracias! Tu feedback nos ayuda a mejorar.'
                    : 'Gracias. Mejoraremos este artículo.'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ¿Te ha resultado útil este artículo?
                </p>
                <p className="text-xs text-muted-foreground mb-5">
                  Tu feedback nos ayuda a crear mejor documentación
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setFeedback('up')}
                    className="group flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-background border-2 border-border hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20 hover:-translate-y-0.5"
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-500 transition-transform group-hover:scale-110" />
                    Sí, me ayudó
                  </button>
                  <button
                    onClick={() => setFeedback('down')}
                    className="group flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-background border-2 border-border hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-200 hover:shadow-lg hover:shadow-rose-100/50 dark:hover:shadow-rose-900/20 hover:-translate-y-0.5"
                  >
                    <ThumbsDown className="w-4 h-4 text-rose-400 transition-transform group-hover:scale-110" />
                    Puede mejorar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Related articles ── */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.08em] mb-4 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Sigue aprendiendo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedArticles.map((a, i) => (
                  <Link
                    key={i}
                    to={a.path}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-border/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${accentColor}10` }}
                    >
                      <ChevronRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        style={{ color: accentColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground block truncate">
                        {a.title}
                      </span>
                      {a.readTime && (
                        <span className="text-[11px] text-muted-foreground">{a.readTime}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back */}
          <div className="mt-8">
            <Link
              to={`/app/help/category/${categorySlug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a {category}
            </Link>
          </div>
        </div>

        {/* ══ SIDEBAR: TABLE OF CONTENTS (xl+) ══ */}
        <aside className="hidden xl:block w-52 flex-shrink-0">
          <div className="sticky top-28">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-4">
              En este artículo
            </h4>
            <nav className="space-y-0.5">
              {tocSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`block text-[12px] py-1.5 pl-3 border-l-2 transition-all duration-200 ${
                    activeSection === s.id
                      ? 'font-semibold'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                  }`}
                  style={
                    activeSection === s.id
                      ? { color: accentColor, borderColor: accentColor }
                      : {}
                  }
                >
                  {s.title}
                </a>
              ))}
            </nav>

            <div className="h-px bg-border my-5" />

            <div className="space-y-2">
              <Link to="/app/help" className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                ← Centro de Ayuda
              </Link>
              <Link to="/app/help/shortcuts" className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                ⌨️ Atajos de teclado
              </Link>
              <Link to="/app/help/glossary" className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                📖 Glosario IP
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Back to top ── */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-40 w-10 h-10 rounded-full bg-background shadow-lg border border-border flex items-center justify-center hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          aria-label="Volver arriba"
        >
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
