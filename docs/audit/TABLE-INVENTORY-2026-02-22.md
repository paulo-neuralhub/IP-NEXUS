# IP-NEXUS — Inventario Completo de Tablas en Supabase

> **Fecha**: 2026-02-22
> **Proyecto Supabase**: `dcdbpmbzizzzzdfkvohl`
> **Nota**: Esta BD es compartida entre **IP-NEXUS** y **Umbrella Brands**.

---

## Resumen

| Proyecto | Tablas | Notas |
|----------|--------|-------|
| 🧠 IP-NEXUS: AI / Genius | ~75 | Prefijos `ai_`, `agent_`, `genius_`, `rag_` |
| 📁 IP-NEXUS: Docket / Matters | ~50 | Prefijos `matter_`, `deadline_`, `nice_`, `holder_`, `filing_` |
| 🤝 IP-NEXUS: CRM | ~25 | Prefijos `crm_`, más `contacts`, `deals`, `pipelines`, `pipeline_stages` |
| 💰 IP-NEXUS: Finance / Billing | ~35 | Prefijos `invoice_`, `billing_`, `finance_`, `subscription_`, `payment_`, `quote_`, `provision_`, `expense_`, `fee_` |
| 🔄 IP-NEXUS: DataHub / Migration | ~40 | Prefijos `ipo_`, `ip_office_`, `import_`, `migration_`, `data_` |
| 🕷️ IP-NEXUS: Spider / Vigilancia | ~35 | Prefijos `spider_`, `comp_`, `monitoring_`, `surveillance_`, `watch_`, `gazette_` |
| 📄 IP-NEXUS: Documents | ~20 | Prefijos `document_`, `doc_template`, `signature_`, `generated_` |
| 📧 IP-NEXUS: Email / Marketing | ~15 | Prefijos `email_`, `contact_list` |
| ⚙️ IP-NEXUS: Automation | ~8 | Prefijo `automation_` |
| 🌐 IP-NEXUS: Portal | ~5 | Prefijo `portal_`, `client_portal` |
| 📞 IP-NEXUS: Telephony / VoIP | ~5 | Prefijos `telephony_`, `voip_`, `call_` |
| 🏪 IP-NEXUS: Market / Agents | ~10 | Prefijos `market_`, `rfq_`, `kyc_` |
| 📅 IP-NEXUS: Calendar | ~5 | Prefijos `calendar_`, `appointment_`, `availability_` |
| 🔔 IP-NEXUS: Notifications | ~5 | Prefijos `notification_`, `push_`, `internal_notification` |
| 📊 IP-NEXUS: Analytics | ~8 | Prefijo `analytics_` |
| 🔐 IP-NEXUS: RBAC / Security | ~15 | `roles`, `permissions`, `memberships`, `resource_permissions`, `api_keys` |
| 🏢 IP-NEXUS: Backoffice | ~5 | Prefijo `backoffice_` |
| 📚 IP-NEXUS: Help System | ~15 | Prefijo `help_` |
| 🎯 IP-NEXUS: Demo / Onboarding | ~5 | Prefijos `demo_`, `onboarding_`, `contextual_guide` |
| ⚠️ COMPARTIDO | ~10 | `organizations`, `users`, `user_preferences`, `activity_log`, `access_logs`, `activities`, `active_sessions` |
| ❓ REVISAR | ~15 | Tablas genéricas sin prefijo claro |

---

## Detalle por Módulo

### 🧠 AI / Genius (~75 tablas)

Todas las tablas de inteligencia artificial, AI Brain, agentes y conocimiento.

| Tabla | Descripción estimada |
|-------|---------------------|
| `ai_agent_messages` | Mensajes de agentes IA |
| `ai_agent_sessions` | Sesiones de agentes IA |
| `ai_annual_cost_summary` | Resumen anual de costes IA |
| `ai_budget_alerts` | Alertas de presupuesto IA |
| `ai_budget_config` | Configuración de presupuestos |
| `ai_capabilities` | Capacidades IA registradas |
| `ai_capability_assignments` | Asignación de capacidades a modelos |
| `ai_circuit_breaker_states` | Estado del circuit breaker |
| `ai_conversations` | Conversaciones IA (APP) |
| `ai_cost_history` | Histórico de costes |
| `ai_execution_logs` | Logs de ejecución |
| `ai_function_config` | Config de funciones IA |
| `ai_generated_documents` | Documentos generados por IA |
| `ai_glossary_terms` | Glosario de términos |
| `ai_kb_disclaimers` | Disclaimers de base de conocimiento |
| `ai_kb_jurisdictions` | KB por jurisdicción |
| `ai_kb_legal_areas` | KB por área legal |
| `ai_knowledge_base` | Base de conocimiento principal |
| `ai_messages` | Mensajes IA genéricos |
| `ai_model_catalog` | Catálogo de modelos |
| `ai_model_prices` | Precios de modelos |
| `ai_models` | Modelos registrados |
| `ai_module_config` | Config por módulo |
| `ai_module_usage` | Uso por módulo |
| `ai_optimization_suggestions` | Sugerencias de optimización |
| `ai_prompt_changes` | Cambios en prompts |
| `ai_prompt_comments` | Comentarios en prompts |
| `ai_prompt_templates` | Templates de prompts |
| `ai_prompts` | Prompts del sistema |
| `ai_provider_connections` | Conexiones a proveedores |
| `ai_provider_health_log` | Log de salud de proveedores |
| `ai_providers` | Proveedores IA (Anthropic, OpenAI, etc.) |
| `ai_quality_evaluations` | Evaluaciones de calidad |
| `ai_rag_collections` | Colecciones RAG |
| `ai_rate_limits` | Límites de rate IA |
| `ai_request_logs` | Logs de peticiones |
| `ai_task_assignments` | Asignaciones de tareas IA |
| `ai_task_rag_config` | Config RAG por tarea |
| `ai_tasks` | Tareas IA (router) |
| `ai_test_cases` | Casos de test |
| `ai_test_results` | Resultados de test |
| `ai_test_runs` | Ejecuciones de test |
| `ai_test_suites` | Suites de test |
| `ai_tier_quotas` | Cuotas por tier |
| `ai_transaction_ledger` | Ledger de transacciones IA |
| `ai_translation_glossaries` | Glosarios de traducción |
| `ai_translations` | Traducciones |
| `ai_usage` | Uso IA (genérico) |
| `ai_usage_aggregates` | Agregados de uso |
| `ai_usage_events` | Eventos de uso |
| `ai_usage_log` | Log de uso |
| `agent_audit_log` | Auditoría de agentes |
| `agent_badges` | Badges de agentes (Market) |
| `agent_chat_messages` | Chat de agentes |
| `agent_chat_sessions` | Sesiones de chat |
| `agent_config` | Configuración de agentes |
| `agent_emails` | Emails de agentes |
| `agent_instance_config` | Config por instancia |
| `agent_jurisdiction_profiles` | Perfiles jurisdiccionales |
| `agent_learned_knowledge` | Conocimiento aprendido |
| `agent_memory` | Memoria de agentes |
| `agent_portal_monitors` | Monitores de portal |
| `agent_providers_config` | Config de proveedores |
| `agent_query_log` | Log de consultas |
| `agent_rankings` | Rankings de agentes |
| `genius_generated_documents` | Docs generados por Genius |
| `genius_legal_sources` | Fuentes legales Genius |
| `genius_official_fees` | Tasas oficiales Genius |
| `genius_trademark_comparisons` | Comparaciones de marcas |
| `rag_chunks` | Chunks de RAG |
| `rag_collections` | Colecciones RAG |
| `rag_documents` | Documentos RAG |
| `rag_ingestion_jobs` | Jobs de ingestión |

### 📁 Docket / Matters (~50 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `matters` | Expedientes principales |
| `matter_*` | ~30 tablas: documents, deadlines, events, holders, classes, notes, contacts, fees, etc. |
| `deadline_*` | alerts, notifications, reminders, rules, types |
| `nice_classes` | Clasificación de Niza |
| `holders` | Titulares |
| `filing_*` | applications, drafts, templates, submissions, status_history |
| `classification_*` | sync_logs, systems |
| `ipc_*` | classes, groups, sections, subclasses |

### 🤝 CRM (~25 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `crm_accounts` | Cuentas CRM (empresas) |
| `crm_contacts` | Contactos CRM |
| `crm_deals` | Deals/Oportunidades |
| `crm_pipelines` | Pipelines |
| `crm_pipeline_stages` | Etapas de pipeline |
| `crm_activities` | Actividades CRM |
| `crm_interactions` | Interacciones |
| `crm_leads` | Leads |
| `crm_lead_events` | Eventos de leads |
| `crm_tasks` | Tareas CRM |
| `crm_email_*` | templates, tracking |
| `crm_message_templates` | Templates de mensajes |
| `crm_whatsapp_*` | messages, templates |
| `crm_voip_calls` | Llamadas VoIP |
| `crm_automation_*` | automations, executions, templates, approvals, action_types |
| `crm_ai_*` | recommendations, learning_logs |
| `crm_pipeline_template*` | templates, audit |
| `contacts` | Contactos legacy/compartido |
| `deals` | Deals legacy |
| `pipelines` | Pipelines legacy |
| `pipeline_stages` | Etapas legacy |

### 💰 Finance / Billing (~35 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `invoices` | Facturas |
| `invoice_items` | Líneas de factura |
| `invoice_payments` | Pagos de facturas |
| `invoice_sequences` | Secuencias de numeración |
| `invoice_series` | Series de facturación |
| `billing_clients` | Clientes de facturación |
| `billing_events` | Eventos de billing |
| `billing_rates` | Tarifas |
| `finance_*` | budgets, categories, portfolios, transactions, valuations, vendors |
| `subscription_*` | subscriptions, events, etc. |
| `payment_*` | alerts, history, methods |
| `quote_*` | quotes, items |
| `provision_*` | provisiones |
| `expense_*` | expenses, categories |
| `exchange_rates` | Tipos de cambio |
| `fiscal_settings` | Configuración fiscal |
| `fee_verification_log` | Log de verificación de tasas |
| `stripe_*` | Integración Stripe |

### 🔄 DataHub / IPO Registry (~40 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `ipo_offices` | Oficinas de PI (master registry) |
| `ipo_*` | ~30 tablas: api_configs, alerts, connection_methods, credentials, deadline_rules, fees, health_checks, holidays, knowledge_base, legal_*, sync_logs, etc. |
| `ip_office_*` | apis, fees, research_queue, update_logs |
| `import_*` | files, jobs, mapping_templates, review_queue, sources, templates, etc. |
| `migration_*` | Tablas de migración |
| `data_*` | connectors, exports, imports, retention_policies, audit_log |
| `jurisdiction_*` | aliases, change_patterns, fees, filing_requirements, rules, etc. |

### 🕷️ Spider / Competitive Intelligence (~35 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `spider_*` | Tablas de vigilancia |
| `comp_*` | ~30 tablas: competitors, captures, prices, analyses, discoveries, market_analysis, etc. |
| `monitoring_*` | Monitoreo |
| `surveillance_*` | Vigilancia |
| `watch_*` | Alertas de vigilancia |
| `gazette_sources` | Fuentes de boletines |
| `kb_*` | sources, source_checks, update_queue |

### 📄 Documents (~20 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `documents` | Documentos principales |
| `document_*` | chunks, embeddings, entities, extractions, sequences, styles, templates, types, validation_*, versions |
| `doc_templates` | Templates de documentos |
| `generated_*` | documents, reports |
| `signature_*` | Firma electrónica |

### 📧 Email / Marketing (~15 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `email_*` | campaigns, clicks, configs, ingestion_queue, messages, queue, sends, signatures, templates, unsubscribes |
| `contact_list_members` | Miembros de listas |
| `contact_lists` | Listas de contactos |

### ⚙️ Automation (~8 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `automation_*` | email_logs, enrollments, event_queue, execution_logs_legacy, executions, master_templates, rules, variables |
| `automations` | Automatizaciones |

### 🌐 Portal (~5 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `portal_*` | Tablas del portal de clientes |
| `client_portals` | Portales de clientes |

### 📞 Telephony / VoIP (~5 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `telephony_*` | Tablas de telefonía |
| `voip_*` | VoIP |
| `call_logs` | Registro de llamadas |
| `audio_transcriptions` | Transcripciones |

### 🏪 Market / Agents (~10 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `market_*` | users, listings, transactions, etc. |
| `rfq_*` | Request for quote |
| `kyc_*` | Know your customer |

### 📅 Calendar (~5 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `calendar_*` | connections, event_mappings, integrations |
| `appointment_*` | blocked_dates, custom_slots, settings |
| `appointments` | Citas |
| `availability_*` | exceptions, slots |

### 🔔 Notifications (~5 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `notification_*` | notifications, preferences, etc. |
| `push_subscriptions` | Suscripciones push |
| `internal_notifications` | Notificaciones internas |
| `admin_notifications` | Notificaciones de admin |

### 📊 Analytics (~8 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `analytics_*` | cohorts, daily_metrics, events, feature_usage, subscription_events, tenant_metrics |

### 🔐 RBAC / Security (~15 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `roles` | Roles del sistema |
| `permissions` | Permisos |
| `memberships` | Membresías org-usuario |
| `role_permissions` | Relación roles-permisos |
| `resource_permissions` | Permisos por recurso |
| `api_keys` | Claves API |
| `api_rate_limits` | Límites de rate |
| `webhook_events` | Eventos webhook |
| `consent_audit_log` | Log de consentimiento |
| `gdpr_requests` | Solicitudes GDPR |
| `data_retention_policies` | Políticas de retención |
| `feature_flags` | Feature flags |
| `invitations` | Invitaciones |

### 🏢 Backoffice (~5 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `backoffice_chatbot_*` | actions, config, conversations, messages |

### 📚 Help System (~15 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `help_*` | announcements, articles, categories, faqs, rules, search_logs, system_status, tooltips, tours, etc. |
| `faqs` | FAQs genéricas |
| `contextual_guide_progress` | Progreso de guías |

### 🎯 Demo / Onboarding (~5 tablas)

| Tabla | Descripción estimada |
|-------|---------------------|
| `demo_*` | config, seed_entities, seed_runs, sessions |
| `onboarding_*` | Onboarding |

---

## ⚠️ Tablas COMPARTIDAS (IP-NEXUS + Umbrella Brands)

Estas tablas son usadas por ambos proyectos:

| Tabla | Notas |
|-------|-------|
| `organizations` | Tabla core de organizaciones/tenants |
| `users` | Perfiles de usuarios |
| `user_preferences` | Preferencias de usuario |
| `memberships` | Relación usuario-organización |
| `activities` | Actividades genéricas |
| `activity_action_types` | Tipos de acción |
| `activity_log` | Log de actividad |
| `access_logs` | Logs de acceso |
| `access_audit_log` | Auditoría de acceso |
| `active_sessions` | Sesiones activas |

---

## ❓ Tablas a REVISAR (clasificación ambigua)

| Tabla | Posible proyecto |
|-------|-----------------|
| `_backup_organization_offices` | Backup / temporal |
| `b2c_cases` | ¿Umbrella Brands? |
| `blockchain_timestamps` | ¿IP-NEXUS o compartido? |
| `capabilities` | ¿Genérico? |
| `capability_usage` | ¿Genérico? |
| `change_history` | ¿Genérico? |
| `chatbot_configs` | ¿Umbrella Brands chatbot? |
| `chatbot_conversations` | ¿Umbrella Brands chatbot? |
| `chatbot_leads` | ¿Umbrella Brands chatbot? |
| `chatbot_messages` | ¿Umbrella Brands chatbot? |
| `clients` | ¿Legacy IP-NEXUS? |
| `client_*` (contacts, documents, folders, holders, relationships, tags, type_config) | ¿Legacy IP-NEXUS? |
| `communication_*` | ¿Compartido? |
| `compliance_checks` | ¿IP-NEXUS? |
| `correction_reason_codes` | ¿IP-NEXUS Finance? |
| `dashboard_widgets` / `dashboards` | ¿Compartido? |
| `directory_change_log` | ¿IP-NEXUS? |
| `event_type_catalog` | ¿Compartido? |
| `exports` | ¿Compartido? |
| `external_api_*` | ¿IP-NEXUS? |
| `extraction_suggestion_log` | ¿IP-NEXUS AI? |
| `file_imports` | ¿IP-NEXUS? |
| `frontend_error_log` | ¿Compartido? |
| `holiday_calendars` / `holidays` | ¿Compartido? |
| `integration_*` | ¿Compartido? |
| `internal_reference_*` | ¿IP-NEXUS? |
| `ip_offices_deprecated_20260216` | Deprecated / borrar |

---

## 🔑 Conclusión

**Total estimado: ~400+ tablas** en `public` schema.

- **~95% son IP-NEXUS** — el proyecto domina completamente la BD.
- **~10 tablas compartidas** (auth, orgs, logs) necesitan cuidado especial.
- **~15 tablas ambiguas** necesitan clasificación manual (especialmente `chatbot_*`, `b2c_cases`, `client_*` legacy).
- **No se han encontrado tablas con prefijo `umbrella_`, `brand_registration_`, `trademark_order_`** — lo que sugiere que Umbrella Brands podría usar un subset de las tablas genéricas (chatbot, b2c, client) o que sus tablas específicas ya fueron migradas/eliminadas.

### Recomendación

1. **Confirmar** qué tablas usa realmente Umbrella Brands (probablemente `chatbot_*`, `b2c_cases`, y posiblemente `client_*`)
2. **Marcar para borrado** las tablas deprecated (`ip_offices_deprecated_20260216`, `_backup_*`)
3. **Separar** si se decide aislar Umbrella en su propio Supabase
