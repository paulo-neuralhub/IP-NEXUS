-- Table for managing legal documents content (editable from backoffice)
CREATE TABLE public.legal_document_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_summary TEXT NOT NULL,
  checkbox_text TEXT NOT NULL,
  full_content TEXT NOT NULL,
  link_text VARCHAR(100) DEFAULT 'Leer condiciones completas',
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_document_contents ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read active legal documents
CREATE POLICY "Anyone can read active legal documents"
ON public.legal_document_contents
FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Service role can manage (for edge functions / backoffice)
CREATE POLICY "Service role full access"
ON public.legal_document_contents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert default AI disclaimer content
INSERT INTO public.legal_document_contents (code, title, short_summary, checkbox_text, full_content, version)
VALUES (
  'ai_disclaimer',
  'Aviso Legal - Asistente IA',
  E'**Puntos clave:**\n• La IA es una herramienta de asistencia, no sustituye al asesoramiento profesional\n• Los resultados deben verificarse siempre con fuentes oficiales\n• No se garantiza exactitud al 100% de la información proporcionada\n• El usuario es responsable de las decisiones finales tomadas',
  'He leído y acepto el Aviso Legal del Asistente con IA. Entiendo que no presta asesoramiento profesional y que debo verificar los resultados con fuentes oficiales antes de actuar.',
  E'# Aviso Legal - Funcionalidades de Inteligencia Artificial\n\n## 1. Naturaleza del Servicio\n\nLas funcionalidades de Inteligencia Artificial (IA) integradas en IP-NEXUS constituyen herramientas de asistencia diseñadas para facilitar y agilizar determinadas tareas relacionadas con la gestión de propiedad intelectual. Estas herramientas NO sustituyen en ningún caso el asesoramiento profesional cualificado.\n\n## 2. Limitaciones de la IA\n\n- **No es asesoramiento legal**: Las respuestas y análisis generados por la IA no constituyen asesoramiento legal, técnico o profesional de ningún tipo.\n- **Posibles inexactitudes**: Los modelos de IA pueden generar información incorrecta, incompleta o desactualizada. No se garantiza la exactitud al 100%.\n- **Verificación obligatoria**: Toda información proporcionada por la IA debe ser verificada con fuentes oficiales (OEPM, EUIPO, WIPO, etc.) antes de tomar cualquier decisión o acción.\n\n## 3. Responsabilidad del Usuario\n\nEl usuario reconoce y acepta que:\n- Es el único responsable de las decisiones tomadas basándose en la información proporcionada por la IA.\n- Debe verificar toda la información con profesionales cualificados cuando sea necesario.\n- No debe utilizar la IA como única fuente para decisiones críticas relacionadas con derechos de propiedad intelectual.\n\n## 4. Tratamiento de Datos\n\nLos datos introducidos en las funcionalidades de IA son procesados de acuerdo con nuestra Política de Privacidad. Los datos pueden ser:\n- Procesados por proveedores de servicios de IA de terceros.\n- Utilizados para mejorar la calidad del servicio.\n- Almacenados de forma segura siguiendo las normativas aplicables (RGPD).\n\n## 5. Exención de Responsabilidad\n\nIP-NEXUS, sus desarrolladores y proveedores de servicios de IA NO serán responsables de:\n- Daños directos o indirectos derivados del uso de las funcionalidades de IA.\n- Decisiones tomadas basándose en la información proporcionada por la IA.\n- Pérdidas económicas, de derechos o de cualquier otra índole.\n\n## 6. Aceptación\n\nAl utilizar las funcionalidades de IA, el usuario declara haber leído, comprendido y aceptado íntegramente el presente Aviso Legal.\n\n---\n*Última actualización: Enero 2026*',
  '1.0'
);

-- Trigger to update updated_at
CREATE TRIGGER update_legal_document_contents_updated_at
BEFORE UPDATE ON public.legal_document_contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();