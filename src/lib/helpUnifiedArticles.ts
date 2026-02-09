// ============================================================
// IP-NEXUS HELP — Unified article source
// Merges component-based articles (help-articles.ts) with
// static markdown articles (helpStaticContent.ts).
// Component articles take priority over static with same slug.
// ============================================================

import { helpArticles, type HelpArticle } from '@/data/help-articles';
import {
  HELP_ARTICLES as STATIC_ARTICLES,
  HELP_CATEGORIES,
  type StaticHelpArticle,
  type StaticHelpCategory,
} from '@/lib/helpStaticContent';

export interface UnifiedArticle {
  slug: string;
  title: string;
  summary: string;
  categorySlug: string;
  readTime: string;
  /** 'component' = premium component, 'static' = markdown */
  source: 'component' | 'static';
  articleType?: string;
  tags?: string[];
  icon?: string;
  isFeatured?: boolean;
}

/** Convert component article → unified */
function fromComponent(a: HelpArticle): UnifiedArticle {
  return {
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    categorySlug: a.category,
    readTime: a.readTime,
    source: 'component',
    tags: a.keywords,
    icon: a.icon,
  };
}

/** Convert static article → unified */
function fromStatic(a: StaticHelpArticle): UnifiedArticle {
  return {
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    categorySlug: a.categorySlug,
    readTime: a.readTime,
    source: 'static',
    articleType: a.articleType,
    tags: a.tags,
    isFeatured: a.isFeatured,
  };
}

/** All unified articles, component first, deduped by slug */
let _cache: UnifiedArticle[] | null = null;

export function getAllUnifiedArticles(): UnifiedArticle[] {
  if (_cache) return _cache;
  const seen = new Set<string>();
  const result: UnifiedArticle[] = [];

  // Component articles first (higher priority)
  for (const a of helpArticles) {
    if (!seen.has(a.slug)) {
      seen.add(a.slug);
      result.push(fromComponent(a));
    }
  }

  // Then static articles (only if slug not already present)
  for (const a of STATIC_ARTICLES) {
    if (!seen.has(a.slug)) {
      seen.add(a.slug);
      result.push(fromStatic(a));
    }
  }

  _cache = result;
  return result;
}

/** Get unified articles for a category slug */
export function getUnifiedArticlesByCategory(categorySlug: string): UnifiedArticle[] {
  return getAllUnifiedArticles().filter(a => a.categorySlug === categorySlug);
}

/** Search unified articles */
export function searchUnifiedArticles(query: string): UnifiedArticle[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return getAllUnifiedArticles().filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.summary.toLowerCase().includes(q) ||
    (a.tags || []).some(t => t.toLowerCase().includes(q))
  );
}

/** Featured unified articles */
export function getFeaturedUnifiedArticles(): UnifiedArticle[] {
  return getAllUnifiedArticles().filter(a => a.isFeatured);
}

/** Re-export categories for convenience */
export { HELP_CATEGORIES };
export type { StaticHelpCategory };
