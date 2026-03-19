
Objetivo: investigar por qué al entrar con `paulo.chalaca.ai@gmail.com` la app pide crear una nueva organización, sin hacer cambios todavía.

Resumen del problema
- El login sí funciona en Supabase.
- El desvío a `/onboarding` ocurre porque la app no logra resolver la organización actual del usuario.
- La causa principal no es la contraseña ni la sesión: es una desalineación entre el código y el esquema real de la base de datos.

Hallazgos confirmados
1. El usuario sí inicia sesión
- En los logs de auth aparece `Login` exitoso para el user id:
  `0090b656-5c9a-445c-91be-34228afb2b0f`

2. El código espera tablas que no existen
- `src/contexts/auth-context.tsx` lee desde `public.users`
- `src/contexts/organization-context.tsx` lee desde `public.memberships`
- `src/pages/app/Onboarding.tsx` intenta crear/leer `users` y `memberships`

3. La base real no tiene esas tablas
Consulta de esquema:
- existen: `public.profiles`, `public.organizations`
- no existen: `public.users`, `public.memberships`

4. La estructura real de `profiles` confirma otro modelo
Columnas relevantes en `public.profiles`:
- `id`
- `organization_id`
- `first_name`
- `last_name`
- `role`

Eso coincide con el modelo recordado del proyecto: la relación usuario-organización vive en `profiles.organization_id`, no en `memberships`.

5. Para este usuario no existe perfil enlazado
Consulta por el user id autenticado:
- `public.profiles` no devolvió fila
- tampoco se encontró organización asociada

Conclusión
Hay dos fallos encadenados:
1. El frontend consulta tablas equivocadas (`users`, `memberships`)
2. El usuario autenticado no tiene fila correspondiente en `public.profiles`

Por eso `OrganizationProvider` termina sin organización, marca `needsOnboarding = true` y `OrgGuard` lo envía a `/onboarding`.

Impacto exacto en el flujo
```text
login correcto
→ AuthProvider obtiene sesión
→ OrganizationProvider busca memberships
→ la tabla real no existe / no devuelve datos útiles
→ currentOrganization = null
→ needsOnboarding = true
→ OrgGuard redirige a /onboarding
```

Plan de corrección recomendado
1. Alinear el frontend con el esquema real
- `auth-context`: dejar de leer `users`; usar `profiles`
- `organization-context`: dejar de leer `memberships`; resolver organización desde `profiles.organization_id`
- `Onboarding`: dejar de crear `users` y `memberships`; usar `profiles` para vincular el usuario a la nueva organización

2. Resolver la ausencia de perfil del usuario
- Verificar si el perfil debía crearse automáticamente y no se creó
- Crear o restaurar la fila en `public.profiles` para `0090b656-5c9a-445c-91be-34228afb2b0f`
- Asignarle su `organization_id` real

3. Revisar referencias secundarias
- Hay más archivos que todavía usan `memberships`, así que el arreglo debe ser consistente para evitar nuevos fallos en otras pantallas

4. Validar el flujo final
- login
- carga de perfil
- carga de organización
- entrada a `/app/dashboard` sin pasar por creación de organización

Reversión
- No recomiendo revertir todavía como primera medida.
- El problema investigado parece ser una mezcla de:
  - código apuntando a tablas antiguas
  - datos faltantes para este usuario
- Revertir podría ocultar parte del problema, pero no garantiza recuperar el perfil faltante.
- Si necesitas volver de inmediato a la última versión estable, lo correcto sería usar el History de Lovable, no el `scripts/rollback.sh`.

Detalles técnicos
- Archivo crítico 1: `src/contexts/auth-context.tsx`
  - hoy: `supabase.from("users")`
  - debería adaptarse a `profiles`
- Archivo crítico 2: `src/contexts/organization-context.tsx`
  - hoy: `supabase.from("memberships")`
  - debería resolver desde `profiles.organization_id` y luego leer `organizations`
- Archivo crítico 3: `src/pages/app/Onboarding.tsx`
  - hoy: inserta en `users` y `memberships`
  - debería crear organización y después actualizar `profiles.organization_id` + `role`

Decisión recomendada
- No hacer revert por ahora
- Hacer una corrección dirigida del flujo auth/organization y revisar el perfil del usuario en Supabase
- Si quieres, en el siguiente paso te preparo el plan exacto de implementación o hago la corrección directamente
