# IP‑NEXUS — Resumen de verificación (módulos + linter)

Fecha: 2026-01-20  
Alcance: verificación rápida de módulos (LEGAL‑OPS, COLLAB, ONBOARDING, NOTIFICATIONS) + pendientes menores del linter + ajuste de navegación Backoffice.

---

## 1) Pendientes menores del linter

### 1.1 79 funciones sin `search_path` definido (WARN)
- **¿Causa problemas ahora?** Normalmente **no rompe** el funcionamiento diario.
- **Riesgo real:** es una **recomendación de seguridad/higiene** para evitar que una función ejecute objetos de un esquema inesperado si el `search_path` cambia.
- **Cuándo sí puede doler:** si existen funciones **SECURITY DEFINER** o si hay esquemas/objetos con nombres “sombrados” (shadowing) que puedan ser explotados.

**Recomendación:** ir corrigiéndolo progresivamente (especialmente en funciones `SECURITY DEFINER`) añadiendo `SET search_path = public` (o el/los esquemas estrictos que correspondan).

### 1.2 2 tablas con RLS habilitado pero sin políticas (INFO)
- **¿Causa problemas ahora?** **Puede causar problemas** si se acceden desde el cliente (App) porque con RLS activo y **sin policies**, el resultado típico es **denegar todo** (SELECT/INSERT/UPDATE/DELETE).
- **Cuándo NO es problema:** si esas tablas están pensadas para uso **interno** vía **Edge Functions** con `service_role` (y nunca desde el cliente).

**Acción sugerida:** confirmar si se usan desde la App. Si sí → crear policies mínimas; si no → mantener sin policies (seguridad por defecto “deny”).

---

## 2) Verificación de módulos

### 2.1 LEGAL‑OPS
- **Estado:** existe (carpetas/páginas/componentes/hooks presentes).
- **Madurez:** UI bastante completa; **lógica parcial** (hay hooks o flujos aún con comportamiento incompleto/mocks en algunos puntos).
- **Observación clave:** **solapamiento** importante con CRM por la visión tipo “Cliente 360°”.

**Recomendación:** definir frontera clara (LEGAL‑OPS vs CRM) o plan de convergencia para evitar duplicación funcional.

### 2.2 COLLAB
- **Estado:** existe (páginas/componentes/hooks).
- **Madurez:** UI completa y **conectada a Supabase**.
- **Solapamiento:** parcial; potencial integración con Legal‑Ops (portal/colaboración vs operaciones internas).

**Recomendación:** mantener, y diseñar puntos de integración (timeline, portal, permisos EXTERNAL).

### 2.3 ONBOARDING
- **Estado:** hay **dos sistemas**:
  - Onboarding de **organización/tenant**.
  - Onboarding de **cliente** dentro de Legal‑Ops.
- **Duplicación:** **no**; cubren propósitos distintos.

**Recomendación:** mantener separados, pero unificar copy/UX si comparten pasos (consistencia).

### 2.4 NOTIFICATIONS
- **Estado:** sistema unificado (hooks principales para notificaciones y push).
- **Duplicación:** **no**; `portal_notifications` aparece como variante específica del portal/Collab.

**Recomendación:** OK; revisar solo preferencias por rol/owner_type cuando se amplíen módulos.

---

## 3) Backoffice — Navegación

### Cambio aplicado
- Se añadió **Calendar** al sidebar del **Backoffice** apuntando a:
  - `/backoffice/calendar`
- **Exclusividad:** solo aparece en el menú del Backoffice (no en la App).

---

## 4) Siguientes decisiones (para cerrar pendientes)
1) Confirmar si las **2 tablas RLS sin policies** se usan desde cliente o solo Edge.
2) Priorizar `search_path` en funciones sensibles (SECURITY DEFINER / auth / billing / llaves / auditoría).
