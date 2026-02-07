// ═══════════════════════════════════════════════════════════════
// IP-NEXUS — DOCUMENT PDF ENGINE
// Generates HTML documents ready for PDF conversion
// Based on the Master 270 Templates HTML reference
// ═══════════════════════════════════════════════════════════════

// ── DESIGN TOKENS ───────────────────────────────────────────
export const DESIGN_TOKENS = {
  clasico: {
    id: "clasico", name: "Clásico", pack: "Classic",
    headFont: "Libre Baskerville, serif", bodyFont: "Libre Baskerville, serif",
    headerLayout: "standard",
    colors: {
      primary: "#1a1a1a", accent: "#1a1a1a", background: "#ffffff", backgroundAlt: "#f9f9f9",
      headerBg: "#1a1a1a", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#dddddd", tableHeadBg: "#1a1a1a", tableHeadText: "#ffffff",
      totalBg: "#1a1a1a", totalText: "#ffffff"
    },
    isDark: false
  },
  elegante: {
    id: "elegante", name: "Elegante", pack: "Classic",
    headFont: "Cormorant Garamond, serif", bodyFont: "DM Sans, sans-serif",
    headerLayout: "standard",
    colors: {
      primary: "#f0e6d3", accent: "#c5a679", background: "#0f0a14",
      backgroundAlt: "rgba(255,255,255,0.03)", headerBg: "rgba(26,21,32,0.8)",
      headerText: "#f0e6d3", text: "#d4c5b0", textMuted: "#8a7960",
      border: "rgba(197,166,121,0.15)", tableHeadBg: "rgba(197,166,121,0.12)",
      tableHeadText: "#c5a679", totalBg: "#c5a679", totalText: "#0f0a14"
    },
    isDark: true
  },
  moderno: {
    id: "moderno", name: "Moderno", pack: "Classic",
    headFont: "Outfit, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "standard",
    colors: {
      primary: "#1e293b", accent: "#2563eb", background: "#ffffff", backgroundAlt: "#f8fafc",
      headerBg: "#2563eb", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#e2e8f0", tableHeadBg: "#2563eb", tableHeadText: "#ffffff",
      totalBg: "#2563eb", totalText: "#ffffff"
    },
    isDark: false
  },
  sofisticado: {
    id: "sofisticado", name: "Sofisticado", pack: "Classic",
    headFont: "Sora, sans-serif", bodyFont: "Source Sans 3, sans-serif",
    headerLayout: "sidebar",
    colors: {
      primary: "#1a202c", accent: "#667eea", background: "#ffffff", backgroundAlt: "#f7fafc",
      headerBg: "#1a202c", headerText: "#cbd5e0", text: "#555555", textMuted: "#a0aec0",
      border: "#edf2f7", tableHeadBg: "#667eea", tableHeadText: "#ffffff",
      totalBg: "#1a202c", totalText: "#ffffff"
    },
    isDark: false
  },
  corporativo: {
    id: "corporativo", name: "Corporativo", pack: "Classic",
    headFont: "DM Sans, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "split",
    colors: {
      primary: "#1f2937", accent: "#0f4c81", background: "#ffffff", backgroundAlt: "#f9fafb",
      headerBg: "#0f4c81", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#e5e7eb", tableHeadBg: "#0f4c81", tableHeadText: "#ffffff",
      totalBg: "#0f4c81", totalText: "#ffffff"
    },
    isDark: false
  },
  creativo: {
    id: "creativo", name: "Creativo", pack: "Classic",
    headFont: "Sora, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "topbar",
    colors: {
      primary: "#1a1a2e", accent: "#f43f5e", background: "#ffffff", backgroundAlt: "#fafafa",
      headerBg: "#ffffff", headerText: "#1a1a2e", text: "#333333", textMuted: "#999999",
      border: "#f0f0f0", tableHeadBg: "linear-gradient(90deg, #f43f5e, #8b5cf6)",
      tableHeadText: "#ffffff", totalBg: "linear-gradient(135deg, #f43f5e, #8b5cf6)",
      totalText: "#ffffff"
    },
    isDark: false
  },
  "bold-orange": {
    id: "bold-orange", name: "Bold Orange", pack: "Modern",
    headFont: "Outfit, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "split",
    colors: {
      primary: "#1a1a1a", accent: "#f97316", background: "#ffffff", backgroundAlt: "#fef7f0",
      headerBg: "#1a1a1a", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#f0f0f0", tableHeadBg: "#1a1a1a", tableHeadText: "#ffffff",
      totalBg: "#f97316", totalText: "#ffffff"
    },
    isDark: false
  },
  "tech-dark": {
    id: "tech-dark", name: "Tech Dark", pack: "Modern",
    headFont: "Sora, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "flat",
    colors: {
      primary: "#ffffff", accent: "#6366f1", background: "#0c0c14",
      backgroundAlt: "rgba(255,255,255,0.025)", headerBg: "#0c0c14", headerText: "#ffffff",
      text: "#aaaaaa", textMuted: "#555555", border: "rgba(99,102,241,0.1)",
      tableHeadBg: "transparent", tableHeadText: "#6366f1",
      totalBg: "#6366f1", totalText: "#ffffff"
    },
    isDark: true
  },
  "wave-blue": {
    id: "wave-blue", name: "Wave Blue", pack: "Modern",
    headFont: "Manrope, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "wave",
    colors: {
      primary: "#1e293b", accent: "#0369a1", background: "#ffffff", backgroundAlt: "#f8fafc",
      headerBg: "#0369a1", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#f1f5f9", tableHeadBg: "#0369a1", tableHeadText: "#ffffff",
      totalBg: "#0369a1", totalText: "#ffffff"
    },
    isDark: false
  },
  "red-accent": {
    id: "red-accent", name: "Red Accent", pack: "Modern",
    headFont: "Urbanist, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "topbar",
    colors: {
      primary: "#1f2937", accent: "#dc2626", background: "#ffffff", backgroundAlt: "#fef2f2",
      headerBg: "#ffffff", headerText: "#1f2937", text: "#333333", textMuted: "#999999",
      border: "#f3f4f6", tableHeadBg: "#ffffff", tableHeadText: "#6b7280",
      totalBg: "#dc2626", totalText: "#ffffff"
    },
    isDark: false
  },
  geometric: {
    id: "geometric", name: "Geometric", pack: "Modern",
    headFont: "Poppins, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "flat",
    colors: {
      primary: "#0f172a", accent: "#3b82f6", background: "#ffffff", backgroundAlt: "#f8fafc",
      headerBg: "#ffffff", headerText: "#0f172a", text: "#333333", textMuted: "#999999",
      border: "#e2e8f0", tableHeadBg: "transparent", tableHeadText: "#94a3b8",
      totalBg: "#3b82f6", totalText: "#ffffff"
    },
    isDark: false
  },
  "split-green": {
    id: "split-green", name: "Split Green", pack: "Modern",
    headFont: "Plus Jakarta Sans, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "sidebar",
    colors: {
      primary: "#111111", accent: "#16a34a", background: "#ffffff", backgroundAlt: "#f0fdf4",
      headerBg: "#16a34a", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#e5e7eb", tableHeadBg: "#16a34a", tableHeadText: "#ffffff",
      totalBg: "#16a34a", totalText: "#ffffff"
    },
    isDark: false
  },
  swiss: {
    id: "swiss", name: "Swiss Precision", pack: "Executive",
    headFont: "Inter Tight, sans-serif", bodyFont: "Inter Tight, sans-serif",
    headerLayout: "grid",
    colors: {
      primary: "#0a0a0a", accent: "#0a0a0a", background: "#ffffff", backgroundAlt: "#fafafa",
      headerBg: "#0a0a0a", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#e5e5e5", tableHeadBg: "#fafafa", tableHeadText: "#999999",
      totalBg: "#0a0a0a", totalText: "#ffffff"
    },
    isDark: false
  },
  "navy-gold": {
    id: "navy-gold", name: "Navy & Gold", pack: "Executive",
    headFont: "Playfair Display, serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "standard",
    colors: {
      primary: "#1b2541", accent: "#c6a367", background: "#ffffff", backgroundAlt: "#faf8f5",
      headerBg: "#1b2541", headerText: "#ffffff", text: "#333333", textMuted: "#b8a88a",
      border: "#e8e0d4", tableHeadBg: "transparent", tableHeadText: "#c6a367",
      totalBg: "#1b2541", totalText: "#c6a367"
    },
    isDark: false
  },
  "teal-exec": {
    id: "teal-exec", name: "Teal Executive", pack: "Executive",
    headFont: "IBM Plex Sans, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "topbar",
    colors: {
      primary: "#0f172a", accent: "#0d9488", background: "#ffffff", backgroundAlt: "#f8fffe",
      headerBg: "#ffffff", headerText: "#0f172a", text: "#333333", textMuted: "#999999",
      border: "#e2e8f0", tableHeadBg: "transparent", tableHeadText: "#0d9488",
      totalBg: "#0d9488", totalText: "#ffffff"
    },
    isDark: false
  },
  editorial: {
    id: "editorial", name: "Editorial", pack: "Executive",
    headFont: "Fraunces, serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "flat",
    colors: {
      primary: "#1a1a1a", accent: "#1a1a1a", background: "#faf9f6", backgroundAlt: "#f5f3ee",
      headerBg: "#faf9f6", headerText: "#1a1a1a", text: "#333333", textMuted: "#a09880",
      border: "#e0ddd6", tableHeadBg: "transparent", tableHeadText: "#b0a890",
      totalBg: "#1a1a1a", totalText: "#ffffff"
    },
    isDark: false
  },
  monochrome: {
    id: "monochrome", name: "Monochrome", pack: "Executive",
    headFont: "Space Grotesk, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "standard",
    colors: {
      primary: "#111111", accent: "#333333", background: "#ffffff", backgroundAlt: "#fafafa",
      headerBg: "#333333", headerText: "#ffffff", text: "#333333", textMuted: "#999999",
      border: "#eeeeee", tableHeadBg: "#333333", tableHeadText: "#ffffff",
      totalBg: "#333333", totalText: "#ffffff"
    },
    isDark: false
  },
  "dual-indigo": {
    id: "dual-indigo", name: "Dual Indigo", pack: "Executive",
    headFont: "Manrope, sans-serif", bodyFont: "Plus Jakarta Sans, sans-serif",
    headerLayout: "sidebar",
    colors: {
      primary: "#1e1b4b", accent: "#6366f1", background: "#ffffff", backgroundAlt: "#f5f3ff",
      headerBg: "#312e81", headerText: "#ffffff", text: "#333333", textMuted: "#a5b4fc",
      border: "#e0e7ff", tableHeadBg: "transparent", tableHeadText: "#6366f1",
      totalBg: "#6366f1", totalText: "#ffffff"
    },
    isDark: false
  }
};

// ── TYPES ────────────────────────────────────────────────────
export interface PDFEngineTokenColors {
  primary: string; accent: string; background: string; backgroundAlt: string;
  headerBg: string; headerText: string; text: string; textMuted: string;
  border: string; tableHeadBg: string; tableHeadText: string;
  totalBg: string; totalText: string;
}

export interface PDFEngineToken {
  id: string; name: string; pack: string;
  headFont: string; bodyFont: string; headerLayout: string;
  colors: PDFEngineTokenColors; isDark: boolean;
}

export interface PDFEngineTenant {
  name?: string; subtitle?: string; email?: string; phone?: string;
  address?: string; iban?: string; cif?: string; city?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PDFEngineData = Record<string, any>;

// ── BASE CSS (injected into every document) ─────────────────
function getBaseCSS(tokens: PDFEngineToken) {
  const c = tokens.colors;
  return `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Sora:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Serif+Display&family=Fraunces:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Inter+Tight:wght@300;400;500;600;700;800;900&family=Libre+Baskerville:wght@400;700&family=Urbanist:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=Source+Sans+3:wght@300;400;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    .doc {
      font-family: ${tokens.bodyFont};
      color: ${c.text};
      background: ${c.background};
      width: 680px;
      min-height: 960px;
    }

    /* ── Header layouts ── */
    .h-standard { background: ${c.headerBg}; color: ${c.headerText}; padding: 26px 34px; display: flex; justify-content: space-between; align-items: center; }
    .h-split { display: flex; }
    .h-split .hl { flex: 1; background: ${c.headerBg}; color: ${c.headerText}; padding: 24px 28px; }
    .h-split .hr { width: 220px; background: ${c.accent}; color: #fff; padding: 24px 28px; display: flex; flex-direction: column; justify-content: center; }
    .h-sidebar { display: flex; min-height: 860px; }
    .h-sidebar .sd { width: 185px; background: ${c.headerBg}; color: ${c.headerText}; padding: 28px 18px; flex-shrink: 0; }
    .h-sidebar .sd .sl { font-size: 7px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.5; margin-bottom: 5px; }
    .h-sidebar .sd .sv { font-size: 10px; opacity: 0.8; line-height: 1.7; margin-bottom: 16px; }
    .h-sidebar .sd .sdv { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 16px; }
    .h-sidebar .ma { flex: 1; padding: 28px 24px; }
    .h-topbar { border-top: 5px solid ${c.accent}; padding: 24px 34px; display: flex; justify-content: space-between; align-items: flex-start; background: ${c.background}; }
    .h-wave { background: ${c.accent}; padding: 24px 34px 44px; color: #fff; display: flex; justify-content: space-between; position: relative; }
    .h-wave::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 32px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 50'%3E%3Cpath fill='%23ffffff' d='M0,25C360,50,720,0,1080,25C1260,38,1350,35,1440,25L1440,50L0,50Z'/%3E%3C/svg%3E") no-repeat center/cover; }
    .h-flat { padding: 26px 34px; display: flex; justify-content: space-between; align-items: flex-start; background: ${c.background}; border-bottom: 1px solid ${c.border}; }
    .h-grid { display: grid; grid-template-columns: 1fr 1fr; }
    .h-grid .gd { background: ${c.headerBg}; color: ${c.headerText}; padding: 22px 26px; }
    .h-grid .gl { background: ${c.backgroundAlt}; padding: 22px 26px; }

    /* ── Logo / Title ── */
    .lo { font-family: ${tokens.headFont}; font-size: 19px; font-weight: 800; }
    .los { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.5; margin-top: 2px; }
    .dt { font-family: ${tokens.headFont}; font-size: 26px; font-weight: 800; letter-spacing: 1px; }

    /* ── Body ── */
    .bd { padding: 24px 34px 28px; }

    /* ── Meta block ── */
    .mt { display: flex; justify-content: space-between; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 2px solid ${c.border}; }
    .ml { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: ${c.textMuted}; margin-bottom: 3px; font-weight: 600; }
    .mv { font-size: 12px; color: ${c.primary}; font-weight: 700; }
    .ms { font-size: 10px; color: ${c.textMuted}; font-weight: 400; }

    /* ── Table ── */
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th { text-align: left; padding: 10px 11px; font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: ${c.tableHeadText}; background: ${c.tableHeadBg}; font-weight: 700; }
    th:first-child { border-radius: 5px 0 0 5px; }
    th:last-child { border-radius: 0 5px 5px 0; text-align: right; }
    td { padding: 11px; font-size: 12px; border-bottom: 1px solid ${c.border}; color: ${c.text}; }
    td:last-child { text-align: right; }
    tr:nth-child(even) td { background: ${c.backgroundAlt}; }

    /* ── Totals ── */
    .tots { display: flex; justify-content: flex-end; margin-top: 14px; }
    .tb { width: 240px; }
    .tr { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: ${c.textMuted}; }
    .tr.tt { background: ${c.totalBg}; color: ${c.totalText}; padding: 11px 14px; border-radius: 5px; margin-top: 6px; font-size: 15px; font-weight: 800; }

    /* ── Footer ── */
    .ft { margin-top: 20px; padding-top: 12px; border-top: 1px solid ${c.border}; display: flex; justify-content: space-between; font-size: 9px; color: ${c.textMuted}; }

    /* ── Status badges ── */
    .status { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .st-urg { background: ${tokens.isDark ? 'rgba(220,38,38,0.1)' : '#fef2f2'}; color: #dc2626; border: 1px solid ${tokens.isDark ? 'rgba(220,38,38,0.2)' : '#fecaca'}; }
    .st-ok { background: ${tokens.isDark ? 'rgba(22,163,74,0.1)' : '#f0fdf4'}; color: #16a34a; border: 1px solid ${tokens.isDark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}; }
    .st-warn { background: ${tokens.isDark ? 'rgba(217,119,6,0.1)' : '#fffbeb'}; color: #d97706; border: 1px solid ${tokens.isDark ? 'rgba(217,119,6,0.2)' : '#fde68a'}; }

    /* ── Letter/Report ── */
    .lt-s { font-family: ${tokens.headFont}; font-size: 14px; font-weight: 700; color: ${c.primary}; margin: 16px 0 12px; padding-bottom: 8px; border-bottom: 2px solid ${c.accent}; }
    .lt-b { font-size: 12px; line-height: 1.85; color: ${c.text}; }
    .lt-b p { margin-bottom: 12px; }
    .lt-sg { margin-top: 26px; }
    .lt-sg-l { width: 180px; height: 1px; background: ${c.primary}; margin-bottom: 5px; }
    .lt-sg-n { font-family: ${tokens.headFont}; font-size: 12px; font-weight: 700; color: ${c.primary}; }
    .lt-sg-r { font-size: 9px; color: ${c.textMuted}; }

    /* ── Report ── */
    .rp-t { font-family: ${tokens.headFont}; font-size: 18px; font-weight: 800; color: ${c.primary}; margin-bottom: 4px; }
    .rp-su { font-size: 11px; color: ${c.textMuted}; margin-bottom: 16px; }
    .rp-h { font-family: ${tokens.headFont}; font-size: 12px; font-weight: 700; color: ${c.accent}; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 6px; padding-bottom: 4px; border-bottom: 2px solid ${c.accent}; }
    .rp-p { font-size: 11px; line-height: 1.75; color: ${c.text}; margin-bottom: 8px; }
    .sg { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
    .sgi { padding: 10px; background: ${c.backgroundAlt}; border-radius: 5px; text-align: center; border-left: 3px solid ${c.accent}; }
    .sgn { font-family: ${tokens.headFont}; font-size: 20px; font-weight: 800; color: ${c.primary}; }
    .sgl { font-size: 7px; text-transform: uppercase; letter-spacing: 1px; color: ${c.textMuted}; margin-top: 2px; }

    /* ── Clauses ── */
    .clause { margin-bottom: 12px; padding: 10px 14px; background: ${c.backgroundAlt}; border-radius: 5px; border-left: 3px solid ${c.accent}; }
    .clause-h { font-family: ${tokens.headFont}; font-size: 11px; font-weight: 700; color: ${c.primary}; margin-bottom: 3px; }
    .clause-p { font-size: 10px; line-height: 1.7; color: ${c.text}; }
    .cl-n { font-family: ${tokens.headFont}; font-size: 13px; font-weight: 700; color: ${c.primary}; margin: 14px 0 4px; }
    .cl-t { font-size: 11px; line-height: 1.75; color: ${c.text}; }

    /* ── Certificate ── */
    .cert-center { text-align: center; padding: 40px 34px; }
    .cert-title { font-family: ${tokens.headFont}; font-size: 28px; font-weight: 800; color: ${c.primary}; margin-bottom: 8px; }
    .cert-sub { font-size: 11px; color: ${c.textMuted}; margin-bottom: 24px; }
    .cert-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: left; margin: 20px 0; }
    .cert-item { padding: 12px; background: ${c.backgroundAlt}; border-radius: 5px; }
    .cert-seal { margin-top: 24px; display: flex; justify-content: center; gap: 30px; }
    .cert-seal-item { text-align: center; }
    .cert-seal-circle { width: 50px; height: 50px; border-radius: 50%; border: 2px solid ${c.accent}; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 16px; }
  `;
}

// ── HEADER GENERATORS ───────────────────────────────────────

function generateHeader(tokens: PDFEngineToken, tenant: PDFEngineTenant, docLabel: string, docNumber: string) {
  const c = tokens.colors;
  const logo = `<div class="lo">${tenant.name || 'IP-NEXUS'}</div><div class="los">${tenant.subtitle || 'Intellectual Property'}</div>`;
  const docTitle = `<div class="dt">${docLabel}</div><div style="font-size:10px;color:${c.textMuted};margin-top:2px">${docNumber}</div>`;

  const layouts = {
    standard: `<div class="h-standard"><div>${logo}</div><div style="text-align:right">${docTitle}</div></div>`,
    
    split: `<div class="h-split"><div class="hl">${logo}<div style="font-size:9px;opacity:.7;line-height:1.8;margin-top:8px">✉ ${tenant.email || 'info@ip-nexus.com'} · ☎ ${tenant.phone || '+34 912 345 678'}</div></div><div class="hr">${docTitle}</div></div>`,
    
    sidebar: `<div class="h-sidebar"><div class="sd">${logo}<div style="margin-top:24px"><div class="sl">Contacto</div><div class="sv">${tenant.email || 'info@ip-nexus.com'}<br>${tenant.phone || '+34 912 345 678'}</div><div class="sdv"></div><div class="sl">Dirección</div><div class="sv">${tenant.address || 'Av. Diagonal 211<br>08018 Barcelona'}</div><div class="sdv"></div><div class="sl">IBAN</div><div class="sv">${tenant.iban || 'ES12 3456 7890<br>1234 5678 9012'}</div></div></div><div class="ma">`,
    
    topbar: `<div class="h-topbar"><div><div class="lo" style="color:${c.primary}">${tenant.name || 'IP-NEXUS'}</div><div class="los" style="opacity:1;color:${c.accent}">${tenant.subtitle || 'Intellectual Property'}</div></div><div style="text-align:right"><div class="dt" style="color:${c.accent}">${docLabel}</div><div style="font-size:10px;color:${c.textMuted};margin-top:2px">${docNumber}</div></div></div>`,
    
    wave: `<div class="h-wave"><div>${logo}</div><div style="text-align:right">${docTitle}</div></div>`,
    
    flat: `<div class="h-flat"><div><div class="lo" style="color:${c.primary}">${tenant.name || 'IP-NEXUS'}</div><div class="los" style="opacity:1;color:${c.accent}">${tenant.subtitle || 'Intellectual Property'}</div></div><div style="text-align:right"><div class="dt" style="color:${c.primary}">${docLabel}</div><div style="font-size:10px;color:${c.textMuted};margin-top:2px">${docNumber}</div></div></div>`,
    
    grid: `<div class="h-grid"><div class="gd">${logo}</div><div class="gl"><div class="dt" style="color:${c.primary};font-size:30px">${docLabel}</div><div style="font-size:10px;color:#888;margin-top:3px;letter-spacing:2px">${docNumber}</div></div></div>`
  };

  return layouts[tokens.headerLayout] || layouts.standard;
}

function closeSidebar(tokens: PDFEngineToken) {
  return tokens.headerLayout === 'sidebar' ? '</div></div>' : '';
}

// ── REUSABLE COMPONENTS ─────────────────────────────────────

function meta(label1: string, value1: string, sub1: string, label2: string, value2: string, label3?: string, value3?: string) {
  return `<div class="mt"><div><div class="ml">${label1}</div><div class="mv">${value1}</div><div class="ms">${sub1}</div></div><div style="text-align:right"><div class="ml">${label2}</div><div class="mv">${value2}</div>${label3 ? `<div class="ml" style="margin-top:6px">${label3}</div><div class="mv">${value3}</div>` : ''}</div></div>`;
}

function totals(subtotal: string, iva: string, descuento: string, total: string) {
  return `<div class="tots"><div class="tb"><div class="tr"><span>Subtotal</span><span>${subtotal}</span></div><div class="tr"><span>IVA (21%)</span><span>${iva}</span></div>${descuento ? `<div class="tr"><span>Descuento</span><span>${descuento}</span></div>` : ''}<div class="tr tt"><span>Total</span><span>${total}</span></div></div></div>`;
}

function footer(tenant: PDFEngineTenant) {
  return `<div class="ft"><div>IBAN: ${tenant.iban || 'ES12 3456 7890 1234 5678 9012'}</div><div>${tenant.email || 'info@ip-nexus.com'} · ${tenant.phone || '+34 912 345 678'}</div></div>`;
}

function footerSimple(tenant: PDFEngineTenant) {
  return `<div class="ft"><div>${tenant.name || 'IP-NEXUS Legal Tech S.L.'} · CIF: ${tenant.cif || 'B-87654321'}</div><div>${tenant.email || 'info@ip-nexus.com'}</div></div>`;
}

// ── DOCUMENT GENERATORS ─────────────────────────────────────
// Each function receives: (tokens, tenant, data) → HTML string

export const DOCUMENT_GENERATORS: Record<string, (tokens: PDFEngineToken, tenant: PDFEngineTenant, data: PDFEngineData) => string> = {
  factura: (tokens, tenant, data) => {
    const items = data.items || [
      { desc: 'Suscripción Professional — Feb 2026', price: '€299,00', qty: 1, total: '€299,00' },
      { desc: 'Módulo IA — Análisis de mercado', price: '€150,00', qty: 1, total: '€150,00' },
      { desc: 'Vigilancia de marcas — 5 marcas', price: '€45,00', qty: 5, total: '€225,00' },
      { desc: 'Integración API — EUIPO Connect', price: '€199,00', qty: 1, total: '€199,00' },
      { desc: 'Soporte prioritario mensual', price: '€75,00', qty: 1, total: '€75,00' },
    ];
    const rows = items.map(i => `<tr><td>${i.desc}</td><td>${i.price}</td><td>${i.qty}</td><td>${i.total}</td></tr>`).join('');
    
    return generateHeader(tokens, tenant, 'FACTURA', data.number || 'INV-2026-0042') +
      `<div class="bd">` +
      meta('Facturar a', data.clientName || 'García & Asociados S.L.', data.clientAddress || 'C/ Serrano 42, Madrid · CIF: B-12345678', 'Fecha', data.date || '03/02/2026', 'Vencimiento', data.dueDate || '03/03/2026') +
      `<table><thead><tr><th>Descripción</th><th>Precio</th><th>Ud.</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>` +
      totals(data.subtotal || '€948,00', data.iva || '€199,08', data.discount || '-€50,00', data.total || '€1.097,08') +
      footer(tenant) +
      `</div>` + closeSidebar(tokens);
  },

  presupuesto: (tokens, tenant, data) => {
    const items = data.items || [
      { desc: 'Setup plataforma IP-NEXUS Enterprise', price: '€4.500', qty: 1, total: '€4.500,00' },
      { desc: 'Migración portfolio (200+ marcas)', price: '€1.200', qty: 1, total: '€1.200,00' },
      { desc: 'Formación equipo — 8 usuarios', price: '€200', qty: 8, total: '€1.600,00' },
      { desc: 'Integración EUIPO + OEPM + WIPO', price: '€350', qty: 3, total: '€1.050,00' },
      { desc: 'Soporte premium — 12 meses', price: '€150', qty: 12, total: '€1.800,00' },
    ];
    const rows = items.map(i => `<tr><td>${i.desc}</td><td>${i.price}</td><td>${i.qty}</td><td>${i.total}</td></tr>`).join('');
    
    return generateHeader(tokens, tenant, 'PRESUPUESTO', data.number || 'PRE-2026-0089') +
      `<div class="bd">` +
      meta('Presupuesto para', data.clientName || 'López IP Consulting S.L.', data.clientAddress || 'Av. Constitución 18, Sevilla · CIF: B-99887766', 'Fecha', data.date || '03/02/2026', 'Válido hasta', data.validUntil || '05/03/2026') +
      `<table><thead><tr><th>Servicio propuesto</th><th>€/ud</th><th>Ud.</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>` +
      totals(data.subtotal || '€10.150,00', data.iva || '€2.131,50', data.discount || '-€1.000,00', data.total || '€11.281,50') +
      `<div style="margin-top:14px;padding:12px 14px;background:${tokens.colors.backgroundAlt};border-radius:5px;border-left:3px solid ${tokens.colors.accent}"><div class="ml" style="margin-bottom:4px">Condiciones</div><div style="font-size:10px;color:${tokens.colors.text};line-height:1.8">${data.conditions || '• 50% al aceptar · 50% a la entrega · Implementación: 4-6 semanas · 3 meses soporte post-implementación incluidos'}</div></div>` +
      footer(tenant) +
      `</div>` + closeSidebar(tokens);
  },

  certificado: (tokens, tenant, data) => {
    const c = tokens.colors;
    return generateHeader(tokens, tenant, 'CERTIFICADO', data.number || 'CERT-2026-0014') +
      `<div class="bd"><div class="cert-center">
      <div style="font-size:9px;color:${c.textMuted};text-transform:uppercase;letter-spacing:3px;margin-bottom:10px">${tenant.name || 'IP-NEXUS Legal Tech'} certifica que</div>
      <div class="cert-title">Registro de Marca Completado</div>
      <div class="cert-sub">Se ha completado satisfactoriamente el registro de la siguiente marca</div>
      <div class="cert-grid">
        <div class="cert-item"><div class="ml">Denominación</div><div class="mv" style="margin-top:4px">${data.trademark || 'AQUAFLOW™'}</div></div>
        <div class="cert-item"><div class="ml">Nº Registro</div><div class="mv" style="margin-top:4px">${data.registrationNo || '018956234'}</div></div>
        <div class="cert-item"><div class="ml">Oficina</div><div class="mv" style="margin-top:4px">${data.office || 'EUIPO'}</div></div>
        <div class="cert-item"><div class="ml">Fecha registro</div><div class="mv" style="margin-top:4px">${data.date || '03/02/2026'}</div></div>
        <div class="cert-item"><div class="ml">Clases Niza</div><div class="mv" style="margin-top:4px">${data.classes || '11, 32, 35'}</div></div>
        <div class="cert-item"><div class="ml">Titular</div><div class="mv" style="margin-top:4px">${data.holder || 'García & Asociados S.L.'}</div></div>
        <div class="cert-item"><div class="ml">Territorio</div><div class="mv" style="margin-top:4px">${data.territory || 'Unión Europea (27 estados)'}</div></div>
        <div class="cert-item"><div class="ml">Vencimiento</div><div class="mv" style="margin-top:4px">${data.expiry || '03/02/2036'}</div></div>
      </div>
      <div class="cert-seal">
        <div class="cert-seal-item"><div class="cert-seal-circle">✓</div><div class="ml">Verificado</div></div>
        <div class="cert-seal-item"><div class="cert-seal-circle">🔐</div><div class="ml">Autenticado</div></div>
        <div class="cert-seal-item"><div class="cert-seal-circle">📋</div><div class="ml">Registrado</div></div>
      </div>
      <div style="margin-top:20px;font-size:9px;color:${c.textMuted}">Código verificación: ${data.verificationCode || 'VER-2026-AQF-018956234'}</div>
      </div>` + footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  "nota-credito": (tokens, tenant, data) => {
    const c = tokens.colors;
    const items = data.items || [
      { desc: 'Suscripción Professional — Enero 2026 (4 días)', original: '€299,00', adjustment: '-€39,87' },
      { desc: 'Módulo IA no disponible — 4 días', original: '€150,00', adjustment: '-€20,00' },
    ];
    const rows = items.map(i => `<tr><td>${i.desc}</td><td>${i.original}</td><td>${i.adjustment}</td></tr>`).join('');

    return generateHeader(tokens, tenant, 'NOTA DE CRÉDITO', data.number || 'NC-2026-0018') +
      `<div class="bd">` +
      meta('Emitida a favor de', data.clientName || 'García & Asociados S.L.', data.clientAddress || 'C/ Serrano 42, Madrid · CIF: B-12345678', 'Fecha', data.date || '03/02/2026', 'Factura ref.', data.invoiceRef || 'INV-2026-0038') +
      `<div style="padding:10px 14px;background:${c.backgroundAlt};border-radius:5px;border-left:3px solid ${c.accent};margin-bottom:14px"><div class="ml" style="margin-bottom:3px">Motivo</div><div style="font-size:11px;color:${c.text}">${data.reason || 'Ajuste por servicios no prestados durante periodo de mantenimiento programado (15-18 Enero 2026)'}</div></div>` +
      `<table><thead><tr><th>Concepto</th><th>Importe original</th><th>Ajuste</th></tr></thead><tbody>${rows}</tbody></table>` +
      totals(data.subtotal || '-€59,87', data.iva || '-€12,57', '', data.total || '-€72,44') +
      `<div style="margin-top:14px;padding:10px 14px;background:${c.backgroundAlt};border-radius:5px"><div style="font-size:10px;color:${c.textMuted}">${data.note || 'Esta nota de crédito será aplicada a la próxima factura. Si prefiere reembolso, contacte con facturación.'}</div></div>` +
      footer(tenant) + `</div>` + closeSidebar(tokens);
  },

  recibo: (tokens, tenant, data) => {
    const c = tokens.colors;
    const invoices = data.invoices || [
      { number: 'INV-2026-0042', concept: 'Servicios IP-NEXUS — Febrero 2026', amount: '€1.097,08' },
    ];
    const rows = invoices.map(i => `<tr><td>${i.number}</td><td>${i.concept}</td><td>${i.amount}</td></tr>`).join('');

    return generateHeader(tokens, tenant, 'RECIBO DE PAGO', data.number || 'REC-2026-0055') +
      `<div class="bd">` +
      meta('Recibido de', data.clientName || 'García & Asociados S.L.', data.clientAddress || 'C/ Serrano 42, Madrid · CIF: B-12345678', 'Fecha', data.date || '03/02/2026', 'Método', data.paymentMethod || 'Transferencia') +
      `<div style="text-align:center;padding:20px 0;margin:16px 0;border:2px solid ${c.accent};border-radius:8px"><div style="font-size:10px;color:${c.textMuted};text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">Importe recibido</div><div style="font-family:${tokens.headFont};font-size:36px;font-weight:800;color:${c.primary}">${data.amount || '€1.097,08'}</div><div style="margin-top:8px"><span class="status st-ok">✓ PAGADO</span></div></div>` +
      `<table><thead><tr><th>Factura</th><th>Concepto</th><th>Importe</th></tr></thead><tbody>${rows}</tbody></table>` +
      `<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="padding:10px;background:${c.backgroundAlt};border-radius:5px"><div class="ml">Banco origen</div><div style="font-size:11px;color:${c.text};margin-top:3px">${data.bankOrigin || 'CaixaBank · ES98 7654 3210...'}</div></div>
      <div style="padding:10px;background:${c.backgroundAlt};border-radius:5px"><div class="ml">Referencia</div><div style="font-size:11px;color:${c.text};margin-top:3px">${data.transferRef || 'TRF-2026020301234'}</div></div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  carta: (tokens, tenant, data) => {
    const c = tokens.colors;
    const costItems = data.costs || [
      { desc: 'Tasa renovación EUIPO (1 clase)', amount: '€850,00' },
      { desc: 'Clase adicional (clase 42)', amount: '€150,00' },
      { desc: 'Gestión IP-NEXUS', amount: '€120,00' },
    ];
    const costRows = costItems.map(i => `<tr><td>${i.desc}</td><td>${i.amount}</td></tr>`).join('');

    return generateHeader(tokens, tenant, 'CARTA OFICIAL', data.reference || 'REF: IP/2026/CR-015') +
      `<div class="bd">` +
      meta('Destinatario', data.recipientName || 'D. Antonio Fernández García', data.recipientInfo || 'Dir. PI · Martínez & Asociados S.L.P. · Gran Vía 56, Madrid', 'Fecha', data.date || '03/02/2026', '', '') +
      `<div class="lt-s">${data.subject || 'Asunto: Renovación pendiente — Marca «INNOVATECH» Nº 018745623'}</div>
      <div class="lt-b">${data.body || `<p>Estimado Sr. Fernández:</p><p>Nos dirigimos a usted en relación con la marca comunitaria <strong>«INNOVATECH»</strong>, Nº 018745623 ante EUIPO, cuyo plazo de renovación vence el <strong>15 de abril de 2026</strong>.</p><p>El periodo de renovación ordinario está abierto. Recomendamos proceder a la brevedad para evitar recargos (art. 53 Reglamento UE 2017/1001).</p>`}</div>` +
      (costItems.length > 0 ? `<table><thead><tr><th>Concepto</th><th>Importe</th></tr></thead><tbody>${costRows}</tbody></table>` : '') +
      `<div class="lt-b" style="margin-top:14px">${data.closing || '<p>Puede autorizar la renovación desde su panel IP-NEXUS.</p><p>Cordial saludo,</p>'}</div>
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.signerName || 'Departamento de Gestión IP'}</div><div class="lt-sg-r">${data.signerRole || `${tenant.name || 'IP-NEXUS Legal Tech'} · Barcelona`}</div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  cease: (tokens, tenant, data) => {
    const c = tokens.colors;
    const requirements = data.requirements || [
      { title: '1. Cese inmediato', text: 'Cesen de inmediato todo uso de la denominación «NOVA-TECH» o cualquier signo confusamente similar en todos los canales comerciales, digitales y publicitarios.' },
      { title: '2. Retirada de materiales', text: 'Retiren todo material comercial, páginas web, redes sociales y packaging que contenga el signo infractor en un plazo máximo de 15 días naturales.' },
      { title: '3. Compromiso por escrito', text: 'Remitan confirmación escrita de cumplimiento en el plazo de 10 días hábiles desde la recepción de esta carta.' },
    ];
    const reqHTML = requirements.map(r => `<div class="clause"><div class="clause-h">${r.title}</div><div class="clause-p">${r.text}</div></div>`).join('');

    return generateHeader(tokens, tenant, 'CEASE & DESIST', data.reference || 'C&D/2026/TM-003') +
      `<div class="bd">` +
      meta('Dirigido a', data.infringerName || 'TechBrand Solutions GmbH', data.infringerAddress || 'Friedrichstraße 108, 10117 Berlín, Alemania', 'Fecha', data.date || '03/02/2026', 'En nombre de', data.clientName || 'García & Asociados S.L.') +
      `<div class="lt-s">${data.subject || 'RE: Infracción de marca registrada — «NOVATECH» Nº 018623451 (EUIPO)'}</div>
      <div class="lt-b">
      ${data.body || `<p>Estimados señores:</p>
      <p>Actuamos en representación de <strong>García & Asociados S.L.</strong>, titular de la marca de la Unión Europea <strong>«NOVATECH»</strong> (Nº 018623451), registrada en clases 9, 35 y 42 de la Clasificación de Niza, con fecha de registro 14/03/2019.</p>
      <p>Hemos tenido conocimiento de que su empresa está utilizando la denominación <strong>«NOVA-TECH»</strong> en conexión con servicios de software y consultoría tecnológica en territorio de la Unión Europea, lo cual constituye una <strong>infracción directa</strong> de los derechos de marca de nuestro cliente conforme al artículo 9(2) del Reglamento (UE) 2017/1001.</p>
      <p>Por la presente, les requerimos formalmente que:</p>`}
      </div>
      <div style="margin:12px 0">${reqHTML}</div>
      <div class="lt-b">${data.closing || '<p>En caso de no recibir respuesta satisfactoria, nos veremos obligados a iniciar las acciones legales pertinentes, incluyendo la solicitud de medidas cautelares e indemnización por daños y perjuicios.</p><p>Atentamente,</p>'}</div>
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.signerName || 'Dpto. Litigios IP'}</div><div class="lt-sg-r">${data.signerRole || `${tenant.name || 'IP-NEXUS Legal Tech'} · En representación de García & Asociados S.L.`}</div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  acta: (tokens, tenant, data) => {
    const c = tokens.colors;
    const deadlines = data.deadlines || [
      { subject: 'Renovación INNOVATECH (EUIPO)', deadline: '15/04/2026', status: 'warn', statusText: 'Pendiente' },
      { subject: 'Contestación oposición', deadline: '01/03/2026', status: 'urg', statusText: 'Urgente' },
      { subject: 'Renovación SMARTFLOW (OEPM)', deadline: '22/05/2026', status: 'ok', statusText: 'Planificado' },
    ];
    const statusClass = { urg: 'st-urg', warn: 'st-warn', ok: 'st-ok' };
    const dlRows = deadlines.map(d => `<tr><td>${d.subject}</td><td>${d.deadline}</td><td><span class="status ${statusClass[d.status]}">${d.statusText}</span></td></tr>`).join('');

    return generateHeader(tokens, tenant, 'ACTA DE REUNIÓN', data.number || 'ACT-2026-0012') +
      `<div class="bd">` +
      meta('Cliente', data.clientName || 'García & Asociados S.L.', data.meetingSubject || 'Revisión trimestral de portfolio', 'Fecha', data.date || '03/02/2026', 'Duración', data.duration || '45 min') +
      `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div style="padding:10px;background:${c.backgroundAlt};border-radius:5px"><div class="ml">Asistentes (${tenant.name || 'IP-NEXUS'})</div><div style="font-size:10px;color:${c.text};margin-top:3px">${data.teamAttendees || 'Elena Rodríguez — Account Manager<br>Carlos Vega — IP Analyst'}</div></div>
      <div style="padding:10px;background:${c.backgroundAlt};border-radius:5px"><div class="ml">Asistentes (Cliente)</div><div style="font-size:10px;color:${c.text};margin-top:3px">${data.clientAttendees || 'Dña. María García — Socia Directora<br>D. Javier López — Responsable IP'}</div></div></div>` +
      `<div class="rp-h">1. Estado del Portfolio</div>
      <div class="rp-p">${data.section1 || 'Se revisó el estado actual: 47 marcas activas y 12 patentes vigentes. Se confirmó que las 3 marcas registradas en Q4 2025 ya figuran correctamente en el sistema.'}</div>` +
      `<div class="rp-h">2. Plazos Críticos</div>` +
      `<table><thead><tr><th>Asunto</th><th>Plazo</th><th>Estado</th></tr></thead><tbody>${dlRows}</tbody></table>` +
      `<div class="rp-h">3. Acuerdos Adoptados</div>
      <div class="rp-p">${data.agreements || '① Autorizar renovación de INNOVATECH antes del 31/03 · ② Preparar escrito de contestación a oposición para revisión del cliente antes del 15/02 · ③ Evaluar extensión de SMARTFLOW a UK y Suiza — informe para próxima reunión · ④ Programar revisión de la estrategia de vigilancia para incluir mercado asiático.'}</div>` +
      `<div class="rp-h">4. Próxima Reunión</div>
      <div class="rp-p">${data.nextMeeting || 'Fecha propuesta: 5 de mayo de 2026 · Formato: Videollamada · Agenda: Resultados oposición, plan extensión internacional, informe vigilancia Q1.'}</div>` +
      `<div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.signerName || 'Elena Rodríguez'}</div><div class="lt-sg-r">${data.signerRole || `Account Manager · ${tenant.name || 'IP-NEXUS'}`}</div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  informe: (tokens, tenant, data) => {
    const c = tokens.colors;
    const stats = data.stats || [
      { value: '47', label: 'Marcas' },
      { value: '12', label: 'Patentes' },
      { value: '3', label: 'Acciones pend.' },
      { value: '14', label: 'Jurisdicciones' },
    ];
    const statsHTML = stats.map(s => `<div class="sgi"><div class="sgn">${s.value}</div><div class="sgl">${s.label}</div></div>`).join('');
    
    const deadlines = data.deadlines || [
      { asset: 'INNOVATECH Nº 018745623', type: 'Renovación', office: 'EUIPO', deadline: '15/04/2026' },
      { asset: 'SMARTFLOW Nº ES3842156', type: 'Renovación', office: 'OEPM', deadline: '22/05/2026' },
      { asset: 'INNOVATECH (Oposición)', type: 'Contestación', office: 'EUIPO', deadline: '01/03/2026' },
    ];
    const dlRows = deadlines.map(d => `<tr><td>${d.asset}</td><td>${d.type}</td><td>${d.office}</td><td>${d.deadline}</td></tr>`).join('');

    return generateHeader(tokens, tenant, 'INFORME', data.number || 'RPT-2026-Q1-007') +
      `<div class="bd">
      <div class="rp-t">${data.title || 'Informe de Portfolio de Propiedad Industrial'}</div>
      <div class="rp-su">${data.subtitle || 'Cliente: García & Asociados S.L. · Periodo: Q1 2026'}</div>` +
      meta('Preparado para', data.recipientName || 'Dña. María García López', data.recipientRole || 'Socia Directora', 'Fecha', data.date || '03/02/2026', '', '') +
      `<div class="sg">${statsHTML}</div>` +
      `<div class="rp-h">1. Resumen Ejecutivo</div>
      <div class="rp-p">${data.executiveSummary || 'Portfolio estable en 14 jurisdicciones. 3 acciones urgentes: 2 renovaciones y 1 oposición contra «INNOVATECH» en clase 42.'}</div>` +
      `<div class="rp-h">2. Plazos Críticos</div>
      <table><thead><tr><th>Activo</th><th>Tipo</th><th>Oficina</th><th>Plazo</th></tr></thead><tbody>${dlRows}</tbody></table>` +
      `<div class="rp-h">3. Vigilancia IA</div>
      <div class="rp-p">${data.aiWatch || '8 solicitudes conflictivas detectadas: 5 riesgo bajo, 2 medio, 1 alto. Recomendación: evaluar oposición contra «INNOVA-TECH SOLUTIONS» (Nº 019283746) clases 9 y 42.'}</div>` +
      `<div class="rp-h">4. Recomendaciones</div>
      <div class="rp-p">${data.recommendations || '① Renovar INNOVATECH antes del 15/04 · ② Contestar oposición antes del 01/03 · ③ Evaluar oposición contra INNOVA-TECH SOLUTIONS · ④ Extender SMARTFLOW a UK y Suiza.'}</div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  vigilancia: (tokens, tenant, data) => {
    const c = tokens.colors;
    const stats = data.stats || [
      { value: '23', label: 'Solicitudes analizadas' },
      { value: '3', label: 'Alertas activas' },
      { value: '1', label: 'Riesgo alto', highlight: true },
      { value: '96%', label: 'Precisión IA' },
    ];
    const statsHTML = stats.map(s => `<div class="sgi"><div class="sgn">${s.value}</div><div class="sgl"${s.highlight ? ` style="color:${c.accent}"` : ''}>${s.label}</div></div>`).join('');

    const alerts = data.alerts || [
      { name: 'INNOVA-TECH SOLUTIONS', classes: '9, 42', office: 'EUIPO', similarity: '87%', risk: 'urg', riskText: 'Alto' },
      { name: 'SMARTFLOW PRO', classes: '9', office: 'OEPM', similarity: '72%', risk: 'warn', riskText: 'Medio' },
      { name: 'NOVATEK DIGITAL', classes: '35', office: 'WIPO', similarity: '65%', risk: 'warn', riskText: 'Medio' },
    ];
    const statusClass = { urg: 'st-urg', warn: 'st-warn', ok: 'st-ok' };
    const alertRows = alerts.map(a => `<tr><td>${a.name}</td><td>${a.classes}</td><td>${a.office}</td><td>${a.similarity}</td><td><span class="status ${statusClass[a.risk]}">${a.riskText}</span></td></tr>`).join('');

    return generateHeader(tokens, tenant, 'VIGILANCIA', data.number || 'VIG-2026-W05') +
      `<div class="bd">
      <div class="rp-t">${data.title || 'Informe de Vigilancia de Marcas'}</div>
      <div class="rp-su">${data.subtitle || 'Semana 5 · 27 Ene – 02 Feb 2026 · Generado por IA'}</div>` +
      meta('Cliente', data.clientName || 'García & Asociados S.L.', data.clientInfo || '47 marcas monitorizadas', 'Fecha', data.date || '03/02/2026', '', '') +
      `<div class="sg">${statsHTML}</div>` +
      `<div class="rp-h">Alertas de Alta Prioridad</div>
      <table><thead><tr><th>Solicitud detectada</th><th>Clase</th><th>Oficina</th><th>Similitud</th><th>Riesgo</th></tr></thead><tbody>${alertRows}</tbody></table>` +
      `<div class="rp-h">Análisis Detallado — Riesgo Alto</div>
      <div class="clause"><div class="clause-h">${data.highRiskName || 'INNOVA-TECH SOLUTIONS (Nº 019283746)'}</div><div class="clause-p">${data.highRiskAnalysis || 'Solicitante: TechBrand Solutions GmbH (Alemania) · Fecha solicitud: 20/01/2026 · Clases 9 y 42 · Similitud fonética: 87% · Similitud conceptual: 82% · Superposición de clases: total. <strong>Recomendación IA: Presentar oposición en plazo de 3 meses.</strong>'}</div></div>` +
      `<div class="rp-h">Marcas Sin Incidencias</div>
      <div class="rp-p">${data.noIncidents || 'Las restantes 44 marcas del portfolio no presentan conflictos detectados esta semana. Cobertura: EUIPO, OEPM, USPTO, WIPO, JPO, CNIPA, UKIPO.'}</div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  contrato: (tokens, tenant, data) => {
    const c = tokens.colors;
    const clauses = data.clauses || [
      { title: 'PRIMERA — Objeto del contrato', text: 'El PRESTADOR se compromete a prestar al CLIENTE los servicios de gestión de propiedad industrial a través de la plataforma IP-NEXUS, incluyendo: vigilancia de marcas, gestión de renovaciones, análisis de mercado mediante IA, y soporte técnico especializado.' },
      { title: 'SEGUNDA — Duración', text: 'El presente contrato tendrá una duración de 12 meses desde su firma, renovándose automáticamente por periodos iguales salvo comunicación en contrario con 30 días de antelación.' },
      { title: 'TERCERA — Contraprestación', text: 'El CLIENTE abonará la cantidad de €499,00/mes (más IVA) correspondiente al plan Enterprise. El pago se realizará mediante domiciliación bancaria los primeros 5 días de cada mes.' },
      { title: 'CUARTA — Obligaciones del prestador', text: 'Mantener la plataforma operativa con una disponibilidad mínima del 99,5%. Notificar plazos críticos con un mínimo de 90 días de antelación. Garantizar la confidencialidad de todos los datos del portfolio del cliente.' },
      { title: 'QUINTA — Protección de datos', text: 'Ambas partes se comprometen al cumplimiento del RGPD (Reglamento UE 2016/679) y la LOPDGDD. El PRESTADOR actuará como encargado del tratamiento conforme al art. 28 del RGPD.' },
      { title: 'SEXTA — Resolución', text: 'Cualquiera de las partes podrá resolver el contrato por incumplimiento grave, previa comunicación fehaciente con 15 días de antelación y posibilidad de subsanación.' },
    ];
    const clausesHTML = clauses.map(cl => `<div class="cl-n">${cl.title}</div><div class="cl-t">${cl.text}</div>`).join('');

    return generateHeader(tokens, tenant, 'CONTRATO', data.number || 'CTR-2026-0033') +
      `<div class="bd">` +
      meta('Prestador', tenant.name || 'IP-NEXUS Legal Tech S.L.', tenant.cif ? `CIF: ${tenant.cif} · ${tenant.city || 'Barcelona'}` : 'CIF: B-87654321 · Barcelona', 'Cliente', data.clientName || 'García & Asociados S.L.', 'CIF', data.clientCif || 'B-12345678') +
      `<div class="rp-t">${data.title || 'Contrato de Prestación de Servicios IP'}</div>
      <div class="rp-su">${data.subtitle || 'Gestión integral de propiedad industrial'}</div>` +
      clausesHTML +
      `<div style="display:flex;gap:30px;margin-top:24px">
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${tenant.name || 'IP-NEXUS Legal Tech S.L.'}</div><div class="lt-sg-r">Representante legal</div></div>
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.clientName || 'García & Asociados S.L.'}</div><div class="lt-sg-r">Representante legal</div></div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  nda: (tokens, tenant, data) => {
    const c = tokens.colors;
    const clauses = data.clauses || [
      { title: '1. Definición de información confidencial', text: 'Se considera Información Confidencial toda información técnica, comercial, financiera o de cualquier otra naturaleza, divulgada por cualquiera de las Partes, incluyendo pero no limitada a: datos de clientes, portfolios de PI, algoritmos de IA, estrategias de negocio, código fuente y datos financieros.' },
      { title: '2. Obligaciones de la parte receptora', text: 'La Parte Receptora se compromete a: (a) mantener la información en estricta confidencialidad; (b) no divulgarla a terceros sin consentimiento previo por escrito; (c) utilizarla exclusivamente para el fin acordado; (d) limitar el acceso al personal estrictamente necesario.' },
      { title: '3. Exclusiones', text: 'No se considerará Información Confidencial aquella que: sea de dominio público, haya sido conocida previamente por la Parte Receptora, sea desarrollada de forma independiente, o deba ser divulgada por requerimiento legal.' },
      { title: '4. Duración', text: 'Las obligaciones de confidencialidad se mantendrán vigentes durante 3 años desde la fecha de firma del presente acuerdo, incluso tras la finalización de la relación comercial entre las Partes.' },
      { title: '5. Legislación aplicable', text: 'El presente acuerdo se regirá por la legislación española. Para cualquier controversia, las Partes se someten a los Juzgados y Tribunales de Barcelona.' },
    ];
    const clausesHTML = clauses.map(cl => `<div class="clause"><div class="clause-h">${cl.title}</div><div class="clause-p">${cl.text}</div></div>`).join('');

    return generateHeader(tokens, tenant, 'NDA', data.number || 'NDA-2026-0021') +
      `<div class="bd">` +
      meta('Parte divulgadora', data.discloser || tenant.name || 'IP-NEXUS Legal Tech S.L.', data.discloserCif || `CIF: ${tenant.cif || 'B-87654321'}`, 'Parte receptora', data.recipient || 'InnoVentures Capital S.A.', 'CIF', data.recipientCif || 'A-55443322') +
      `<div class="rp-t">${data.title || 'Acuerdo de Confidencialidad'}</div>
      <div class="rp-su">${data.subtitle || 'Non-Disclosure Agreement · Bilateral'}</div>` +
      clausesHTML +
      `<div style="display:flex;gap:30px;margin-top:24px">
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.discloser || tenant.name || 'IP-NEXUS Legal Tech S.L.'}</div><div class="lt-sg-r">Parte Divulgadora</div></div>
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.recipient || 'InnoVentures Capital S.A.'}</div><div class="lt-sg-r">Parte Receptora</div></div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  licencia: (tokens, tenant, data) => {
    const c = tokens.colors;
    const details = data.trademarkDetails || [
      { label: 'Denominación', value: 'NOVATECH™' },
      { label: 'Nº Registro EUIPO', value: '018623451' },
      { label: 'Clases Niza', value: '9, 35, 42' },
      { label: 'Territorio', value: 'Unión Europea' },
      { label: 'Tipo de licencia', value: 'No exclusiva' },
      { label: 'Duración', value: '3 años (renovable)' },
    ];
    const detailRows = details.map(d => `<tr><td>${d.label}</td><td>${d.value}</td></tr>`).join('');

    const clauses = data.clauses || [
      { title: '1. Alcance de la licencia', text: 'El Licenciante concede al Licenciatario una licencia no exclusiva para el uso de la marca NOVATECH en la comercialización de productos de software en las clases 9 y 42 dentro del territorio de la Unión Europea.' },
      { title: '2. Canon (Royalties)', text: 'El Licenciatario abonará un canon del 5% sobre las ventas netas de productos comercializados bajo la marca, con un mínimo garantizado de €12.000/año. Liquidación trimestral dentro de los 30 días siguientes al cierre de cada trimestre.' },
      { title: '3. Control de calidad', text: 'El Licenciatario se compromete a mantener los estándares de calidad establecidos por el Licenciante. El Licenciante se reserva el derecho de inspección y aprobación previa de los materiales comerciales.' },
      { title: '4. Registro de licencia', text: 'Las partes acuerdan inscribir la presente licencia en el registro de EUIPO. Los costes de inscripción serán asumidos por el Licenciatario.' },
    ];
    const clausesHTML = clauses.map(cl => `<div class="cl-n">${cl.title}</div><div class="cl-t">${cl.text}</div>`).join('');

    return generateHeader(tokens, tenant, 'LICENCIA', data.number || 'LIC-2026-0009') +
      `<div class="bd">` +
      meta('Licenciante', data.licensor || 'García & Asociados S.L.', data.licensorInfo || 'Titular de marca registrada', 'Licenciatario', data.licensee || 'NovaDist Ibérica S.L.', 'CIF', data.licenseeCif || 'B-77665544') +
      `<div class="rp-t">${data.title || 'Acuerdo de Licencia de Marca'}</div>
      <div class="rp-su">${data.subtitle || 'Licencia de uso de marca «NOVATECH» — No exclusiva'}</div>` +
      `<table><thead><tr><th>Detalle de la marca</th><th>Valor</th></tr></thead><tbody>${detailRows}</tbody></table>` +
      clausesHTML +
      `<div style="display:flex;gap:30px;margin-top:24px">
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.licensor || 'García & Asociados S.L.'}</div><div class="lt-sg-r">Licenciante</div></div>
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.licensee || 'NovaDist Ibérica S.L.'}</div><div class="lt-sg-r">Licenciatario</div></div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  poder: (tokens, tenant, data) => {
    const c = tokens.colors;
    const offices = data.offices || [
      { flag: '🇪🇺', name: 'EUIPO' },
      { flag: '🇪🇸', name: 'OEPM' },
      { flag: '🌐', name: 'WIPO' },
    ];
    const officesHTML = offices.map(o => `<div style="padding:10px;background:${c.backgroundAlt};border-radius:5px;text-align:center"><div style="font-size:16px">${o.flag}</div><div class="ml" style="margin-top:4px">${o.name}</div></div>`).join('');

    return generateHeader(tokens, tenant, 'PODER NOTARIAL', data.number || 'POD-2026-0007') +
      `<div class="bd">
      <div style="text-align:center;padding:20px 0">
      <div style="font-family:${tokens.headFont};font-size:24px;font-weight:800;color:${c.primary}">PODER DE REPRESENTACIÓN</div>
      <div style="font-size:10px;color:${c.textMuted};margin-top:4px">Procedimientos ante Oficinas de Propiedad Industrial</div></div>` +
      meta('Poderdante', data.grantor || 'García & Asociados S.L.', data.grantorInfo || 'CIF: B-12345678 · Madrid', 'Apoderado', data.attorney || tenant.name || 'IP-NEXUS Legal Tech S.L.', 'CIF', data.attorneyCif || tenant.cif || 'B-87654321') +
      `<div class="lt-b" style="margin-top:14px">
      <p>${data.introText || `<strong>${data.grantor || 'García & Asociados S.L.'}</strong>, con domicilio en ${data.grantorAddress || 'Calle Serrano 42, 28001 Madrid'}, representada por ${data.grantorRepresentative || 'D.ª María García López'} en calidad de ${data.grantorRole || 'Socia Directora'}, <strong>OTORGA</strong> poder de representación a favor de <strong>${data.attorney || tenant.name || 'IP-NEXUS Legal Tech S.L.'}</strong> para actuar en su nombre y representación ante las siguientes oficinas:`}</p></div>` +
      `<div style="display:grid;grid-template-columns:repeat(${offices.length},1fr);gap:8px;margin:12px 0">${officesHTML}</div>` +
      `<div class="clause"><div class="clause-h">Facultades concedidas</div><div class="clause-p">${data.faculties || 'Presentar, tramitar y gestionar solicitudes de registro, renovaciones, modificaciones y respuestas a acciones oficiales · Recibir notificaciones y comunicaciones oficiales · Presentar oposiciones y contestaciones · Solicitar certificaciones y copias · Realizar pagos de tasas oficiales en nombre del Poderdante.'}</div></div>` +
      `<div class="clause"><div class="clause-h">Vigencia</div><div class="clause-p">${data.validity || 'El presente poder tendrá vigencia indefinida hasta su revocación expresa por escrito por parte del Poderdante. La revocación surtirá efecto frente a las oficinas desde su comunicación formal.'}</div></div>` +
      `<div style="display:flex;gap:30px;margin-top:24px">
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.grantorRepresentative || 'D.ª María García López'}</div><div class="lt-sg-r">Poderdante · ${data.grantor || 'García & Asociados S.L.'}</div></div>
      <div class="lt-sg"><div class="lt-sg-l"></div><div class="lt-sg-n">${data.attorney || tenant.name || 'IP-NEXUS Legal Tech S.L.'}</div><div class="lt-sg-r">Apoderado</div></div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },

  renovacion: (tokens, tenant, data) => {
    const c = tokens.colors;
    const trademarks = data.trademarks || [
      { name: 'INNOVATECH', number: '018745623', office: 'EUIPO', classes: '9, 35, 42', expiry: '15/04/2026', status: 'warn', statusText: 'Urgente' },
      { name: 'SMARTFLOW', number: 'ES3842156', office: 'OEPM', classes: '9, 42', expiry: '22/05/2026', status: 'ok', statusText: 'Planif.' },
      { name: 'GLOBALFIN', number: '019012345', office: 'WIPO', classes: '36', expiry: '30/06/2026', status: 'ok', statusText: 'Planif.' },
    ];
    const statusClass = { urg: 'st-urg', warn: 'st-warn', ok: 'st-ok' };
    const tmRows = trademarks.map(t => `<tr><td><strong>${t.name}</strong></td><td>${t.number}</td><td>${t.office}</td><td>${t.classes}</td><td>${t.expiry}</td><td><span class="status ${statusClass[t.status]}">${t.statusText}</span></td></tr>`).join('');

    const costs = data.costs || [
      { desc: 'Tasa renovación EUIPO (primera clase)', amount: '€850,00' },
      { desc: 'Clases adicionales (35, 42)', amount: '€300,00' },
      { desc: 'Gestión y seguimiento IP-NEXUS', amount: '€120,00' },
    ];
    const costRows = costs.map(co => `<tr><td>${co.desc}</td><td>${co.amount}</td></tr>`).join('');

    return generateHeader(tokens, tenant, 'RENOVACIÓN', data.number || 'REN-2026-0031') +
      `<div class="bd">` +
      meta('Titular', data.holder || 'García & Asociados S.L.', data.holderCif || 'CIF: B-12345678', 'Emisión', data.date || '03/02/2026', '', '') +
      `<div style="text-align:center;padding:16px;margin:10px 0;border:2px solid ${c.accent};border-radius:8px">
      <div style="font-size:9px;color:${c.textMuted};text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">Próximo vencimiento</div>
      <div style="font-family:${tokens.headFont};font-size:32px;font-weight:800;color:${c.primary}">${data.nextExpiry || '15 Abril 2026'}</div>
      <div style="margin-top:6px"><span class="status st-warn">${data.countdownText || '⏳ 71 DÍAS RESTANTES'}</span></div></div>` +
      `<table><thead><tr><th>Marca</th><th>Nº Registro</th><th>Oficina</th><th>Clases</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody>${tmRows}</tbody></table>` +
      `<div class="rp-h">${data.costBreakdownTitle || 'Desglose de Costes — INNOVATECH'}</div>` +
      `<table><thead><tr><th>Concepto</th><th>Importe</th></tr></thead><tbody>${costRows}</tbody></table>` +
      `<div class="tots"><div class="tb"><div class="tr"><span>Subtotal</span><span>${data.subtotal || '€1.270,00'}</span></div><div class="tr"><span>IVA gestión (21%)</span><span>${data.iva || '€25,20'}</span></div><div class="tr tt"><span>Total</span><span>${data.total || '€1.295,20'}</span></div></div></div>` +
      `<div style="margin-top:14px;padding:12px;background:${c.backgroundAlt};border-radius:5px;border-left:3px solid ${c.accent}"><div style="font-size:10px;color:${c.text};line-height:1.8">${data.actionRequired || '<strong>⚠️ Acción requerida:</strong> Autorice la renovación desde su panel IP-NEXUS o responda a este aviso. Si no se renueva antes del 15/04/2026, se aplicará recargo del 25% durante el periodo de gracia de 6 meses.'}</div></div>` +
      footerSimple(tenant) + `</div>` + closeSidebar(tokens);
  },
};

// ── MAIN RENDER FUNCTION ────────────────────────────────────

/**
 * Generates a complete HTML document ready for PDF conversion
 * @param {string} styleId - One of the 18 style IDs
 * @param {string} docType - One of the 15 document type IDs
 * @param {object} tenant - Tenant data (name, email, phone, address, etc.)
 * @param {object} data - Document-specific data
 * @returns {string} Complete HTML document
 */
export function generateDocumentHTML(styleId: string, docType: string, tenant: PDFEngineTenant = {}, data: PDFEngineData = {}) {
  const tokens = (DESIGN_TOKENS as Record<string, PDFEngineToken>)[styleId];
  if (!tokens) throw new Error(`Unknown style: ${styleId}`);
  
  const generator = DOCUMENT_GENERATORS[docType];
  if (!generator) throw new Error(`Unknown document type: ${docType}`);

  const css = getBaseCSS(tokens);
  const body = generator(tokens, tenant, data);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  <div class="doc">${body}</div>
</body>
</html>`;
}

// ── USAGE EXAMPLE ───────────────────────────────────────────
/*
  // In a Supabase Edge Function or client-side:
  
  import { generateDocumentHTML } from './pdf-engine';
  
  const html = generateDocumentHTML('moderno', 'factura', {
    name: 'Mi Despacho S.L.',
    email: 'info@midespacho.com',
    phone: '+34 912 345 678',
    address: 'Calle Mayor 1, Madrid',
    cif: 'B-12345678',
    iban: 'ES12 3456 7890 1234 5678 9012'
  }, {
    number: 'INV-2026-0042',
    date: '03/02/2026',
    dueDate: '03/03/2026',
    clientName: 'García & Asociados S.L.',
    clientAddress: 'C/ Serrano 42, Madrid · CIF: B-12345678',
    items: [
      { desc: 'Suscripción Pro', price: '€299', qty: 1, total: '€299,00' },
    ],
    subtotal: '€299,00',
    iva: '€62,79',
    total: '€361,79'
  });
  
  // Convert to PDF using puppeteer, playwright, or html-pdf:
  // const pdf = await htmlToPdf(html);
*/
