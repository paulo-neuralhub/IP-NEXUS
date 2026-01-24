-- ============================================
-- Landing Pages para módulos standalone
-- ============================================

CREATE TABLE public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  module_code VARCHAR(50) NOT NULL,
  
  -- SEO
  title VARCHAR(255) NOT NULL,
  meta_description VARCHAR(500),
  
  -- Hero Section
  hero_title VARCHAR(255) NOT NULL,
  hero_subtitle TEXT,
  hero_cta_text VARCHAR(100) DEFAULT 'Empezar Gratis',
  hero_cta_url VARCHAR(255) DEFAULT '/auth/register',
  hero_secondary_cta_text VARCHAR(100),
  hero_secondary_cta_url VARCHAR(255),
  hero_image_url TEXT,
  hero_video_url TEXT,
  
  -- Secciones dinámicas (JSONB)
  features JSONB DEFAULT '[]'::jsonb,
  pricing_plans JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  
  -- Configuración CTA final
  final_cta_title VARCHAR(255),
  final_cta_subtitle TEXT,
  final_cta_type VARCHAR(50) DEFAULT 'form', -- 'form', 'button', 'calendly'
  final_cta_config JSONB DEFAULT '{}'::jsonb,
  
  -- Estado
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios para documentar estructura JSONB
COMMENT ON COLUMN public.landing_pages.features IS 'Array de features: [{icon, title, description, image_url}]';
COMMENT ON COLUMN public.landing_pages.pricing_plans IS 'Array de planes: [{name, price, currency, period, features[], cta_text, cta_url, is_popular}]';
COMMENT ON COLUMN public.landing_pages.testimonials IS 'Array de testimonios: [{name, role, company, avatar_url, quote, rating}]';
COMMENT ON COLUMN public.landing_pages.faqs IS 'Array de FAQs: [{question, answer}]';

-- Índices
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_module ON public.landing_pages(module_code);
CREATE INDEX idx_landing_pages_published ON public.landing_pages(is_published) WHERE is_published = true;

-- Trigger para updated_at
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS (público para lectura si está publicado)
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer páginas publicadas
CREATE POLICY "Landing pages publicadas son públicas"
  ON public.landing_pages
  FOR SELECT
  USING (is_published = true);

-- Solo backoffice puede gestionar (TODO: añadir check de rol admin)
CREATE POLICY "Backoffice puede gestionar landing pages"
  ON public.landing_pages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insertar landing pages iniciales
INSERT INTO public.landing_pages (slug, module_code, title, meta_description, hero_title, hero_subtitle, hero_cta_text, hero_secondary_cta_text, hero_secondary_cta_url, features, pricing_plans, testimonials, faqs, final_cta_title, final_cta_subtitle, is_published) VALUES

-- SPIDER - Vigilancia de marcas
('spider', 'spider', 
 'Spider - Vigilancia de Marcas | IP-NEXUS',
 'Monitoriza tu marca 24/7. Detecta conflictos antes de que sean un problema. Alertas automáticas de nuevas solicitudes similares.',
 'Vigila tu marca mientras duermes',
 'Spider monitoriza millones de solicitudes de marcas en todo el mundo y te alerta instantáneamente cuando detecta un posible conflicto.',
 'Empezar Gratis',
 'Ver Demo',
 '/demo/spider',
 '[
   {"icon": "radar", "title": "Vigilancia 24/7", "description": "Monitorización continua en más de 180 jurisdicciones. Nunca más te perderás una solicitud conflictiva."},
   {"icon": "bell", "title": "Alertas Inteligentes", "description": "IA que filtra el ruido y solo te notifica lo relevante. Sin falsos positivos."},
   {"icon": "shield", "title": "Reacciona a Tiempo", "description": "Detecta oposiciones potenciales en la ventana de tiempo legal para actuar."},
   {"icon": "chart", "title": "Informes Detallados", "description": "Reportes automáticos con análisis de riesgo y recomendaciones de acción."}
 ]'::jsonb,
 '[
   {"name": "Básico", "price": 49, "currency": "EUR", "period": "mes", "features": ["5 marcas monitorizadas", "1 jurisdicción", "Alertas por email", "Informe mensual"], "cta_text": "Empezar", "is_popular": false},
   {"name": "Profesional", "price": 149, "currency": "EUR", "period": "mes", "features": ["25 marcas monitorizadas", "UE + España", "Alertas en tiempo real", "Análisis de riesgo IA", "API access"], "cta_text": "Empezar", "is_popular": true},
   {"name": "Enterprise", "price": null, "currency": "EUR", "period": "mes", "features": ["Marcas ilimitadas", "Global (180+ países)", "Alertas personalizadas", "Integración sistemas", "Account manager"], "cta_text": "Contactar", "is_popular": false}
 ]'::jsonb,
 '[
   {"name": "María García", "role": "IP Manager", "company": "TechCorp España", "quote": "Spider nos alertó de una marca conflictiva 3 días después de su publicación. Pudimos oponernos a tiempo y proteger nuestra marca.", "rating": 5},
   {"name": "Carlos Rodríguez", "role": "Socio", "company": "García & Asociados", "quote": "Antes dedicábamos 2 horas diarias a vigilancia manual. Ahora Spider lo hace en segundos y con mejor precisión.", "rating": 5}
 ]'::jsonb,
 '[
   {"question": "¿Cuántas jurisdicciones cubre Spider?", "answer": "Spider monitoriza más de 180 países y organizaciones regionales como EUIPO, WIPO, USPTO, y oficinas nacionales de todo el mundo."},
   {"question": "¿Con qué frecuencia se actualizan los datos?", "answer": "Los datos se actualizan diariamente para la mayoría de jurisdicciones. Para EUIPO y oficinas principales, las actualizaciones son casi en tiempo real."},
   {"question": "¿Puedo exportar los informes?", "answer": "Sí, todos los informes se pueden exportar en PDF, Excel o integrar directamente en tu sistema mediante nuestra API."},
   {"question": "¿Qué pasa si detecto una marca conflictiva?", "answer": "Spider incluye recomendaciones de acción y plazos legales. Además, puedes solicitar un análisis detallado de nuestro equipo legal."},
   {"question": "¿Hay período de prueba?", "answer": "Sí, ofrecemos 14 días de prueba gratuita en todos los planes sin necesidad de tarjeta de crédito."}
 ]'::jsonb,
 '¿Listo para proteger tu marca?',
 'Empieza tu vigilancia gratuita de 14 días. Sin tarjeta de crédito.',
 true),

-- GENIUS - IA para PI
('genius', 'genius',
 'Genius - IA Legal para Propiedad Intelectual | IP-NEXUS',
 'Asistente de IA especializado en PI. Redacta reivindicaciones, analiza patentes, responde consultas legales complejas.',
 'El copiloto de IA para profesionales de PI',
 'Genius es una IA entrenada específicamente en propiedad intelectual. Redacta, analiza, investiga y aprende de cada jurisdicción.',
 'Probar Genius',
 'Ver Casos de Uso',
 '/demo/genius',
 '[
   {"icon": "brain", "title": "Especializado en PI", "description": "No es un ChatGPT genérico. Genius está entrenado con millones de patentes, marcas y jurisprudencia de PI."},
   {"icon": "file-text", "title": "Redacción Asistida", "description": "Genera borradores de reivindicaciones, memorias descriptivas y respuestas a oficina."},
   {"icon": "search", "title": "Investigación Profunda", "description": "Busca anterioridades, analiza freedom-to-operate y evalúa patentabilidad."},
   {"icon": "globe", "title": "Multi-jurisdicción", "description": "Conoce las particularidades de cada oficina: USPTO, EPO, SIPO, JPO y más."}
 ]'::jsonb,
 '[
   {"name": "España", "price": 79, "currency": "EUR", "period": "mes", "features": ["Legislación española", "OEPM", "100 consultas/mes", "Historial conversaciones"], "cta_text": "Empezar", "is_popular": false},
   {"name": "Europa", "price": 149, "currency": "EUR", "period": "mes", "features": ["España + UE", "EPO + EUIPO", "500 consultas/mes", "Generación documentos", "API access"], "cta_text": "Empezar", "is_popular": true},
   {"name": "Global", "price": 249, "currency": "EUR", "period": "mes", "features": ["Todas las jurisdicciones", "Consultas ilimitadas", "Modelos premium", "Entrenamiento custom", "Soporte prioritario"], "cta_text": "Empezar", "is_popular": false}
 ]'::jsonb,
 '[
   {"name": "Elena Martínez", "role": "Abogada de Patentes", "company": "Innovatech Legal", "quote": "Genius me ahorra 3 horas por informe de patentabilidad. La calidad del análisis es impresionante.", "rating": 5},
   {"name": "David López", "role": "Director de PI", "company": "Pharma Ibérica", "quote": "Lo uso para borradores iniciales de reivindicaciones. Acelera muchísimo el proceso de redacción.", "rating": 5}
 ]'::jsonb,
 '[
   {"question": "¿Genius reemplaza al abogado de PI?", "answer": "No, Genius es un asistente que potencia al profesional. Todas las respuestas deben ser revisadas por un experto. Genius incluye disclaimers y niveles de confianza."},
   {"question": "¿Con qué datos está entrenado?", "answer": "Genius está entrenado con bases de datos públicas de patentes, marcas, jurisprudencia y legislación de PI de múltiples jurisdicciones."},
   {"question": "¿Puedo entrenar Genius con mis propios datos?", "answer": "En el plan Global, ofrecemos la posibilidad de fine-tuning con documentos propios (manteniendo confidencialidad)."},
   {"question": "¿Qué nivel de precisión tiene?", "answer": "Genius incluye un indicador de confianza en cada respuesta. Para consultas sobre legislación consolidada, la precisión supera el 95%."},
   {"question": "¿Mis conversaciones son confidenciales?", "answer": "Absolutamente. Las conversaciones están encriptadas y no se usan para entrenar modelos públicos."}
 ]'::jsonb,
 'Prueba Genius ahora',
 'Primera consulta gratis. Sin registro.',
 true),

-- DOCKET - Gestión de expedientes
('docket', 'docket',
 'Docket - Gestión de Expedientes de PI | IP-NEXUS',
 'Gestiona todos tus expedientes de propiedad intelectual en un solo lugar. Patentes, marcas, diseños. Plazos automáticos.',
 'Todos tus expedientes de PI. Un solo lugar.',
 'Docket centraliza marcas, patentes y diseños. Calcula plazos automáticamente. Nunca más pierdas una fecha crítica.',
 'Empezar Gratis',
 'Solicitar Demo',
 '/demo/docket',
 '[
   {"icon": "folder", "title": "Todo Centralizado", "description": "Marcas, patentes, diseños, dominios. Todas las jurisdicciones en una sola plataforma."},
   {"icon": "calendar", "title": "Plazos Automáticos", "description": "Calcula renovaciones, anualidades y plazos procesales según cada jurisdicción."},
   {"icon": "users", "title": "Portal de Clientes", "description": "Tus clientes acceden a sus expedientes sin necesidad de llamarte."},
   {"icon": "zap", "title": "Automatización", "description": "Workflows automáticos para tareas repetitivas: recordatorios, informes, facturación."}
 ]'::jsonb,
 '[
   {"name": "Starter", "price": 99, "currency": "EUR", "period": "mes", "features": ["50 expedientes", "2 usuarios", "Plazos automáticos", "Soporte email"], "cta_text": "Empezar", "is_popular": false},
   {"name": "Professional", "price": 249, "currency": "EUR", "period": "mes", "features": ["500 expedientes", "10 usuarios", "Portal clientes", "API access", "Integraciones"], "cta_text": "Empezar", "is_popular": true},
   {"name": "Business", "price": 499, "currency": "EUR", "period": "mes", "features": ["2000 expedientes", "25 usuarios", "White label", "Workflows custom", "Soporte prioritario"], "cta_text": "Empezar", "is_popular": false}
 ]'::jsonb,
 '[
   {"name": "Ana Fernández", "role": "Socia", "company": "Fernández IP", "quote": "Migramos desde Excel hace 2 años. No entiendo cómo trabajábamos antes. Docket ha transformado nuestra eficiencia.", "rating": 5},
   {"name": "Miguel Torres", "role": "IP Counsel", "company": "Grupo Industrial Norte", "quote": "El portal de clientes nos ha ahorrado cientos de emails y llamadas. Nuestros clientes están encantados.", "rating": 5}
 ]'::jsonb,
 '[
   {"question": "¿Puedo importar mis expedientes actuales?", "answer": "Sí, ofrecemos migración asistida desde Excel, Patricia, Inprotech y otros sistemas. El proceso típico tarda 1-2 semanas."},
   {"question": "¿Qué jurisdicciones soporta?", "answer": "Docket soporta todas las jurisdicciones principales y calcula plazos según la legislación de cada país."},
   {"question": "¿Puedo personalizar los campos?", "answer": "Sí, puedes crear campos personalizados para adaptarlo a tu forma de trabajo."},
   {"question": "¿Se integra con oficinas de PI?", "answer": "Sí, tenemos conexión directa con OEPM, EUIPO, EPO y WIPO para importar datos automáticamente."},
   {"question": "¿Cómo funciona el portal de clientes?", "answer": "Cada cliente recibe acceso a un portal donde ve sus expedientes, descarga documentos y se comunica contigo de forma segura."}
 ]'::jsonb,
 'Organiza tu despacho hoy',
 'Prueba gratis 30 días. Migración asistida incluida.',
 true),

-- FINANCE - Valoración de portfolios
('finance', 'finance',
 'Finance - Valoración de Portfolios de PI | IP-NEXUS',
 'Valora tu portfolio de propiedad intelectual. Informes para inversores, M&A, contabilidad. Metodologías estándar.',
 'Conoce el valor real de tu PI',
 'Finance analiza y valora tu portfolio de marcas, patentes y diseños usando metodologías reconocidas internacionalmente.',
 'Solicitar Valoración',
 'Ver Ejemplo Informe',
 '/demo/finance',
 '[
   {"icon": "trending-up", "title": "Valoración Profesional", "description": "Metodologías ISO 10668, relief from royalty, cost approach y más."},
   {"icon": "file-check", "title": "Informes Certificados", "description": "Informes válidos para auditorías, M&A, due diligence y financiación."},
   {"icon": "refresh-cw", "title": "Monitorización Continua", "description": "Actualiza el valor de tu portfolio automáticamente según cambios de mercado."},
   {"icon": "bar-chart", "title": "Benchmarking", "description": "Compara el valor de tu PI con empresas similares de tu sector."}
 ]'::jsonb,
 '[
   {"name": "Informe Puntual", "price": 500, "currency": "EUR", "period": "único", "features": ["1 valoración", "Hasta 10 activos", "Informe PDF", "Metodología estándar"], "cta_text": "Solicitar", "is_popular": false},
   {"name": "Portfolio", "price": 199, "currency": "EUR", "period": "mes", "features": ["Hasta 50 activos", "Actualizaciones trimestrales", "Dashboard valor", "Alertas cambios"], "cta_text": "Empezar", "is_popular": true},
   {"name": "Enterprise", "price": null, "currency": "EUR", "period": "mes", "features": ["Activos ilimitados", "Actualización continua", "Múltiples metodologías", "Certificación auditor", "API integración"], "cta_text": "Contactar", "is_popular": false}
 ]'::jsonb,
 '[
   {"name": "Laura Gómez", "role": "CFO", "company": "BioTech Ventures", "quote": "Finance nos ayudó a valorar nuestro portfolio de patentes para la ronda Serie B. Los inversores quedaron impresionados con el rigor.", "rating": 5},
   {"name": "Javier Ruiz", "role": "Director M&A", "company": "Corporate Advisors", "quote": "Usamos Finance para due diligence de PI en adquisiciones. Ahorra semanas de trabajo y es mucho más preciso.", "rating": 5}
 ]'::jsonb,
 '[
   {"question": "¿Qué metodologías de valoración usáis?", "answer": "Aplicamos ISO 10668, relief from royalty, cost approach, market approach e income approach según el tipo de activo y propósito."},
   {"question": "¿Los informes son válidos para auditorías?", "answer": "Sí, nuestros informes cumplen con NIIF/IFRS y pueden ser usados para auditorías y reporting financiero."},
   {"question": "¿Cuánto tarda una valoración?", "answer": "Un informe estándar tarda 5-7 días laborables. Para portfolios grandes, puede ser 2-3 semanas."},
   {"question": "¿Necesito proporcionar información financiera?", "answer": "Para una valoración precisa, necesitamos datos de ventas asociadas a la PI, costes de desarrollo y licencias existentes."},
   {"question": "¿Podéis valorar marcas internacionales?", "answer": "Sí, valoramos activos de cualquier jurisdicción y tenemos experiencia en portfolios globales."}
 ]'::jsonb,
 'Descubre el valor de tu PI',
 'Solicita una valoración preliminar gratuita de tu portfolio.',
 true);
