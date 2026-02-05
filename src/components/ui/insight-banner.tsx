/**
 * ═══════════════════════════════════════════════════════════════
 * IP-NEXUS SILK DESIGN SYSTEM — InsightBanner
 * Subtle alert/insight banners with soft gradients
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';

interface InsightBannerProps {
  icon: string;
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
}

const colors = {
  info: { bg: 'rgba(0,180,216,0.03)', border: 'rgba(0,180,216,0.08)' },
  warning: { bg: 'rgba(245,158,11,0.03)', border: 'rgba(245,158,11,0.08)' },
  success: { bg: 'rgba(16,185,129,0.03)', border: 'rgba(16,185,129,0.08)' },
  error: { bg: 'rgba(239,68,68,0.03)', border: 'rgba(239,68,68,0.08)' },
};

export const InsightBanner: React.FC<InsightBannerProps> = ({
  icon,
  children,
  type = 'info',
  className = '',
}) => {
  const c = colors[type];

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      style={{
        padding: '11px 16px',
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${c.bg}, ${c.bg.replace('0.03', '0.02')})`,
        border: `1px solid ${c.border}`,
      }}
    >
      <span style={{ fontSize: '15px' }}>{icon}</span>
      <span style={{ fontSize: '12px', color: '#334155' }}>{children}</span>
    </div>
  );
};

export default InsightBanner;