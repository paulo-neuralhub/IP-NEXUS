import { useState } from "react";

// ============================================================
// IP-NEXUS — A1 SILK FINAL · "Line-defined Elegance"
//
// Philosophy:
//   Cards = subtle borders (paper on paper)
//   Neumorphic = ONLY badges + tongue + primary buttons (brand signature)
//   Typography + color = hierarchy
//   No purple — clean blue palette (#2563eb replaces violet)
//   Company badge in sidebar for corporate identity
//   Result: silk-smooth, enterprise confidence
// ============================================================

const bg = "#f1f4f9";
const accent = "#00b4d8";
const accentG = "#00d4aa";
const navy = "#0a2540";
const glow = "rgba(0,180,216,0.30)";
const glowSm = "rgba(0,180,216,0.15)";
const txt = "#334155";
const txtL = "#94a3b8";
const txtM = "#64748b";
const border = "1px solid rgba(0,0,0,0.06)";
const borderA = "1px solid rgba(0,180,216,0.15)";
const divider = "rgba(0,0,0,0.04)";

// Only neumorphic shadows — used sparingly
const neu = "4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff";
const neuSm = "3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff";
const inset = "inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff";

// ── Badge: neumorphic — the brand signature ──
const Badge = ({ value, label, color, size = "md" }) => {
  const s = { sm: [34, 34, 10, 12, 7], md: [46, 46, 12, 16, 8], lg: [54, 54, 14, 19, 9] }[size];
  return (
    <div style={{
      width: s[0], height: s[1], borderRadius: s[2], flexShrink: 0,
      background: bg, boxShadow: neu,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: `linear-gradient(to top, ${color}0c, transparent)`, borderRadius: s[2] }} />
      <div style={{ position: "absolute", bottom: 0, left: "18%", right: "18%", height: 2, background: color, borderRadius: 2, opacity: 0.25, boxShadow: `0 0 5px ${color}30` }} />
      <span style={{ fontSize: s[3], fontWeight: 200, color, position: "relative", lineHeight: 1 }}>{value}</span>
      {label && <span style={{ fontSize: s[4], color: txtL, position: "relative", marginTop: 1 }}>{label}</span>}
    </div>
  );
};

// ── Section title: clean typography, no container ──
const Title = ({ children, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
    <span style={{ fontSize: 13, fontWeight: 700, color: navy, letterSpacing: 0.15 }}>{children}</span>
    {right && <span style={{ fontSize: 11, color: accent, cursor: "pointer", fontWeight: 500 }}>{right}</span>}
  </div>
);

// ── Primary button: gradient + glow (one of 3 neu touch-points) ──
const Btn = ({ children, primary, style: sx = {} }) => (
  <div style={{
    padding: "8px 16px", borderRadius: 11, fontSize: 13, cursor: "pointer",
    fontWeight: primary ? 600 : 400,
    background: primary ? `linear-gradient(135deg, ${accent}, ${accentG})` : bg,
    color: primary ? "#fff" : txtM,
    boxShadow: primary ? `0 3px 12px ${glowSm}` : neuSm,
    display: "inline-flex", alignItems: "center", gap: 6,
    position: "relative", overflow: "hidden", ...sx,
  }}>
    {children}
    {primary && <div style={{ position: "absolute", bottom: 0, left: "22%", right: "22%", height: 2, background: "rgba(255,255,255,0.4)", borderRadius: 2 }} />}
  </div>
);

// ── Tabs: inset container (subtle) ──
const Tabs = ({ tabs, active, onChange, style: sx = {} }) => (
  <div style={{ display: "inline-flex", gap: 3, padding: 3, borderRadius: 11, background: bg, boxShadow: inset, ...sx }}>
    {tabs.map((t, i) => (
      <div key={i} onClick={() => onChange(i)} style={{
        padding: "7px 15px", borderRadius: 9, fontSize: 12, fontWeight: 600,
        cursor: "pointer", whiteSpace: "nowrap",
        background: active === i ? bg : "transparent",
        boxShadow: active === i ? neuSm : "none",
        color: active === i ? navy : txtL,
        position: "relative",
      }}>
        {t}
        {active === i && <div style={{ position: "absolute", bottom: 1, left: "30%", right: "30%", height: 2, background: accent, borderRadius: 2 }} />}
      </div>
    ))}
  </div>
);

const Progress = ({ value, color, width = 100 }) => (
  <div style={{ width }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <span style={{ fontSize: 9, color: txtL }}>Progreso</span>
      <span style={{ fontSize: 9, fontWeight: 700, color }}>{value}%</span>
    </div>
    <div style={{ height: 4, borderRadius: 3, background: "rgba(0,0,0,0.04)" }}>
      <div style={{ width: `${value}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 4px ${color}18` }} />
    </div>
  </div>
);

const Insight = ({ icon, children }) => (
  <div style={{
    padding: "11px 16px", borderRadius: 12, marginTop: 18,
    background: `linear-gradient(135deg, rgba(0,180,216,0.03), rgba(0,212,170,0.02))`,
    border: "1px solid rgba(0,180,216,0.08)",
    display: "flex", alignItems: "center", gap: 10,
  }}>
    <span style={{ fontSize: 15 }}>{icon}</span>
    <span style={{ fontSize: 12, color: txt }}>{children}</span>
  </div>
);

// ============================================================
// SIDEBAR
// ============================================================
const Sidebar = ({ active, onChange }) => {
  const items = [
    { id: "dashboard", icon: "◆", label: "Dashboard" },
    { id: "expedientes", icon: "◈", label: "Expedientes", badge: 15 },
    { id: "expediente", icon: "◈", label: "  → Detalle", sub: true },
    { id: "plazos", icon: "◇", label: "Plazos", badge: 3 },
    { id: "tareas", icon: "○", label: "Tareas", badge: 7 },
    { id: "crm", icon: "◎", label: "CRM" },
    { id: "vigilancia", icon: "⬡", label: "Vigilancia", badge: 2 },
    { id: "ia", icon: "△", label: "IA Análisis" },
  ];
  return (
    <div style={{
      width: 230, minWidth: 230, padding: "22px 0 18px 16px",
      background: `linear-gradient(180deg, ${navy} 0%, #0f4c75 50%, #145374 100%)`,
      display: "flex", flexDirection: "column", position: "relative",
    }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, background: "radial-gradient(ellipse at bottom, rgba(0,180,216,0.06), transparent)", pointerEvents: "none" }} />

      {/* Logo + Branding */}
      <div style={{ marginBottom: 28, padding: "0 8px", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}, ${accentG})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 3px 14px ${glow}`, fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: -1,
          }}>IP</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>IP-NEXUS</div>
            <div style={{ color: "rgba(255,255,255,0.28)", fontSize: 8, letterSpacing: 2.5, fontWeight: 500 }}>PLATAFORMA IP</div>
          </div>
        </div>
        {/* Company badge — subtle branded touch */}
        <div style={{
          padding: "7px 10px", borderRadius: 8,
          background: "rgba(0,180,216,0.06)",
          border: "1px solid rgba(0,180,216,0.1)",
          display: "flex", alignItems: "center", gap: 7,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: accent, boxShadow: `0 0 6px ${glow}`,
          }} />
          <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5 }}>MERIDIAN IP CONSULTING</span>
        </div>
      </div>

      {/* Menu — tongue connector */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, zIndex: 1 }}>
        {items.map((item) => {
          const isA = active === item.id;
          return (
            <div key={item.id} onClick={() => onChange(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: item.sub ? "7px 12px 7px 26px" : "10px 12px",
              borderRadius: isA ? "14px 0 0 14px" : "12px",
              cursor: "pointer",
              background: isA ? bg : "transparent",
              position: "relative",
              marginRight: isA ? 0 : 16,
              zIndex: isA ? 5 : 1,
            }}>
              {isA && <>
                <div style={{
                  position: "absolute", right: 0, top: -20, width: 20, height: 20,
                  background: "transparent", borderBottomRightRadius: 14,
                  boxShadow: `6px 6px 0 6px ${bg}`,
                }} />
                <div style={{
                  position: "absolute", right: 0, bottom: -20, width: 20, height: 20,
                  background: "transparent", borderTopRightRadius: 14,
                  boxShadow: `6px -6px 0 6px ${bg}`,
                }} />
                <div style={{
                  position: "absolute", left: 0, top: "22%", bottom: "22%", width: 3,
                  background: accent, borderRadius: "0 3px 3px 0",
                  boxShadow: `0 0 8px ${glow}`,
                }} />
              </>}
              <span style={{ fontSize: item.sub ? 9 : 12, color: isA ? accent : "rgba(255,255,255,0.28)", filter: isA ? `drop-shadow(0 0 4px ${glow})` : "none" }}>{item.icon}</span>
              <span style={{ fontSize: item.sub ? 11 : 13, fontWeight: isA ? 700 : 400, flex: 1, color: isA ? navy : item.sub ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.48)" }}>{item.label}</span>
              {item.badge && <span style={{
                background: isA ? accent : "rgba(255,255,255,0.06)",
                color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                boxShadow: isA ? `0 2px 6px ${glow}` : "none",
              }}>{item.badge}</span>}
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: "12px 16px 0 8px", borderTop: "1px solid rgba(255,255,255,0.04)", zIndex: 1 }}>
        {["⚡ Nuevo", "📞 Llamar", "✉️ Email", "⏱ Timer"].map((a, i) => (
          <div key={i} style={{ padding: "6px 4px", borderRadius: 7, textAlign: "center", background: "rgba(255,255,255,0.03)", cursor: "pointer", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{a}</div>
        ))}
      </div>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10, padding: "10px 16px 0 8px", borderTop: "1px solid rgba(255,255,255,0.04)", zIndex: 1 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${accent}, #0088cc)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>CM</div>
        <div>
          <div style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>Carlos Mendoza</div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9 }}>Director · Socio</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 1. DASHBOARD
// ============================================================
const DashboardView = () => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 300, color: navy }}>Buenos días, <span style={{ fontWeight: 700 }}>Carlos</span></h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, color: txtM }}><span style={{ color: accent, fontWeight: 600 }}>3 plazos esta semana</span> · Martes 4 febrero 2026</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ padding: "7px 13px", borderRadius: 9, border, fontSize: 12, color: txtL, width: 140, display: "flex", alignItems: "center", gap: 5 }}>🔍 Buscar...</div>
        <div style={{ width: 34, height: 34, borderRadius: 9, border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", position: "relative" }}>
          🔔
          <div style={{ position: "absolute", top: 5, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 4px #ef444440" }} />
        </div>
      </div>
    </div>

    {/* KPIs — just a tinted bg strip, no heavy inset */}
    <div style={{ padding: 12, borderRadius: 16, background: "linear-gradient(135deg, #eceef6, #f1f4f9)", marginBottom: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { label: "Expedientes Activos", value: "15", sub: "+2 este mes", color: accent },
          { label: "Plazos Urgentes", value: "3", sub: "próx. 7 días", color: "#ef4444" },
          { label: "Facturación Feb.", value: "€24.8K", sub: "+12% vs ene.", color: "#10b981" },
          { label: "Horas Registradas", value: "142h", sub: "89% objetivo", color: "#2563eb" },
        ].map((k, i) => (
          <div key={i} style={{ padding: "13px 12px", borderRadius: 14, background: bg, border, display: "flex", alignItems: "center", gap: 12 }}>
            <Badge value={k.value} color={k.color} size="md" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: navy, marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 9, color: k.color, fontWeight: 500 }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Cards — border only, no shadow */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
      <div style={{ padding: 18, borderRadius: 14, border }}>
        <Title right="+12.4% ↑">Facturación 6M</Title>
        <div style={{ display: "flex", alignItems: "end", gap: 8, height: 105 }}>
          {[{m:"Sep",h:42},{m:"Oct",h:55},{m:"Nov",h:38},{m:"Dic",h:70},{m:"Ene",h:54},{m:"Feb",h:85}].map((b, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {i === 5 && <span style={{ fontSize: 10, color: accent, fontWeight: 600 }}>€24.8K</span>}
              <div style={{
                width: "100%", height: `${b.h}%`, borderRadius: "5px 5px 2px 2px",
                background: i === 5 ? `linear-gradient(180deg, ${accent}, ${accentG})` : "rgba(0,0,0,0.04)",
                boxShadow: i === 5 ? `0 2px 10px ${glow}` : "none",
                position: "relative", overflow: "hidden",
              }}>
                {i === 5 && <div style={{ position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2, background: "rgba(255,255,255,0.45)", borderRadius: 2 }} />}
              </div>
              <span style={{ fontSize: 9, color: i === 5 ? accent : "#c0c7d4" }}>{b.m}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 18, borderRadius: 14, border }}>
        <Title right="Calendario →">Próximos Plazos</Title>
        {[
          { d: 2, text: "Requerimiento EUIPO", exp: "OLIVAR PREMIUM GOLD", c: "#ef4444" },
          { d: 12, text: "Fin oposición", exp: "FLOWAI — Marca UE", c: "#f59e0b" },
          { d: 28, text: "Anualidad EPO", exp: "Panel Solar Híbrido", c: txtM },
          { d: 45, text: "Renovación marca ES", exp: "GREENPOWER", c: "#10b981" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "7px 0", borderBottom: i < 3 ? `1px solid ${divider}` : "none" }}>
            <Badge value={p.d} label="días" color={p.c} size="sm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: navy }}>{p.text}</div>
              <div style={{ fontSize: 11, color: txtL }}>{p.exp}</div>
            </div>
            {p.d <= 5 && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 5, background: "#ef44440a", color: "#ef4444" }}>URGENTE</span>}
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <div style={{ padding: 18, borderRadius: 14, border }}>
        <Title right="Ver timeline →">Pipeline</Title>
        {[
          { name: "GREENPOWER", w: 100, c: "#10b981" },
          { name: "FLOWAI", w: 80, c: accent },
          { name: "OLIVAR GOLD", w: 65, c: "#f59e0b" },
          { name: "NORDIKHAUS", w: 55, c: "#2563eb" },
          { name: "vs GREENTECH", w: 35, c: "#ef4444" },
        ].map((bar, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <span style={{ width: 78, fontSize: 11, fontWeight: 600, color: txt, textAlign: "right" }}>{bar.name}</span>
            <div style={{ flex: 1, height: 18, borderRadius: 5, background: "rgba(0,0,0,0.03)", overflow: "hidden" }}>
              <div style={{
                width: `${bar.w}%`, height: "100%", borderRadius: 5,
                background: `linear-gradient(90deg, ${bar.c}cc, ${bar.c})`,
                display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6,
              }}><span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{bar.w}%</span></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 18, borderRadius: 14, border }}>
        <Title>Actividad Hoy</Title>
        {[
          { t: "09:15", text: "GREENPOWER registrada ✓", c: "#10b981" },
          { t: "10:30", text: "Requerimiento OLIVAR GOLD", c: "#f59e0b" },
          { t: "11:00", text: "Oposición vs GREENTECH", c: "#ef4444" },
          { t: "14:45", text: "FLOWAI publicada BOPI", c: "#2563eb" },
          { t: "16:00", text: "Factura GreenPower enviada", c: accent },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", borderBottom: i < 4 ? `1px solid ${divider}` : "none" }}>
            <span style={{ fontSize: 10, color: txtL, fontFamily: "monospace", width: 36 }}>{a.t}</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.c, boxShadow: `0 0 4px ${a.c}30` }} />
            <span style={{ fontSize: 12, color: txt }}>{a.text}</span>
          </div>
        ))}
      </div>
    </div>

    <Insight icon="🎯"><strong style={{ color: accent }}>Productividad alta</strong> — 3 expedientes avanzaron de fase · 0 plazos vencidos</Insight>
  </div>
);

// ============================================================
// 2. EXPEDIENTES
// ============================================================
const ExpedientesView = ({ onOpen }) => {
  const [tab, setTab] = useState(0);
  const data = [
    { ref: "TM/001", name: "GREENPOWER", client: "GreenPower Energía S.A.", phase: "F9", pL: "Registrado", prog: 100, color: "#10b981", days: null },
    { ref: "TM/004", name: "FLOWAI — Marca UE", client: "TechFlow Solutions S.L.", phase: "F7", pL: "Publicación", prog: 80, color: accent, days: 12 },
    { ref: "TM/007", name: "OLIVAR PREMIUM GOLD", client: "Olivar Premium S.L.", phase: "F6", pL: "Examen", prog: 65, color: "#f59e0b", days: 2 },
    { ref: "PT/001", name: "Panel Solar Híbrido", client: "GreenPower Energía S.A.", phase: "F9", pL: "Concedida", prog: 100, color: "#10b981", days: null },
    { ref: "OPP/001", name: "vs GREENTECH ENERGY", client: "GreenPower Energía S.A.", phase: "F3", pL: "Oposición", prog: 35, color: "#ef4444", days: 45 },
    { ref: "TM/008", name: "NORDIKHAUS España", client: "NordikHaus GmbH", phase: "F5", pL: "Present.", prog: 55, color: "#2563eb", days: 30 },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, color: txtL, marginBottom: 4 }}>Gestión → Expedientes</div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: navy }}>Expedientes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: txtM }}><span style={{ color: accent, fontWeight: 600 }}>15 activos</span> · 4 registrados · 2 oposiciones</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn>🔍 Buscar</Btn>
          <Btn primary>+ Nuevo Expediente</Btn>
        </div>
      </div>

      <Tabs tabs={["Todos", "Marcas", "Patentes", "Oposiciones"]} active={tab} onChange={setTab} style={{ marginBottom: 18 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((e, i) => (
          <div key={i} onClick={() => onOpen && onOpen()} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border, cursor: "pointer", background: bg }}>
            <Badge value={e.phase} label={e.pL} color={e.color} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: navy }}>{e.name}</span>
                <span style={{ fontSize: 11, color: txtL }}>{e.ref}</span>
              </div>
              <div style={{ fontSize: 12, color: txtM, marginTop: 2 }}>{e.client}</div>
            </div>
            <Progress value={e.prog} color={e.color} />
            {e.days !== null ? <Badge value={e.days} label="días" color={e.days <= 5 ? "#ef4444" : e.days <= 15 ? "#f59e0b" : txtM} size="sm" />
              : <div style={{ padding: "4px 10px", borderRadius: 8, background: "#10b9810a" }}><span style={{ fontSize: 12, color: "#10b981" }}>✓</span></div>}
            <span style={{ color: "#d0d5dd", fontSize: 15 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 3. DETALLE
// ============================================================
const DetalleView = () => {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <div style={{ fontSize: 11, color: txtL, marginBottom: 8 }}>Expedientes → Marcas → <span style={{ color: txtM }}>FLOWAI</span></div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, border, marginBottom: 16 }}>
        <Badge value="F7" label="Publicac." color="#2563eb" size="lg" />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: navy }}>FLOWAI</h2>
            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: "#2563eb0e", color: "#2563eb", fontWeight: 600 }}>Publicación BOPI</span>
          </div>
          <div style={{ fontSize: 12, color: txtM, marginTop: 3 }}>Marca UE · TechFlow Solutions · Clases 9, 42 · Ref: 2025/TM/004</div>
        </div>
        <Btn>✏️ Editar</Btn>
        <Btn primary>📄 Nuevo Doc</Btn>
      </div>

      <Tabs tabs={["Resumen","Documentos","Comunicac.","Plazos","Tareas","Filings","Timeline","Facturación"]} active={tab} onChange={setTab} style={{ marginBottom: 16 }} />

      {tab === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "5fr 3fr", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 18, borderRadius: 14, border }}>
              <Title>Progreso de Fases</Title>
              <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
                {["F0","F1","F2","F3","F4","F5","F6","F7","F8","F9"].map((f, i) => (
                  <div key={i} style={{
                    flex: 1, height: 26, borderRadius: 5,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, position: "relative", overflow: "hidden",
                    background: i === 7 ? "linear-gradient(135deg, #2563eb, #60a5fa)" : (i < 7 ? "#2563eb0e" : "rgba(0,0,0,0.02)"),
                    boxShadow: i === 7 ? "0 2px 8px rgba(139,92,246,0.25)" : "none",
                    color: i === 7 ? "#fff" : (i < 7 ? "#2563eb" : "#d0d5dd"),
                  }}>
                    {f}
                    {i === 7 && <div style={{ position: "absolute", bottom: 0, left: "22%", right: "22%", height: 2, background: "rgba(255,255,255,0.35)", borderRadius: 2 }} />}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: txtM }}>Fase actual: <strong style={{ color: "#2563eb" }}>F7 — Publicación</strong> · 18 días</div>
            </div>

            <div style={{ padding: 18, borderRadius: 14, border }}>
              <Title>Datos del Expediente</Title>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {[["Tipo","Marca UE"],["Nº Solicitud","018945231"],["Fecha","15/09/2025"],["Clases Niza","9, 42"],["Oficina","EUIPO"],["Abogado","Sofía Herrera"],["Publicación","20/01/2026"],["Fin oposición","20/04/2026"]].map(([l,v],i) => (
                  <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(0,0,0,0.02)" }}>
                    <div style={{ fontSize: 10, color: txtL, marginBottom: 1 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: navy }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 18, borderRadius: 14, border }}>
              <Title right="Ver todos (6) →">Documentos</Title>
              {[["📄","Certificado publicación BOPI","20/01/2026","245 KB"],["📋","Informe anterioridades","14/09/2025","1.2 MB"],["📝","Solicitud marca UE","15/09/2025","380 KB"]].map(([ic,n,d,s],i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${divider}` : "none" }}>
                  <span style={{ fontSize: 14 }}>{ic}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 500, color: txt }}>{n}</div><div style={{ fontSize: 10, color: txtL }}>{d} · {s}</div></div>
                  <span style={{ fontSize: 12, color: "#d0d5dd", cursor: "pointer" }}>⬇</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: 14, borderRadius: 14, border }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#3b82f608", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔮</div>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: navy }}>TechFlow Solutions S.L.</div><div style={{ fontSize: 11, color: txtL }}>Alejandro Ruiz · CEO</div></div>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 14, border }}>
              <Title>Próximos Plazos</Title>
              {[{d:12,text:"Fin oposición",c:"#f59e0b"},{d:78,text:"Renovación",c:"#10b981"}].map((p,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: i > 0 ? "8px 0 0" : "0 0 8px", borderBottom: i < 1 ? `1px solid ${divider}` : "none" }}>
                  <Badge value={p.d} label="días" color={p.c} size="sm" />
                  <div style={{ fontSize: 12, fontWeight: 500, color: navy }}>{p.text}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: 14, borderRadius: 14, border }}>
              <Title>Cronología</Title>
              {[["20/01","Publicación BOPI","#2563eb"],["15/09","Solicitud presentada","#10b981"],["14/09","Informe anterioridades","#3b82f6"],["01/09","Apertura expediente",txtL]].map(([dt,t,c],i) => (
                <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8, position: "relative" }}>
                  {i < 3 && <div style={{ position: "absolute", left: 36, top: 13, width: 1, height: 16, background: divider }} />}
                  <span style={{ fontSize: 10, color: txtL, width: 30 }}>{dt}</span>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, marginTop: 4, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: txt }}>{t}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: 14, borderRadius: 14, border }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Title>Tareas</Title>
                <span style={{ fontSize: 11, color: accent, marginBottom: 14 }}>2/4</span>
              </div>
              {[["Monitorizar oposiciones",false],["Preparar docs registro",false],["Certificado a cliente",true],["Actualizar BD",true]].map(([t,d],i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 0" }}>
                  <div style={{ width: 15, height: 15, borderRadius: 5, flexShrink: 0, background: d ? accent : "transparent", border: d ? "none" : `1.5px solid ${txtL}`, boxShadow: d ? `0 0 4px ${glowSm}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff" }}>{d ? "✓" : ""}</div>
                  <span style={{ fontSize: 12, color: d ? txtL : txt, textDecoration: d ? "line-through" : "none" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab >= 1 && <div style={{ padding: 40, borderRadius: 14, border, textAlign: "center" }}><div style={{ fontSize: 30, opacity: 0.18, marginBottom: 8 }}>{["📄","💬","⏰","☑️","📋","📊","💰"][tab-1]}</div><div style={{ fontSize: 14, color: txtL }}>Vista <strong style={{ color: txtM }}>{["Documentos","Comunicaciones","Plazos","Tareas","Filings","Timeline","Facturación"][tab-1]}</strong></div></div>}
    </div>
  );
};

// ============================================================
// 4. PLAZOS
// ============================================================
const PlazosView = () => {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, color: txtL, marginBottom: 4 }}>Gestión → Plazos</div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: navy }}>Plazos y Vencimientos</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: txtM }}><span style={{ color: "#ef4444", fontWeight: 600 }}>1 urgente</span> · 6 próximos · 0 vencidos</p>
        </div>
        <Btn primary>+ Nuevo Plazo</Btn>
      </div>

      <Tabs tabs={["Todos (6)", "Urgentes", "Esta semana", "Este mes"]} active={tab} onChange={setTab} style={{ marginBottom: 18 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[{ l: "Urgentes", v: "1", c: "#ef4444" },{ l: "Próx. 15d", v: "2", c: "#f59e0b" },{ l: "Próx. 30d", v: "4", c: accent },{ l: "Vencidos", v: "0", c: "#10b981" }].map((s,i) => (
          <div key={i} style={{ padding: "11px 12px", borderRadius: 12, border, display: "flex", alignItems: "center", gap: 9 }}>
            <Badge value={s.v} color={s.c} size="sm" />
            <span style={{ fontSize: 12, color: txtM }}>{s.l}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { d: 2, text: "Requerimiento EUIPO — Respuesta obligatoria", exp: "OLIVAR PREMIUM GOLD · TM/007", tipo: "Requerimiento", c: "#ef4444" },
          { d: 12, text: "Fin periodo de oposición", exp: "FLOWAI — Marca UE · TM/004", tipo: "Oposición", c: "#f59e0b" },
          { d: 28, text: "Anualidad patente EPO", exp: "Panel Solar Híbrido · PT/001", tipo: "Anualidad", c: txtM },
          { d: 30, text: "Alegaciones OEPM", exp: "NORDIKHAUS España · TM/008", tipo: "Alegaciones", c: "#2563eb" },
          { d: 45, text: "Renovación marca ES — 10 años", exp: "GREENPOWER · TM/001", tipo: "Renovación", c: "#10b981" },
          { d: 60, text: "Tasa mantenimiento", exp: "ECOFLOW · TM/011", tipo: "Tasa", c: accent },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border, cursor: "pointer" }}>
            <Badge value={p.d} label="días" color={p.c} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: navy }}>{p.text}</span>
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 5, background: `${p.c}0a`, color: p.c, fontWeight: 600 }}>{p.tipo}</span>
              </div>
              <div style={{ fontSize: 12, color: txtM, marginTop: 2 }}>{p.exp}</div>
            </div>
            {p.d <= 5 && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 7, background: "#ef44440a", color: "#ef4444", border: "1px solid #ef444412" }}>⚠ URGENTE</span>}
            <span style={{ color: "#d0d5dd", fontSize: 15 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// 5. CRM
// ============================================================
const CRMView = () => {
  const [sel, setSel] = useState(0);
  const cls = [
    { name: "GreenPower Energía S.A.", contact: "Roberto Casas", cases: 5, rev: "€12.4K", c: "#10b981", email: "roberto@greenpower.es", role: "CEO" },
    { name: "TechFlow Solutions S.L.", contact: "Alejandro Ruiz", cases: 4, rev: "€8.2K", c: "#3b82f6", email: "alejandro@techflow.io", role: "CEO" },
    { name: "Olivar Premium S.L.", contact: "Francisco Morales", cases: 2, rev: "€4.1K", c: "#f59e0b", email: "fmorales@olivar.es", role: "Gerente" },
    { name: "NordikHaus GmbH", contact: "Klaus Bergmann", cases: 2, rev: "€5.8K", c: "#2563eb", email: "k.bergmann@nordikhaus.de", role: "Dir." },
    { name: "Sabores Mediterráneo", contact: "Valentina García", cases: 1, rev: "€2.1K", c: "#ec4899", email: "vgarcia@sabores.es", role: "Dir." },
    { name: "BioVoss Pharma AG", contact: "Dra. Elena Voss", cases: 1, rev: "€3.5K", c: "#06b6d4", email: "e.voss@biovoss.de", role: "CEO" },
  ];
  const cl = cls[sel];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, color: txtL, marginBottom: 4 }}>Gestión → CRM</div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: navy }}>CRM — Clientes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: txtM }}><span style={{ color: accent, fontWeight: 600 }}>6 clientes</span> · 15 expedientes · €36.1K</p>
        </div>
        <Btn primary>+ Nuevo Cliente</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {cls.map((c, i) => (
            <div key={i} onClick={() => setSel(i)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12, cursor: "pointer",
              background: bg,
              border: sel === i ? borderA : border,
            }}>
              <Badge value={c.cases} color={c.c} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: sel === i ? navy : txt, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                <div style={{ fontSize: 10, color: txtL }}>{c.contact} · {c.rev}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: 20, borderRadius: 14, border }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <Badge value={cl.name.substring(0,2).toUpperCase()} color={cl.c} size="lg" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: navy }}>{cl.name}</div>
              <div style={{ fontSize: 12, color: txtM }}>{cl.contact} · {cl.role} · {cl.email}</div>
            </div>
            <Btn style={{ padding: "6px 10px", fontSize: 11 }}>📞</Btn>
            <Btn style={{ padding: "6px 10px", fontSize: 11 }}>✉️</Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginBottom: 18 }}>
            {[{ l: "Expedientes", v: cl.cases, c: cl.c },{ l: "Facturado", v: cl.rev, c: "#10b981" },{ l: "Pendiente", v: "€0", c: "#10b981" },{ l: "Abogado", v: "Carlos M.", c: accent }].map((s,i) => (
              <div key={i} style={{ padding: "9px 10px", borderRadius: 10, background: "rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: 9, color: txtL, letterSpacing: 0.5, marginBottom: 2 }}>{s.l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>

          <Title>Expedientes</Title>
          {(sel === 0 ? [["TM/001","GREENPOWER","F9","#10b981"],["PT/001","Panel Solar","F9","#10b981"],["OPP/001","vs GREENTECH","F3","#ef4444"]] : sel === 1 ? [["TM/004","FLOWAI","F7","#2563eb"],["TM/009","TECHFLOW AI","F4",accent]] : [["TM/007","OLIVAR GOLD","F6","#f59e0b"]]).map(([ref,name,phase,color],i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: `1px solid ${divider}`, cursor: "pointer" }}>
              <Badge value={phase} color={color} size="sm" />
              <span style={{ fontSize: 12, fontWeight: 500, color: navy, flex: 1 }}>{name}</span>
              <span style={{ fontSize: 10, color: txtL }}>{ref}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 6. VIGILANCIA
// ============================================================
const VigilanciaView = () => {
  const [tab, setTab] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, color: txtL, marginBottom: 4 }}>IP-SPIDER → Vigilancia</div>
          <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: navy }}>Vigilancia de Marcas</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: txtM }}><span style={{ color: "#ef4444", fontWeight: 600 }}>1 alerta alta</span> · 4 totales · 12 monitorizadas</p>
        </div>
        <Btn primary>+ Nueva Vigilancia</Btn>
      </div>

      <Tabs tabs={["Alertas (4)", "Monitorizaciones", "Historial"]} active={tab} onChange={setTab} style={{ marginBottom: 18 }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[{ l: "Riesgo Alto", v: "1", c: "#ef4444" },{ l: "Riesgo Medio", v: "2", c: "#f59e0b" },{ l: "Riesgo Bajo", v: "1", c: "#10b981" }].map((s,i) => (
          <div key={i} style={{ padding: "13px 14px", borderRadius: 12, border, display: "flex", alignItems: "center", gap: 11 }}>
            <Badge value={s.v} color={s.c} size="md" />
            <div style={{ fontSize: 12, fontWeight: 600, color: navy }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { mark: "GREENPOWR", owner: "Zhang Industries", office: "EUIPO", sim: 87, c: "#ef4444", risk: "Alta", vs: "GREENPOWER" },
          { mark: "FLOWAI TECH", owner: "FlowTech Inc.", office: "USPTO", sim: 72, c: "#f59e0b", risk: "Media", vs: "FLOWAI" },
          { mark: "OLIVAR GOLD PREMIUM", owner: "Aceites del Sur", office: "OEPM", sim: 64, c: "#10b981", risk: "Baja", vs: "OLIVAR PREMIUM" },
          { mark: "NORDIK HAUS", owner: "Nordic Design AB", office: "DPMA", sim: 78, c: "#f59e0b", risk: "Media", vs: "NORDIKHAUS" },
        ].map((a, i) => (
          <div key={i} style={{ padding: "15px 16px", borderRadius: 14, border, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <Badge value={`${a.sim}%`} color={a.c} size="md" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: navy }}>{a.mark}</span>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: `${a.c}0a`, color: a.c, fontWeight: 600 }}>Riesgo {a.risk}</span>
                </div>
                <div style={{ fontSize: 12, color: txtM, marginTop: 2 }}>{a.owner} · {a.office} · vs <strong style={{ color: accent }}>{a.vs}</strong></div>
              </div>
            </div>
            <div style={{ height: 4, borderRadius: 3, background: "rgba(0,0,0,0.04)" }}>
              <div style={{ width: `${a.sim}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${a.c}, ${a.c}80)` }} />
            </div>
          </div>
        ))}
      </div>
      <Insight icon="🔍"><strong style={{ color: accent }}>IP-SPIDER:</strong> Última actualización hace 2h · 12 marcas en 8 oficinas</Insight>
    </div>
  );
};

// ============================================================
// 7. IA
// ============================================================
const IAView = () => (
  <div>
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: txtL, marginBottom: 4 }}>IP-GENIUS → IA & Análisis</div>
      <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: navy }}>IA & Análisis</h1>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: txtM }}>Inteligencia artificial aplicada a propiedad intelectual</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
      {[
        { ic: "🔍", title: "Anterioridades", desc: "Búsqueda IA en bases globales", st: "Disponible", c: accent },
        { ic: "🧠", title: "Predicción Examinador", desc: "Comportamiento probable del examinador", st: "Beta", c: "#2563eb" },
        { ic: "📊", title: "Valoración Cartera", desc: "Estimación del valor de tu portfolio", st: "Disponible", c: "#10b981" },
        { ic: "⚖️", title: "Riesgo Oposición", desc: "Probabilidad de oposición", st: "Disponible", c: "#f59e0b" },
        { ic: "🌍", title: "Intel. Mercado", desc: "Tendencias por sector y geografía", st: "Próximamente", c: txtL },
        { ic: "📝", title: "Generador Escritos", desc: "Redacción auto. de solicitudes", st: "Disponible", c: "#ec4899" },
      ].map((t, i) => (
        <div key={i} style={{
          padding: 20, borderRadius: 14, border,
          cursor: t.c !== txtL ? "pointer" : "default",
          opacity: t.c === txtL ? 0.4 : 1,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>{t.ic}</div>
          <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: navy }}>{t.title}</h3>
          <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 5, background: `${t.c}0c`, color: t.c, fontWeight: 600 }}>{t.st}</span>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: txtM, lineHeight: 1.5 }}>{t.desc}</p>
          {t.c !== txtL && <div style={{ position: "absolute", bottom: 0, left: "22%", right: "22%", height: 2, background: t.c, borderRadius: 2, opacity: 0.2 }} />}
        </div>
      ))}
    </div>

    <div style={{ padding: 18, borderRadius: 14, border }}>
      <Title right="Ver historial →">Análisis Recientes</Title>
      {[
        { type: "Anterioridades", exp: "FLOWAI", result: "3 conflictos encontrados", score: 72, c: "#f59e0b" },
        { type: "Riesgo Oposición", exp: "OLIVAR GOLD", result: "Riesgo medio-alto", score: 65, c: "#ef4444" },
        { type: "Valoración", exp: "Cartera GreenPower", result: "€180K — €240K", score: 88, c: "#10b981" },
        { type: "Predicción", exp: "NORDIKHAUS", result: "85% prob. aprobación", score: 85, c: "#2563eb" },
      ].map((a, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? `1px solid ${divider}` : "none", cursor: "pointer" }}>
          <Badge value={a.score} label="score" color={a.c} size="md" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: navy }}>{a.type} <span style={{ fontWeight: 400, color: txtL }}>— {a.exp}</span></div>
            <div style={{ fontSize: 12, color: txtM, marginTop: 2 }}>{a.result}</div>
          </div>
          <span style={{ color: "#d0d5dd", fontSize: 15 }}>›</span>
        </div>
      ))}
    </div>
    <Insight icon="🤖"><strong style={{ color: accent }}>IP-GENIUS:</strong> 127 análisis este mes · Precisión media 94.2%</Insight>
  </div>
);

// ============================================================
// MAIN
// ============================================================
export default function IPNexusSilkFinal() {
  const [view, setView] = useState("dashboard");
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${bg}, #ebeef5)`, padding: 16, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {[["dashboard","◆ Dashboard"],["expedientes","◈ Expedientes"],["expediente","◈ Detalle"],["plazos","◇ Plazos"],["crm","◎ CRM"],["vigilancia","⬡ Vigilancia"],["ia","△ IA"]].map(([id,label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            padding: "6px 14px", borderRadius: 9, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600, background: view === id ? bg : "transparent",
            boxShadow: view === id ? neuSm : "none", color: view === id ? accent : txtL,
            position: "relative",
          }}>
            {label}
            {view === id && <div style={{ position: "absolute", bottom: 1, left: "30%", right: "30%", height: 2, background: accent, borderRadius: 2 }} />}
          </button>
        ))}
      </div>

      <div style={{
        maxWidth: 1080, margin: "0 auto", display: "flex", height: 650,
        background: bg, borderRadius: 16, overflow: "hidden",
        boxShadow: "14px 14px 40px #cdd1dc, -14px -14px 40px #ffffff",
      }}>
        <Sidebar active={view} onChange={setView} />
        <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
          {view === "dashboard" && <DashboardView />}
          {view === "expedientes" && <ExpedientesView onOpen={() => setView("expediente")} />}
          {view === "expediente" && <DetalleView />}
          {view === "plazos" && <PlazosView />}
          {view === "crm" && <CRMView />}
          {view === "vigilancia" && <VigilanciaView />}
          {view === "ia" && <IAView />}
        </div>
      </div>
    </div>
  );
}
