// ============================================================
// IP-NEXUS HELP - CONTEXTUAL HELP WIDGET
// Floating button showing relevant articles for the current page
// ============================================================

import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HelpCircle, X, ChevronRight, BookOpen, Clock, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { helpArticles, type HelpArticle } from '@/data/help-articles';
import { AnimatePresence, motion } from 'framer-motion';

// ── Contextual article IDs by route prefix ──
const CONTEXTUAL_MAP: Record<string, string[]> = {
  '/app/matters/new': ['gs-003', 'docket-001', 'filing-003'],
  '/app/matters':     ['docket-001', 'docket-009', 'docket-006'],
  '/app/contacts':    ['crm-002', 'crm-001'],
  '/app/crm':         ['crm-001', 'crm-003', 'crm-004'],
  '/app/spider':      ['genius-003', 'docket-008'],
  '/app/genius':      ['genius-001', 'genius-002'],
  '/app/ai-genius':   ['genius-001', 'genius-002'],
  '/app/market':      ['fix-005'],
  '/app/finance':     ['fin-001', 'fin-002'],
  '/app/settings':    ['config-001', 'config-002', 'config-003'],
  '/app/dashboard':   ['gs-006', 'gs-001'],
};

// Default fallback articles
const DEFAULT_IDS = ['gs-003', 'gs-006', 'genius-001'];

function getContextualArticles(pathname: string): HelpArticle[] {
  // Try exact match first, then prefix match (longest first)
  const sortedKeys = Object.keys(CONTEXTUAL_MAP).sort((a, b) => b.length - a.length);
  const matchedKey = sortedKeys.find((key) => pathname.startsWith(key));
  const ids = matchedKey ? CONTEXTUAL_MAP[matchedKey] : DEFAULT_IDS;

  return ids
    .map((id) => helpArticles.find((a) => a.id === id))
    .filter(Boolean) as HelpArticle[];
}

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const articles = useMemo(
    () => getContextualArticles(location.pathname),
    [location.pathname],
  );

  // Don't show on help pages
  if (location.pathname.startsWith('/app/help')) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-14 right-0 w-80 bg-background border border-border rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Ayuda rápida</h3>
                  <p className="text-[11px] text-muted-foreground">Artículos para esta sección</p>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/app/help/article/${article.slug}`}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight truncate">
                      {article.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {article.readTime}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mt-1 flex-shrink-0" />
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-muted/30">
              <Link
                to="/app/help"
                className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Ver todo el Centro de Ayuda <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <Button
        size="icon"
        variant="outline"
        className={cn(
          "h-11 w-11 rounded-full shadow-md border-border bg-background",
          "hover:scale-105 transition-transform",
          isOpen && "bg-muted"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-foreground" />
        ) : (
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
