# ═══════════════════════════════════════════════════════════════
# IP-NEXUS — DESIGN SYSTEM "SILK" — ESPECIFICACIÓN TÉCNICA
# Para implementación visual en la aplicación existente
# Versión 1.0 — Febrero 2026
# ═══════════════════════════════════════════════════════════════


# ██████████████████████████████████████████████████████████████
# ██                                                          ██
# ██   ⛔⛔⛔  SECCIÓN CRÍTICA: NO TOCAR  ⛔⛔⛔              ██
# ██                                                          ██
# ██████████████████████████████████████████████████████████████

## REGLA ABSOLUTA: CAMBIOS SOLO VISUALES/ESTÉTICOS

Esta especificación describe ÚNICAMENTE cambios de apariencia.
NO se debe modificar NINGUNA funcionalidad de la aplicación.

### ❌ LISTA EXPLÍCITA DE LO QUE NO SE DEBE TOCAR:

**BASE DE DATOS & BACKEND:**
- NO modificar queries SQL, Supabase queries, ni llamadas a API
- NO modificar Edge Functions
- NO modificar cron jobs ni triggers
- NO modificar esquemas de tablas ni relaciones
- NO modificar RLS policies
- NO modificar funciones serverless

**TABLAS Y LISTAS DE DATOS:**
- NO modificar columnas de tablas (ni añadir, ni quitar, ni reordenar)
- NO modificar la lógica de ordenación (sort)
- NO modificar la lógica de filtrado
- NO modificar la paginación
- NO modificar la lógica de búsqueda
- NO modificar el renderizado de celdas (solo su estilo visual)
- NO modificar los datos mostrados ni su formato numérico/fecha

**FORMULARIOS:**
- NO modificar campos de formulario (ni añadir, ni quitar)
- NO modificar validaciones
- NO modificar handlers de submit
- NO modificar lógica de estados del formulario
- NO modificar dropdowns funcionales ni sus opciones

**NAVEGACIÓN Y RUTAS:**
- NO modificar react-router, rutas, ni paths
- NO modificar la lógica de navegación entre vistas
- NO modificar guards de autenticación
- NO modificar redirects

**ESTADO Y LÓGICA:**
- NO modificar useState, useEffect, useContext, stores
- NO modificar callbacks, handlers, event listeners funcionales
- NO modificar imports de módulos funcionales
- NO modificar condicionales de negocio (if/else funcionales)
- NO eliminar componentes existentes
- NO crear componentes nuevos que no existan
- NO modificar props funcionales entre componentes

**INTEGRACIONES:**
- NO modificar webhooks
- NO modificar integraciones con oficinas IP (EUIPO, OEPM, WIPO)
- NO modificar automatizaciones
- NO modificar sistema de templates de documentos
- NO modificar sistema de notificaciones

### ✅ LISTA EXPLÍCITA DE LO QUE SÍ SE PUEDE CAMBIAR:

SOLO propiedades CSS/estilo visual:
- `color` (color de texto)
- `background` / `background-color` / `background-image` (fondos)
- `border` / `border-radius` / `border-color` (bordes)
- `box-shadow` (sombras)
- `font-size` / `font-weight` / `font-family` / `letter-spacing` (tipografía)
- `padding` / `margin` / `gap` (espaciado)
- `opacity`
- `transition` (solo CSS transitions)
- `linear-gradient` / `radial-gradient` (gradientes decorativos)
- `filter: drop-shadow()` (resplandores decorativos)
- Iconos decorativos y emojis
- Clases de Tailwind que sean puramente visuales

### ⚠️ REGLA DE VERIFICACIÓN:
Después de CADA cambio, verificar que:
1. Todas las tablas muestran los mismos datos en las mismas columnas
2. Todos los botones ejecutan las mismas acciones
3. Todos los formularios envían los mismos datos
4. La navegación funciona exactamente igual
5. Los filtros y búsquedas funcionan igual
6. Los modales se abren y cierran igual


# ═══════════════════════════════════════════════════════════════
# SECCIÓN 1: TOKENS DE DISEÑO — VALORES EXACTOS
# ═══════════════════════════════════════════════════════════════

## 1.1 — PALETA DE COLORES

### Fondos
```
Fondo principal de la app:     #f1f4f9
Fondo del sidebar (gradiente): linear-gradient(180deg, #0a2540 0%, #0f4c75 50%, #145374 100%)
```

### Accent (marca)
```
Accent primario (cyan):     #00b4d8
Accent secundario (teal):   #00d4aa
Gradiente accent:           linear-gradient(135deg, #00b4d8, #00d4aa)
Glow accent:                rgba(0, 180, 216, 0.30)
Glow accent suave:          rgba(0, 180, 216, 0.15)
```

### Textos
```
Headings / títulos:         #0a2540   (navy)
Texto principal:            #334155
Texto secundario:           #64748b
Texto terciario / labels:   #94a3b8
```

### Estados
```
Urgente / Error:            #ef4444
Advertencia:                #f59e0b
Éxito / Completado:         #10b981
Info / Secundario (azul):   #2563eb
Info azul claro:            #60a5fa
Accent principal:           #00b4d8
Neutral:                    #64748b
Deshabilitado:              #94a3b8  con  opacity: 0.4
Rosa (puntual):             #ec4899
```

### Estructurales
```
Borde de cards:                   1px solid rgba(0, 0, 0, 0.06)
Borde activo/seleccionado:        1px solid rgba(0, 180, 216, 0.15)
Divisor entre filas:              1px solid rgba(0, 0, 0, 0.04)
Flechas/iconos neutros:           #d0d5dd
Fondo campos datos (data cells):  rgba(0, 0, 0, 0.02)
Fondo barras progreso vacías:     rgba(0, 0, 0, 0.04)
```

### ⛔ COLOR PROHIBIDO:
```
❌ NO USAR #8b5cf6 (morado/violeta) EN NINGÚN LUGAR DE LA APP
❌ NO USAR #a78bfa (violeta claro) EN NINGÚN LUGAR DE LA APP
❌ NO USAR ningún tono purple/violet

→ Donde antes había morado, usar #2563eb (azul)
→ Donde antes había violeta claro, usar #60a5fa (azul claro)
```


## 1.2 — SOMBRAS

### Regla fundamental de sombras:
```
Las CARDS DE CONTENIDO no tienen sombra. Usan solo borde.
Las sombras neumórficas se usan SOLO en 3 tipos de elementos:
  1. Badges (números/estados)
  2. Botones
  3. Tabs (contenedor + tab activo)
```

### Valores exactos:
```
Neumórfica estándar (badges):
  box-shadow: 4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff

Neumórfica pequeña (botones secundarios, tabs activos):
  box-shadow: 3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff

Inset (contenedor de tabs):
  box-shadow: inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff

Shell principal de la app (contenedor exterior):
  box-shadow: 14px 14px 40px #cdd1dc, -14px -14px 40px #ffffff
```

### Mapa de uso de sombras:
```
COMPONENTE                          │ SOMBRA
────────────────────────────────────┼──────────────────────────
Badge / StatusBadge                 │ neumórfica estándar
Botón primario (gradient)           │ 0 3px 12px rgba(0,180,216,0.15)
Botón secundario                    │ neumórfica pequeña
Tab activo                          │ neumórfica pequeña
Contenedor de tabs                  │ inset
Shell de la app                     │ neumórfica grande
────────────────────────────────────┼──────────────────────────
Card de contenido                   │ ❌ NINGUNA → solo borde
Fila de expediente                  │ ❌ NINGUNA → solo borde
Fila de plazo                       │ ❌ NINGUNA → solo borde
Alerta de vigilancia                │ ❌ NINGUNA → solo borde
Card de herramienta IA              │ ❌ NINGUNA → solo borde
Input de búsqueda                   │ ❌ NINGUNA → solo borde
Notificación bell                   │ ❌ NINGUNA → solo borde
Paneles laterales                   │ ❌ NINGUNA → solo borde
Modales                             │ evaluar caso a caso
```


## 1.3 — TIPOGRAFÍA

### Familia tipográfica:
```
font-family: 'DM Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif
```

### Escala completa:
```
ELEMENTO                    │ SIZE  │ WEIGHT │ COLOR    │ EXTRA
────────────────────────────┼───────┼────────┼──────────┼──────────────
Heading h1                  │ 23px  │ 700    │ #0a2540  │
Heading h1 saludo ("Buenos  │ 23px  │ 300    │ #0a2540  │ nombre en 700
  días, Carlos")            │       │        │          │
Título de sección           │ 13px  │ 700    │ #0a2540  │ spacing: 0.15px
Nombre expediente en fila   │ 14px  │ 700    │ #0a2540  │
Nombre en detalle card      │ 20px  │ 700    │ #0a2540  │
Nombre empresa CRM          │ 17px  │ 700    │ #0a2540  │
Texto cuerpo                │ 12px  │ 400-500│ #334155  │
Texto secundario            │ 11-12px│ 400   │ #64748b  │
Breadcrumb                  │ 11px  │ 400    │ #94a3b8  │ activo: #64748b
Label de campo              │ 10px  │ 400    │ #94a3b8  │
Label de KPI                │ 11px  │ 600    │ #0a2540  │
Sub-label de KPI            │ 9px   │ 500    │ {color}  │ color del estado
Badge de tipo (tag)         │ 9px   │ 600    │ {color}  │ bg: {color}0a
Badge URGENTE               │ 10px  │ 700    │ #ef4444  │ bg: #ef44440a
Hora (timeline)             │ 10px  │ 400    │ #94a3b8  │ font: monospace
Referencia expediente       │ 11px  │ 400    │ #94a3b8  │
Progreso porcentaje         │ 9px   │ 700    │ {color}  │
Porcentaje en barra         │ 9px   │ 600    │ #ffffff  │
Botón texto                 │ 13px  │ 400/600│          │ 600 si primary
Tab texto                   │ 12px  │ 600    │          │
Sidebar label               │ 13px  │ 400/700│          │ 700 si activo
Sidebar sub-item            │ 11px  │ 400    │          │
Logo "IP-NEXUS"             │ 15px  │ 700    │ #ffffff  │ spacing: 0.5px
Logo "PLATAFORMA IP"        │ 8px   │ 500    │ w/0.28   │ spacing: 2.5px
Badge empresa sidebar       │ 9px   │ 600    │ w/0.5    │ spacing: 1.5px
```

### Reglas tipográficas:
```
❌ NO usar font-size > 23px en texto (excepto emojis decorativos)
❌ NO usar font-weight 800-900 (excepto logo "IP": 800)
❌ NO usar italic/cursiva en ningún lugar
❌ NO usar text-transform: uppercase en textos largos
❌ NO usar text-decoration: underline para links (usar color accent)
✅ letter-spacing > 1px solo en labels cortos del sidebar
```


## 1.4 — ESPACIADO

### Border-radius:
```
ELEMENTO                    │ RADIUS
────────────────────────────┼────────
Shell principal de la app   │ 16px
Card de contenido           │ 14px
Fila de lista               │ 14px
Badge neumórfico sm         │ 10px
Badge neumórfico md         │ 12px
Badge neumórfico lg         │ 14px
Botón                       │ 11px
Contenedor de tabs          │ 11px
Tab individual              │ 9px
Barra de progreso           │ 3px
Tag/badge de tipo           │ 5px
Badge numérico sidebar      │ 10px
Punto de timeline           │ 50% (circular)
Input búsqueda              │ 9px
Sidebar item inactivo       │ 12px
Sidebar item activo         │ 14px 0 0 14px (solo izquierda)
Sidebar logo cuadrado       │ 10px
Sidebar badge empresa       │ 8px
Sidebar quick action        │ 7px
Sidebar avatar              │ 9px
Checkbox                    │ 5px
Campo dato (data cell)      │ 8-9px
Hero zone (dashboard KPIs)  │ 16px
Insight banner              │ 12px
Fase bar (progreso fases)   │ 5px
```

### Padding:
```
ELEMENTO                    │ PADDING
────────────────────────────┼────────────
Card estándar               │ 18px
Card compacta (panel lat.)  │ 14px
Fila de lista               │ 14px 16px
Fila interna (dentro card)  │ 7-10px 0 (top/bottom solo)
Botón                       │ 8px 16px
Botón pequeño               │ 6px 10px
Tab                         │ 7px 15px
Contenedor tabs             │ 3px
Badge tipo/tag              │ 2px 7px
Badge URGENTE               │ 3-4px 10px
Input búsqueda              │ 7px 13px
Insight banner              │ 11px 16px
Campo dato                  │ 8-9px 10-11px
Hero zone                   │ 12px
Sidebar (contenedor)        │ 22px 0 18px 16px
Sidebar item                │ 10px 12px
Sidebar sub-item            │ 7px 12px 7px 26px
Sidebar badge empresa       │ 7px 10px
Sidebar quick action        │ 6px 4px
```

### Gaps:
```
CONTEXTO                    │ GAP
────────────────────────────┼──────
Grid de cards (2 columnas)  │ 14px
Grid de KPIs                │ 10px
Filas en lista              │ 6px
Clientes en CRM lista       │ 3px
Grid datos (2 col)          │ 7px
Grid 3 columnas (IA tools)  │ 10-12px
Sidebar items               │ 1px
Sidebar quick actions       │ 5px
Dentro de fila (elementos)  │ 10-14px
```

### Márgenes de sección:
```
Después de header            │ margin-bottom: 22-24px
Después de tabs              │ margin-bottom: 18px
Entre secciones de cards     │ margin-bottom: 14-16px
Insight banner               │ margin-top: 18px
Breadcrumb a título          │ margin-bottom: 4-5px
Title dentro de card         │ margin-bottom: 14px
```


# ═══════════════════════════════════════════════════════════════
# SECCIÓN 2: COMPONENTES — ESPECIFICACIÓN EXACTA
# ═══════════════════════════════════════════════════════════════

## 2.1 — BADGE / STATUS BADGE (Firma visual de marca)

```
PROPÓSITO: Mostrar números, fases, porcentajes con identidad neumórfica.
           Es el elemento más reconocible de IP-NEXUS.

TAMAÑOS:
  sm: 34×34px, border-radius: 10px, font-size número: 12px, font-size label: 7px
  md: 46×46px, border-radius: 12px, font-size número: 16px, font-size label: 8px
  lg: 54×54px, border-radius: 14px, font-size número: 19px, font-size label: 9px

ESTRUCTURA:
  ┌─────────────────────────┐
  │                         │
  │      [NÚMERO]           │  ← font-weight: 200, color: {estado}
  │      [label]            │  ← font-size: 7-9px, color: #94a3b8
  │                         │
  │ ░░░░░░░░░░░░░░░░░░░░░░ │  ← gradiente inferior (45% altura)
  │ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬         │  ← línea de color (2px)
  └─────────────────────────┘

ESTILOS:
  background: #f1f4f9
  box-shadow: 4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff
  overflow: hidden

  Gradiente inferior:
    position: absolute, bottom: 0, left: 0, right: 0
    height: 45%
    background: linear-gradient(to top, {color}0c, transparent)

  Línea inferior:
    position: absolute, bottom: 0, left: 18%, right: 18%
    height: 2px
    background: {color del estado}
    opacity: 0.25
    box-shadow: 0 0 5px {color}30

  Número:
    font-weight: 200 (ultralight)
    color: {color del estado}
    line-height: 1

⚠️ ESTE COMPONENTE NO SE MODIFICA FUNCIONALMENTE.
   Solo se cambian los estilos CSS de los badges existentes.
```


## 2.2 — CARD DE CONTENIDO (Borde sutil, sin sombra)

```
PROPÓSITO: Contenedor principal de información.
           Usa borde fino para definir límites, NO sombra.

ESTILO:
  background: #f1f4f9
  border: 1px solid rgba(0, 0, 0, 0.06)
  border-radius: 14px
  padding: 18px (estándar) | 14px 16px (fila) | 14px (compacta)
  box-shadow: NINGUNA  ← ⚠️ CRÍTICO: NO PONER SOMBRA

VARIANTE CLICKABLE (filas de expedientes, plazos, etc.):
  cursor: pointer
  Hover opcional: border-color cambia a rgba(0, 180, 216, 0.15)

VARIANTE SELECCIONADA (cliente en CRM):
  border: 1px solid rgba(0, 180, 216, 0.15)
```


## 2.3 — BOTÓN PRIMARIO

```
ESTILO:
  background: linear-gradient(135deg, #00b4d8, #00d4aa)
  color: #ffffff
  font-size: 13px
  font-weight: 600
  padding: 8px 16px
  border-radius: 11px
  box-shadow: 0 3px 12px rgba(0, 180, 216, 0.15)
  cursor: pointer
  display: inline-flex
  align-items: center
  gap: 6px

  Detalle decorativo (línea blanca inferior):
    position: absolute, bottom: 0
    left: 22%, right: 22%
    height: 2px
    background: rgba(255, 255, 255, 0.4)
    border-radius: 2px
```


## 2.4 — BOTÓN SECUNDARIO

```
ESTILO:
  background: #f1f4f9
  color: #64748b
  font-size: 13px
  font-weight: 400
  padding: 8px 16px
  border-radius: 11px
  box-shadow: 3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff
  cursor: pointer
  display: inline-flex
  align-items: center
  gap: 6px
```


## 2.5 — TABS

```
CONTENEDOR:
  display: inline-flex
  gap: 3px
  padding: 3px
  border-radius: 11px
  background: #f1f4f9
  box-shadow: inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff

TAB INACTIVO:
  padding: 7px 15px
  border-radius: 9px
  font-size: 12px
  font-weight: 600
  color: #94a3b8
  background: transparent
  box-shadow: none
  cursor: pointer

TAB ACTIVO:
  padding: 7px 15px
  border-radius: 9px
  font-size: 12px
  font-weight: 600
  color: #0a2540
  background: #f1f4f9
  box-shadow: 3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff

  Línea accent inferior:
    position: absolute, bottom: 1px
    left: 30%, right: 30%
    height: 2px
    background: #00b4d8
    border-radius: 2px
```


## 2.6 — TÍTULO DE SECCIÓN

```
⚠️ NO tiene contenedor ni background — es SOLO texto.

  font-size: 13px
  font-weight: 700
  color: #0a2540
  letter-spacing: 0.15px
  margin-bottom: 14px

  Link derecho opcional:
    font-size: 11px
    color: #00b4d8
    font-weight: 500
    cursor: pointer
```


## 2.7 — BARRA DE PROGRESO

```
CONTENEDOR:
  height: 4px
  border-radius: 3px
  background: rgba(0, 0, 0, 0.04)  ← NO box-shadow inset

BARRA DE RELLENO:
  height: 100%
  border-radius: 3px
  background: linear-gradient(90deg, {color}, {color}88)
  box-shadow: 0 0 4px {color}18

LABELS (arriba de la barra):
  "Progreso": font-size 9px, color #94a3b8
  "XX%": font-size 9px, font-weight 700, color {color}
```


## 2.8 — INSIGHT BANNER (Footer informativo)

```
  padding: 11px 16px
  border-radius: 12px
  margin-top: 18px
  background: linear-gradient(135deg, rgba(0,180,216,0.03), rgba(0,212,170,0.02))
  border: 1px solid rgba(0, 180, 216, 0.08)
  display: flex
  align-items: center
  gap: 10px

  Icono: font-size 15px
  Texto: font-size 12px, color #334155
  Texto destacado: font-weight bold, color #00b4d8
```


## 2.9 — CHECKBOX (Tareas)

```
INCOMPLETO:
  width: 15px, height: 15px
  border-radius: 5px
  background: transparent
  border: 1.5px solid #94a3b8

COMPLETADO:
  width: 15px, height: 15px
  border-radius: 5px
  background: #00b4d8
  border: none
  box-shadow: 0 0 4px rgba(0, 180, 216, 0.15)
  Checkmark: "✓", font-size 8px, color #ffffff

LABEL completado: text-decoration: line-through, color: #94a3b8
LABEL incompleto: color: #334155
```


## 2.10 — INPUT BÚSQUEDA

```
  padding: 7px 13px
  border-radius: 9px
  border: 1px solid rgba(0, 0, 0, 0.06)
  background: #f1f4f9
  font-size: 12px
  color: #94a3b8
  box-shadow: NINGUNA
```


## 2.11 — NOTIFICACIÓN (Campana)

```
CONTENEDOR:
  width: 34px, height: 34px
  border-radius: 9px
  border: 1px solid rgba(0, 0, 0, 0.06)
  background: #f1f4f9
  font-size: 14px
  cursor: pointer

PUNTO ROJO (indicador):
  position: absolute, top: 5px, right: 6px
  width: 6px, height: 6px
  border-radius: 50%
  background: #ef4444
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.25)
```


# ═══════════════════════════════════════════════════════════════
# SECCIÓN 3: SIDEBAR — ESPECIFICACIÓN COMPLETA
# ═══════════════════════════════════════════════════════════════

## 3.1 — CONTENEDOR SIDEBAR

```
  width: 230px
  min-width: 230px
  padding: 22px 0 18px 16px  ← ⚠️ SIN padding-right
  background: linear-gradient(180deg, #0a2540 0%, #0f4c75 50%, #145374 100%)
  display: flex
  flex-direction: column
  position: relative

  Glow ambiental (decorativo, bottom):
    position: absolute, bottom: 0, left: 0, right: 0
    height: 160px
    background: radial-gradient(ellipse at bottom, rgba(0,180,216,0.06), transparent)
    pointer-events: none
```


## 3.2 — LOGO + BADGE EMPRESA

```
BLOQUE LOGO:
  margin-bottom: 28px
  padding: 0 8px

  ICONO "IP":
    width: 36px, height: 36px
    border-radius: 10px
    background: linear-gradient(135deg, #00b4d8, #00d4aa)
    box-shadow: 0 3px 14px rgba(0, 180, 216, 0.30)
    font-size: 13px, font-weight: 800, color: #fff
    letter-spacing: -1px

  "IP-NEXUS":
    font-size: 15px, font-weight: 700, color: #ffffff
    letter-spacing: 0.5px

  "PLATAFORMA IP":
    font-size: 8px, font-weight: 500
    color: rgba(255, 255, 255, 0.28)
    letter-spacing: 2.5px

BADGE EMPRESA (debajo del logo, margin-top: 12px):
  padding: 7px 10px
  border-radius: 8px
  background: rgba(0, 180, 216, 0.06)
  border: 1px solid rgba(0, 180, 216, 0.1)
  display: flex
  align-items: center
  gap: 7px

  Punto luminoso:
    width: 6px, height: 6px
    border-radius: 50%
    background: #00b4d8
    box-shadow: 0 0 6px rgba(0, 180, 216, 0.30)

  Nombre empresa:
    font-size: 9px, font-weight: 600
    color: rgba(255, 255, 255, 0.5)
    letter-spacing: 1.5px
    → Contenido: nombre del tenant (ej: "MERIDIAN IP CONSULTING")
```


## 3.3 — MENU ITEMS

```
ITEM INACTIVO:
  padding: 10px 12px
  border-radius: 12px
  margin-right: 16px
  background: transparent
  cursor: pointer
  z-index: 1

  Icono: font-size 12px, color: rgba(255, 255, 255, 0.28)
  Label: font-size 13px, font-weight 400, color: rgba(255, 255, 255, 0.48)

ITEM SUB-NIVEL INACTIVO:
  padding: 7px 12px 7px 26px
  Icono: font-size 9px, color: rgba(255, 255, 255, 0.28)
  Label: font-size 11px, color: rgba(255, 255, 255, 0.28)

ITEM ACTIVO:
  border-radius: 14px 0 0 14px  ← ⚠️ solo esquinas izquierdas redondeadas
  margin-right: 0  ← ⚠️ se extiende hasta el borde derecho del sidebar
  background: #f1f4f9  ← ⚠️ MISMO color que el fondo del contenido
  z-index: 5  ← ⚠️ CRÍTICO para que las curvas no queden tapadas

  Icono: color #00b4d8, filter: drop-shadow(0 0 4px rgba(0,180,216,0.30))
  Label: font-size 13px, font-weight 700, color: #0a2540
```


## 3.4 — TONGUE CONNECTOR (Curvas cóncavas)

```
⛔ ELEMENTO MÁS DELICADO — COPIAR VALORES EXACTOS, NO MODIFICAR

Solo visible cuando un item está activo.
Crea la ilusión de que el contenido "sale" del sidebar.

CURVA SUPERIOR:
  position: absolute
  right: 0
  top: -20px
  width: 20px
  height: 20px
  background: transparent  ← ⚠️ DEBE SER TRANSPARENT
  border-bottom-right-radius: 14px
  box-shadow: 6px 6px 0 6px #f1f4f9  ← ⚠️ MISMO COLOR QUE bg

CURVA INFERIOR:
  position: absolute
  right: 0
  bottom: -20px
  width: 20px
  height: 20px
  background: transparent  ← ⚠️ DEBE SER TRANSPARENT
  border-top-right-radius: 14px
  box-shadow: 6px -6px 0 6px #f1f4f9  ← ⚠️ MISMO COLOR QUE bg

BARRA ACCENT IZQUIERDA:
  position: absolute
  left: 0
  top: 22%
  bottom: 22%
  width: 3px
  background: #00b4d8
  border-radius: 0 3px 3px 0
  box-shadow: 0 0 8px rgba(0, 180, 216, 0.30)

⚠️ Si el color de fondo de la app cambia, el color en box-shadow
   de las curvas DEBE cambiar al mismo valor.
⚠️ El z-index: 5 del item activo es OBLIGATORIO para que las
   curvas no queden tapadas por items adyacentes.
```


## 3.5 — BADGES EN MENU

```
ACTIVO:
  background: #00b4d8
  color: #ffffff
  font-size: 10px, font-weight: 700
  padding: 2px 8px
  border-radius: 10px
  box-shadow: 0 2px 6px rgba(0, 180, 216, 0.30)

INACTIVO:
  background: rgba(255, 255, 255, 0.06)
  color: #ffffff
  font-size: 10px, font-weight: 700
  padding: 2px 8px
  border-radius: 10px
  box-shadow: none
```


## 3.6 — QUICK ACTIONS (parte inferior sidebar)

```
CONTENEDOR:
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 5px
  padding: 12px 16px 0 8px
  border-top: 1px solid rgba(255, 255, 255, 0.04)

CADA ACCIÓN:
  padding: 6px 4px
  border-radius: 7px
  text-align: center
  background: rgba(255, 255, 255, 0.03)
  cursor: pointer
  font-size: 10px
  color: rgba(255, 255, 255, 0.4)
```


## 3.7 — USUARIO (parte más inferior)

```
AVATAR:
  width: 30px, height: 30px
  border-radius: 9px
  background: linear-gradient(135deg, #00b4d8, #0088cc)
  Iniciales: font-size 10px, font-weight 700, color: #fff

NOMBRE: font-size 11px, font-weight 600, color: #ffffff
ROL: font-size 9px, color: rgba(255, 255, 255, 0.25)
```


# ═══════════════════════════════════════════════════════════════
# SECCIÓN 4: HERO ZONE — SOLO DASHBOARD
# ═══════════════════════════════════════════════════════════════

```
⚠️ ESTE COMPONENTE SE USA ÚNICAMENTE EN EL DASHBOARD
   para agrupar los 4 KPIs principales.
   NO REPLICAR en ninguna otra vista.

CONTENEDOR:
  padding: 12px
  border-radius: 16px
  background: linear-gradient(135deg, #eceef6, #f1f4f9)
  box-shadow: NINGUNA  ← no inset, no sombra
  margin-bottom: 18px

GRID INTERIOR:
  display: grid
  grid-template-columns: repeat(4, 1fr)
  gap: 10px

CARD KPI (dentro):
  padding: 13px 12px
  border-radius: 14px
  border: 1px solid rgba(0, 0, 0, 0.06)
  background: #f1f4f9
  display: flex
  align-items: center
  gap: 12px
```


# ═══════════════════════════════════════════════════════════════
# SECCIÓN 5: COLORES POR CONTEXTO DE NEGOCIO
# ═══════════════════════════════════════════════════════════════

```
FASES DE EXPEDIENTE:
  Fases completadas (antes de la actual)  → {color del expediente}0e (fondo) + {color} (texto)
  Fase actual                             → gradient del color, texto blanco, sombra del color
  Fases futuras                           → rgba(0,0,0,0.02) fondo, #d0d5dd texto

PLAZOS POR URGENCIA:
  ≤ 5 días   → #ef4444 (rojo)    + badge "URGENTE"
  ≤ 15 días  → #f59e0b (ámbar)
  > 15 días  → #64748b (neutral) o color del tipo
  Completado → #10b981 (verde)

RIESGO VIGILANCIA:
  Alto       → #ef4444
  Medio      → #f59e0b
  Bajo       → #10b981

CLIENTES CRM (asignación libre de colores):
  Usar variedad: #10b981, #3b82f6, #f59e0b, #2563eb, #ec4899, #06b6d4
  ❌ NO usar #8b5cf6 (morado)

HERRAMIENTAS IA:
  Disponible     → color asignado, opacity 1
  Beta           → #2563eb
  Próximamente   → #94a3b8 + opacity: 0.4, cursor: default

BACKGROUNDS TINTADOS PARA TAGS:
  Fórmula: {color}0a como background, {color} como texto
  Ejemplo: background: #ef44440a, color: #ef4444
```


# ═══════════════════════════════════════════════════════════════
# SECCIÓN 6: SHELL PRINCIPAL DE LA APLICACIÓN
# ═══════════════════════════════════════════════════════════════

```
FONDO DE PÁGINA:
  background: linear-gradient(180deg, #f1f4f9, #ebeef5)

CONTENEDOR PRINCIPAL (app shell):
  max-width: 1080px (en el prototipo, en app real usar width completo)
  display: flex
  background: #f1f4f9
  border-radius: 16px
  overflow: hidden
  box-shadow: 14px 14px 40px #cdd1dc, -14px -14px 40px #ffffff

ÁREA DE CONTENIDO (junto al sidebar):
  flex: 1
  padding: 24px
  overflow: auto

FONT GLOBAL:
  font-family: 'DM Sans', 'Segoe UI', -apple-system, sans-serif
```


# ═══════════════════════════════════════════════════════════════
# SECCIÓN 7: RESUMEN EJECUTIVO — CHEAT SHEET
# ═══════════════════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────┐
│                    IP-NEXUS SILK — RESUMEN                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FONDO APP:        #f1f4f9                                  │
│  NAVY:             #0a2540                                  │
│  ACCENT:           #00b4d8 → #00d4aa                        │
│  TEXTOS:           #334155 / #64748b / #94a3b8              │
│                                                             │
│  CARDS:            solo borde rgba(0,0,0,0.06)              │
│                    SIN sombra                               │
│                                                             │
│  BADGES:           sombra neumórfica SIEMPRE                │
│                    4px 4px 10px #cdd1dc, -4px -4px...       │
│                                                             │
│  BOTONES:          primario = gradient + glow               │
│                    secundario = neumórfica pequeña           │
│                                                             │
│  TABS:             contenedor = inset neumórfico            │
│                    tab activo = neumórfica pequeña           │
│                                                             │
│  SIDEBAR:          navy gradient + tongue + badge empresa   │
│                                                             │
│  ❌ MORADO:        ELIMINADO → usar #2563eb                 │
│  ❌ SOFTZONES:     ELIMINADO → no usar                      │
│  ❌ SOMBRAS CARDS: ELIMINADO → solo bordes                  │
│                                                             │
│  ⛔ NO TOCAR:      funcionalidad, datos, tablas, formularios│
│                    rutas, lógica, estados, integraciones     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```


# ═══════════════════════════════════════════════════════════════
# ARCHIVO DE REFERENCIA VISUAL
# ═══════════════════════════════════════════════════════════════

El archivo `ipnexus-silk-final.jsx` contiene la implementación
completa del prototipo visual con los 7 módulos:
  1. Dashboard
  2. Expedientes (lista)
  3. Expediente Detalle
  4. Plazos y Vencimientos
  5. CRM — Clientes
  6. Vigilancia de Marcas (IP-SPIDER)
  7. IA & Análisis (IP-GENIUS)

En caso de duda sobre cualquier valor, consultar ese archivo
como fuente de verdad.
