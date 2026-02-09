// ============================================================
// IP-NEXUS HELP — ARTICLE SECTION
// Secciones con alternancia visual para romper monotonía
// ============================================================

import type { ReactNode } from 'react';

interface ArticleSectionProps {
  id: string;
  title: string;
  icon?: React.ElementType;
  accentColor?: string;
  variant?: 'default' | 'highlighted' | 'dark';
  children: ReactNode;
}

export function ArticleSection({
  id, title, icon: Icon, accentColor, variant = 'default', children,
}: ArticleSectionProps) {
  const bgStyles = {
    default: 'bg-transparent',
    highlighted: 'bg-muted/40 border border-border rounded-2xl p-6 -mx-2',
    dark: 'bg-foreground text-background rounded-2xl p-6 -mx-2',
  };

  const isDark = variant === 'dark';

  return (
    <section id={id} className={`scroll-mt-28 pt-10 first:pt-0 ${bgStyles[variant]}`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isDark
                ? 'rgba(255,255,255,0.1)'
                : `${accentColor || '#0EA5E9'}10`,
            }}
          >
            <Icon
              className="w-[18px] h-[18px]"
              style={{ color: isDark ? '#fff' : (accentColor || '#0EA5E9') }}
            />
          </div>
        )}
        <h2
          className={`text-[18px] font-bold leading-tight ${isDark ? 'text-white' : 'text-foreground'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
      </div>

      <div
        className="h-[2px] w-12 rounded-full mb-6"
        style={{
          background: isDark
            ? 'rgba(255,255,255,0.2)'
            : `${accentColor || '#0EA5E9'}30`,
        }}
      />

      <div className="space-y-4 text-[14px] leading-[1.75]">{children}</div>
    </section>
  );
}
