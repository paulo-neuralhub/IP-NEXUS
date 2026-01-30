# Memory: architecture/system-verification-infrastructure
Updated: 2026-01-30

IP-NEXUS cuenta con una infraestructura de verificación y auditoría automatizada (L109) para supervisar la salud de la plataforma. Este sistema incluye la tabla `system_tests`, la vista `system_test_summary` y la Edge Function `run-system-tests`, permitiendo ejecutar más de 100 pruebas funcionales en 21 categorías críticas (Auth, CRM, Facturación, etc.). Los resultados son accesibles mediante un dashboard de 'System Verification' en el Backoffice (`/backoffice/system-tests`), facilitando la detección proactiva de errores y la exportación de reportes de estado.

## Tablas creadas en L109B

### Comunicaciones
- `email_messages`: Almacena emails con tracking de apertura/clicks, threading, routing automático
- `call_logs`: Registro de llamadas con transcripciones, AI summary, y métricas VoIP
- `email_configs`: Configuración multi-proveedor (SMTP, Gmail, Outlook, SendGrid, Resend)

### Workflow
- `workflow_definitions`: Definiciones de flujos de trabajo (sistema + custom por org)
- `workflow_steps`: Pasos del workflow con códigos F0-F9 para PI
- `workflow_transitions`: Transiciones permitidas entre pasos
- `workflow_runs`: Ejecuciones activas de workflows por expediente

### Portal del Cliente
- `portal_configurations`: Configuración del portal por organización
- `portal_access_tokens`: Tokens de acceso para clientes externos
- `portal_file_access_log`: Auditoría de acceso a documentos

### Configuración
- `matter_type_configs`: Tipos de expediente (18 tipos sistema: TM, PT, DS, etc.)
- `nice_classes`: 45 clases Nice completas con traducciones ES/EN
- `invoice_sequences`: Secuencias de numeración de facturas por año

## Datos inicializados

- Workflow estándar PI con 10 fases (F0-F9)
- 18 tipos de expediente predefinidos
- 45 clases Nice con iconos y colores
- Secuencias de facturación inicializadas por organización
- Configuraciones de portal vacías por organización
