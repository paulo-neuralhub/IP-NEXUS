# Memory: features/ip-classification-system-complete
Updated: 2026-02-01

Sistema completo de clasificaciones de Propiedad Intelectual con datos oficiales WIPO implementado:

## Clasificaciones soportadas

| Sistema | Tablas | Registros | Uso |
|---------|--------|-----------|-----|
| **Niza (NCL)** | nice_classes, nice_products | 45 clases + 211 productos | Marcas |
| **IPC** | ipc_sections, ipc_classes, ipc_subclasses, ipc_groups | 8 secciones base | Patentes |
| **Locarno** | locarno_classes, locarno_subclasses, locarno_items | 32 clases | Diseños industriales |
| **Viena** | vienna_categories, vienna_divisions, vienna_sections | 29 categorías | Elementos figurativos |

## Funciones de búsqueda SQL

- `search_nice_items(query, class_numbers[], limit)` - Búsqueda full-text en productos Niza
- `search_ipc_groups(query, section, limit)` - Búsqueda en grupos IPC
- `search_locarno_items(query, class_number, limit)` - Búsqueda en productos Locarno
- `search_vienna_sections(query, category_code, limit)` - Búsqueda en secciones Viena

## Componentes frontend

- `src/components/classifications/IPCSelector.tsx` - Selector visual de códigos IPC con grid de secciones
- `src/components/classifications/LocarnoSelector.tsx` - Selector de clases Locarno con grid 32 clases
- `src/components/classifications/ViennaSelector.tsx` - Selector de elementos figurativos por categoría
- `src/hooks/use-classifications.ts` - Hooks unificados para todas las clasificaciones

## Edge Function

- `supabase/functions/wipo-sync/index.ts` - Sincronización con fuentes WIPO
  - Acción `status`: Estado de sistemas y últimos syncs
  - Acción `seed`: Siembra de datos iniciales
  - Acción `sync`: Sincronización completa (requiere configuración WIPO API)

## Tablas de soporte

- `classification_systems` - Registro de versiones y última sincronización
- `classification_sync_logs` - Historial de sincronizaciones con estadísticas
