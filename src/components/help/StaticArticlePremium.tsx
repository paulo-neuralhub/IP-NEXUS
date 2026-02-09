// ============================================================
// IP-NEXUS HELP — Static Article Premium Renderer
// Wraps markdown content in the ArticleLayout premium shell
// ============================================================

import { useMemo, type ElementType } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';
import { ArticleLayout } from './ArticleLayout';
import type { StaticHelpArticle, StaticHelpCategory } from '@/lib/helpStaticContent';

/* ── Category → accent color map ── */
const CATEGORY_COLORS: Record<string, string> = {
  'getting-started': '#2563EB',
  portfolio: '#0EA5E9',
  docket: '#0EA5E9',
  filing: '#14B8A6',
  costes: '#14B8A6',
  genius: '#F59E0B',
  crm: '#EC4899',
  configuracion: '#64748B',
  integraciones: '#8B5CF6',
  facturacion: '#F59E0B',
  troubleshooting: '#EF4444',
};

/* ── Extract H2 headings from markdown for TOC ── */
function extractTocSections(md: string) {
  const headingRegex = /^##\s+(.+)$/gm;
  const sections: { id: string; title: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(md)) !== null) {
    const title = match[1].replace(/[*_`]/g, '').trim();
    const id = title
      .toLowerCase()
      .replace(/[áàä]/g, 'a')
      .replace(/[éèë]/g, 'e')
      .replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    sections.push({ id, title });
  }
  return sections;
}

/* ── Custom heading renderer that adds id for TOC linking ── */
function HeadingWithId({ level, children }: { level: number; children: React.ReactNode }) {
  const text = String(children).replace(/[*_`]/g, '').trim();
  const id = text
    .toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag id={id} className="scroll-mt-24">{children}</Tag>;
}

interface Props {
  article: StaticHelpArticle;
  category?: StaticHelpCategory;
  relatedArticles?: Array<{ slug: string; title: string; readTime?: string }>;
}

export function StaticArticlePremium({ article, category, relatedArticles }: Props) {
  const accentColor = CATEGORY_COLORS[article.categorySlug] || '#3B82F6';
  const tocSections = useMemo(() => extractTocSections(article.content), [article.content]);

  const related = relatedArticles?.map((r) => ({
    title: r.title,
    path: `/app/help/article/${r.slug}`,
    readTime: r.readTime,
  }));

  return (
    <ArticleLayout
      title={article.title}
      subtitle={article.summary}
      icon={FileText as ElementType}
      accentColor={accentColor}
      category={category?.name || article.categorySlug}
      categorySlug={article.categorySlug}
      readTime={article.readTime}
      lastUpdated="Febrero 2026"
      tags={article.tags}
      tocSections={tocSections}
      relatedArticles={related}
    >
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:text-foreground/80 prose-li:text-foreground/80 prose-table:text-sm prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
        <ReactMarkdown
          components={{
            h2: ({ children }) => <HeadingWithId level={2}>{children}</HeadingWithId>,
            h3: ({ children }) => <HeadingWithId level={3}>{children}</HeadingWithId>,
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </ArticleLayout>
  );
}
