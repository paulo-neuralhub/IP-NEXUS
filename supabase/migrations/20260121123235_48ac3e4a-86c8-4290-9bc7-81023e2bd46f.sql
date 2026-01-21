-- =============================================
-- P58: DOCUMENT GENERATION WITH AI
-- =============================================

-- 1. Document Templates table
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('trademark', 'patent', 'contract', 'correspondence', 'report', 'other')),
  
  -- Template type
  template_type TEXT DEFAULT 'ai_assisted' CHECK (template_type IN ('ai_assisted', 'fill_blanks', 'hybrid')),
  
  -- Template content (Markdown with variables)
  template_content TEXT NOT NULL,
  
  -- Available variables for this template
  variables JSONB DEFAULT '[]',
  
  -- AI instructions
  ai_system_prompt TEXT,
  ai_user_prompt_template TEXT,
  ai_model TEXT DEFAULT 'claude-sonnet-4-5-20250929',
  ai_temperature DECIMAL(2,1) DEFAULT 0.3,
  ai_max_tokens INTEGER DEFAULT 4096,
  
  -- Output
  output_format TEXT DEFAULT 'markdown' CHECK (output_format IN ('markdown', 'html', 'docx')),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(2,1),
  
  -- Tags for search
  tags TEXT[] DEFAULT '{}',
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doc_templates_org ON public.document_templates(organization_id);
CREATE INDEX idx_doc_templates_category ON public.document_templates(category);
CREATE INDEX idx_doc_templates_active ON public.document_templates(organization_id) WHERE is_active = true;
CREATE INDEX idx_doc_templates_public ON public.document_templates(is_public) WHERE is_public = true;

-- 2. Generated Documents table
CREATE TABLE public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Origin
  template_id UUID REFERENCES public.document_templates(id),
  matter_id UUID REFERENCES public.matters(id),
  
  -- Document
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Variables used
  variables_input JSONB,
  variables_resolved JSONB,
  
  -- AI generation info
  ai_prompt_used TEXT,
  ai_model_used TEXT,
  ai_tokens_used INTEGER,
  generation_time_ms INTEGER,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.generated_documents(id),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'approved', 'exported', 'archived')),
  
  -- Export
  exported_document_id UUID REFERENCES public.matter_documents(id),
  exported_at TIMESTAMPTZ,
  export_format TEXT,
  
  -- Feedback
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gen_docs_org ON public.generated_documents(organization_id);
CREATE INDEX idx_gen_docs_matter ON public.generated_documents(matter_id);
CREATE INDEX idx_gen_docs_template ON public.generated_documents(template_id);
CREATE INDEX idx_gen_docs_status ON public.generated_documents(organization_id, status);

-- 3. Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for document_templates
CREATE POLICY "Users can view org templates and public templates" 
  ON public.document_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
    OR is_public = true
  );

CREATE POLICY "Users can create org templates" 
  ON public.document_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own org templates" 
  ON public.document_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own org templates" 
  ON public.document_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- 5. RLS Policies for generated_documents
CREATE POLICY "Users can view org generated documents" 
  ON public.generated_documents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create org generated documents" 
  ON public.generated_documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update org generated documents" 
  ON public.generated_documents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete org generated documents" 
  ON public.generated_documents FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- 6. Trigger for updated_at
CREATE TRIGGER update_document_templates_timestamp
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_settings_timestamp();

CREATE TRIGGER update_generated_documents_timestamp
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_settings_timestamp();

-- 7. Insert predefined templates (public/global)
INSERT INTO public.document_templates (
  organization_id, name, description, category, template_type,
  template_content, variables, ai_system_prompt, ai_user_prompt_template,
  is_public, tags
) VALUES 
-- Opposition Letter
(
  NULL,
  'Carta de Oposición a Marca',
  'Genera una carta formal de oposición contra una solicitud de marca',
  'trademark',
  'ai_assisted',
  '# OPOSICIÓN A SOLICITUD DE MARCA

**Fecha:** {{date}}
**Referencia:** {{reference}}

**OFICINA DE PROPIEDAD INTELECTUAL**
{{ip_office_address}}

## DATOS DEL OPONENTE
- **Nombre:** {{opponent_name}}
- **Dirección:** {{opponent_address}}
- **Representante:** {{representative_name}}

## MARCA OPUESTA
- **Solicitud Nº:** {{opposed_application_number}}
- **Denominación:** {{opposed_mark_name}}
- **Clase(s):** {{opposed_classes}}
- **Solicitante:** {{opposed_applicant}}

## MARCA ANTERIOR (BASE DE LA OPOSICIÓN)
- **Registro Nº:** {{prior_mark_number}}
- **Denominación:** {{prior_mark_name}}
- **Clase(s):** {{prior_classes}}
- **Fecha de registro:** {{prior_registration_date}}

## FUNDAMENTOS DE LA OPOSICIÓN

{{opposition_grounds}}

## PETICIÓN

Por todo lo expuesto, SOLICITAMOS:

1. Se admita a trámite la presente oposición.
2. Se deniegue la solicitud de marca Nº {{opposed_application_number}}.
3. Se impongan las costas al solicitante.

**Firma:**
{{representative_name}}
Agente de Propiedad Industrial',
  '[
    {"key": "date", "label": "Fecha", "type": "date", "source": "auto", "source_path": "TODAY"},
    {"key": "reference", "label": "Referencia interna", "type": "text", "source": "auto", "source_path": "matter.reference"},
    {"key": "ip_office_address", "label": "Dirección de la Oficina", "type": "textarea", "source": "manual", "required": true},
    {"key": "opponent_name", "label": "Nombre del oponente", "type": "text", "source": "auto", "source_path": "contact.name"},
    {"key": "opponent_address", "label": "Dirección del oponente", "type": "textarea", "source": "manual", "required": false},
    {"key": "representative_name", "label": "Nombre del representante", "type": "text", "source": "auto", "source_path": "organization.name"},
    {"key": "opposed_application_number", "label": "Nº solicitud opuesta", "type": "text", "source": "manual", "required": true},
    {"key": "opposed_mark_name", "label": "Nombre marca opuesta", "type": "text", "source": "manual", "required": true},
    {"key": "opposed_classes", "label": "Clases marca opuesta", "type": "text", "source": "manual", "required": true},
    {"key": "opposed_applicant", "label": "Solicitante marca opuesta", "type": "text", "source": "manual", "required": true},
    {"key": "prior_mark_number", "label": "Nº registro marca anterior", "type": "text", "source": "auto", "source_path": "matter.registration_number"},
    {"key": "prior_mark_name", "label": "Nombre marca anterior", "type": "text", "source": "auto", "source_path": "matter.mark_name"},
    {"key": "prior_classes", "label": "Clases marca anterior", "type": "text", "source": "manual", "required": true},
    {"key": "prior_registration_date", "label": "Fecha registro marca anterior", "type": "date", "source": "auto", "source_path": "matter.registration_date"},
    {"key": "opposition_grounds", "label": "Fundamentos (la IA expandirá)", "type": "textarea", "source": "ai", "required": true}
  ]'::jsonb,
  'Eres un abogado especialista en propiedad industrial con amplia experiencia en oposiciones de marcas. 
Tu tarea es generar los fundamentos legales de una oposición de marca.
Debes ser formal, preciso y citar la normativa aplicable (Ley de Marcas española, Reglamento de la UE sobre marca, etc.).
El documento debe ser profesional y convincente.',
  'Genera los fundamentos legales para una oposición de marca basándote en:
- Marca anterior: {{prior_mark_name}} (Clase {{prior_classes}})
- Marca opuesta: {{opposed_mark_name}} (Clase {{opposed_classes}})

Argumenta:
1. Riesgo de confusión entre ambas marcas
2. Similitud fonética, visual y conceptual
3. Identidad o similitud de productos/servicios
4. Notoriedad de la marca anterior (si aplica)

Incluye referencias a legislación aplicable (Ley 17/2001 de Marcas, Reglamento UE 2017/1001).',
  true,
  ARRAY['trademark', 'opposition', 'marca', 'oposición']
),

-- License Agreement
(
  NULL,
  'Contrato de Licencia de Marca',
  'Genera un contrato de licencia de uso de marca completo',
  'contract',
  'ai_assisted',
  '# CONTRATO DE LICENCIA DE MARCA

En {{city}}, a {{date}}

## REUNIDOS

**DE UNA PARTE**, {{licensor_name}}, con domicilio en {{licensor_address}} y NIF {{licensor_nif}}, en adelante el **LICENCIANTE**.

**DE OTRA PARTE**, {{licensee_name}}, con domicilio en {{licensee_address}} y NIF {{licensee_nif}}, en adelante el **LICENCIATARIO**.

Ambas partes se reconocen capacidad legal suficiente para el otorgamiento del presente contrato.

## EXPONEN

{{background}}

## CLÁUSULAS

{{contract_clauses}}

## FIRMA

Y en prueba de conformidad, firman el presente contrato por duplicado en el lugar y fecha indicados.

---

**EL LICENCIANTE**                    **EL LICENCIATARIO**

{{licensor_name}}                     {{licensee_name}}',
  '[
    {"key": "city", "label": "Ciudad", "type": "text", "source": "manual", "required": true},
    {"key": "date", "label": "Fecha", "type": "date", "source": "auto", "source_path": "TODAY"},
    {"key": "licensor_name", "label": "Nombre del licenciante", "type": "text", "source": "auto", "source_path": "contact.name"},
    {"key": "licensor_address", "label": "Dirección licenciante", "type": "textarea", "source": "manual", "required": true},
    {"key": "licensor_nif", "label": "NIF licenciante", "type": "text", "source": "manual", "required": true},
    {"key": "licensee_name", "label": "Nombre del licenciatario", "type": "text", "source": "manual", "required": true},
    {"key": "licensee_address", "label": "Dirección licenciatario", "type": "textarea", "source": "manual", "required": true},
    {"key": "licensee_nif", "label": "NIF licenciatario", "type": "text", "source": "manual", "required": true},
    {"key": "mark_name", "label": "Nombre de la marca", "type": "text", "source": "auto", "source_path": "matter.mark_name"},
    {"key": "mark_registration", "label": "Nº registro marca", "type": "text", "source": "auto", "source_path": "matter.registration_number"},
    {"key": "territory", "label": "Territorio", "type": "text", "source": "manual", "required": true},
    {"key": "duration_years", "label": "Duración (años)", "type": "number", "source": "manual", "required": true},
    {"key": "license_type", "label": "Tipo de licencia", "type": "select", "source": "manual", "options": ["Exclusiva", "No exclusiva", "Única"], "required": true},
    {"key": "royalty_percentage", "label": "Royalty (%)", "type": "number", "source": "manual"},
    {"key": "minimum_royalty", "label": "Royalty mínimo anual (€)", "type": "number", "source": "manual"},
    {"key": "background", "label": "Antecedentes", "type": "textarea", "source": "ai"},
    {"key": "contract_clauses", "label": "Cláusulas del contrato", "type": "textarea", "source": "ai"}
  ]'::jsonb,
  'Eres un abogado especialista en propiedad intelectual y contratos mercantiles.
Tu tarea es redactar cláusulas profesionales para un contrato de licencia de marca.
El contrato debe ser equilibrado, claro y cumplir con la normativa española y europea.
Incluye cláusulas estándar de este tipo de contratos.',
  'Redacta los EXPONEN (antecedentes) y las CLÁUSULAS para un contrato de licencia de marca con estos parámetros:
- Marca: {{mark_name}} (Registro: {{mark_registration}})
- Tipo de licencia: {{license_type}}
- Territorio: {{territory}}
- Duración: {{duration_years}} años
- Royalty: {{royalty_percentage}}% con mínimo de {{minimum_royalty}}€/año

Incluye cláusulas sobre:
1. Objeto del contrato
2. Alcance de la licencia
3. Territorio y exclusividad
4. Duración y renovación
5. Contraprestación económica
6. Obligaciones del licenciante
7. Obligaciones del licenciatario
8. Control de calidad
9. Sublicencia
10. Confidencialidad
11. Causas de resolución
12. Legislación aplicable y jurisdicción',
  true,
  ARRAY['contract', 'license', 'trademark', 'licencia', 'marca', 'contrato']
),

-- Surveillance Report
(
  NULL,
  'Informe de Vigilancia de Marcas',
  'Genera un informe periódico de vigilancia de marcas para el cliente',
  'report',
  'ai_assisted',
  '# INFORME DE VIGILANCIA DE MARCAS

**Cliente:** {{client_name}}
**Período:** {{period_start}} - {{period_end}}
**Fecha del informe:** {{report_date}}

---

## RESUMEN EJECUTIVO

{{executive_summary}}

## MARCAS MONITORIZADAS

{{monitored_marks}}

## RESULTADOS DE LA VIGILANCIA

### Nuevas solicitudes detectadas

{{detected_applications}}

### Análisis de riesgo

{{risk_analysis}}

## RECOMENDACIONES

{{recommendations}}

## PRÓXIMOS PASOS

{{next_steps}}

---

*Este informe ha sido preparado por {{organization_name}}*',
  '[
    {"key": "client_name", "label": "Nombre del cliente", "type": "text", "source": "auto", "source_path": "contact.name"},
    {"key": "period_start", "label": "Inicio del período", "type": "date", "source": "manual", "required": true},
    {"key": "period_end", "label": "Fin del período", "type": "date", "source": "manual", "required": true},
    {"key": "report_date", "label": "Fecha del informe", "type": "date", "source": "auto", "source_path": "TODAY"},
    {"key": "organization_name", "label": "Nombre del despacho", "type": "text", "source": "auto", "source_path": "organization.name"},
    {"key": "monitored_marks_list", "label": "Lista de marcas monitorizadas", "type": "textarea", "source": "manual", "required": true},
    {"key": "detected_applications_data", "label": "Solicitudes detectadas (datos)", "type": "textarea", "source": "manual"},
    {"key": "executive_summary", "label": "Resumen ejecutivo", "type": "textarea", "source": "ai"},
    {"key": "monitored_marks", "label": "Marcas monitorizadas", "type": "textarea", "source": "ai"},
    {"key": "detected_applications", "label": "Solicitudes detectadas", "type": "textarea", "source": "ai"},
    {"key": "risk_analysis", "label": "Análisis de riesgo", "type": "textarea", "source": "ai"},
    {"key": "recommendations", "label": "Recomendaciones", "type": "textarea", "source": "ai"},
    {"key": "next_steps", "label": "Próximos pasos", "type": "textarea", "source": "ai"}
  ]'::jsonb,
  'Eres un consultor senior de propiedad intelectual.
Tu tarea es redactar un informe de vigilancia de marcas profesional y ejecutivo.
El informe debe ser claro, conciso y orientado a la acción.
Usa un tono profesional pero accesible para clientes no especializados.',
  'Genera un informe de vigilancia de marcas basándote en:

MARCAS MONITORIZADAS:
{{monitored_marks_list}}

SOLICITUDES DETECTADAS:
{{detected_applications_data}}

El informe debe:
1. Resumir los hallazgos clave
2. Analizar el riesgo de cada solicitud detectada (alto/medio/bajo)
3. Recomendar acciones concretas (oponerse, monitorizar, ignorar)
4. Indicar plazos relevantes para tomar acción',
  true,
  ARRAY['report', 'surveillance', 'trademark', 'vigilancia', 'informe']
),

-- Cease and Desist Letter
(
  NULL,
  'Carta de Cese y Desista',
  'Genera una carta formal de cese de infracción de marca',
  'correspondence',
  'ai_assisted',
  '# CARTA DE REQUERIMIENTO DE CESE

**Fecha:** {{date}}
**Ref.:** {{reference}}

**ENVIADO POR BUROFAX CON ACUSE DE RECIBO**

{{infringer_name}}
{{infringer_address}}

Muy Sres. nuestros:

{{letter_body}}

Quedamos a la espera de su respuesta en el plazo indicado.

Atentamente,

{{representative_name}}
{{organization_name}}
Agente de Propiedad Industrial',
  '[
    {"key": "date", "label": "Fecha", "type": "date", "source": "auto", "source_path": "TODAY"},
    {"key": "reference", "label": "Referencia", "type": "text", "source": "auto", "source_path": "matter.reference"},
    {"key": "infringer_name", "label": "Nombre del infractor", "type": "text", "source": "manual", "required": true},
    {"key": "infringer_address", "label": "Dirección del infractor", "type": "textarea", "source": "manual", "required": true},
    {"key": "mark_name", "label": "Marca infringida", "type": "text", "source": "auto", "source_path": "matter.mark_name"},
    {"key": "mark_registration", "label": "Nº registro", "type": "text", "source": "auto", "source_path": "matter.registration_number"},
    {"key": "infringement_description", "label": "Descripción de la infracción", "type": "textarea", "source": "manual", "required": true},
    {"key": "deadline_days", "label": "Plazo de respuesta (días)", "type": "number", "source": "manual", "required": true},
    {"key": "representative_name", "label": "Nombre representante", "type": "text", "source": "manual", "required": true},
    {"key": "organization_name", "label": "Nombre despacho", "type": "text", "source": "auto", "source_path": "organization.name"},
    {"key": "letter_body", "label": "Cuerpo de la carta", "type": "textarea", "source": "ai"}
  ]'::jsonb,
  'Eres un abogado especialista en propiedad industrial con experiencia en litigios de marcas.
Tu tarea es redactar una carta de cese y desista (cease and desist) formal y contundente pero profesional.
La carta debe explicar claramente la infracción, fundamentar los derechos del titular y establecer las consecuencias del incumplimiento.',
  'Redacta el cuerpo de una carta de cese y desista para:

MARCA INFRINGIDA: {{mark_name}} (Registro: {{mark_registration}})
INFRACTOR: {{infringer_name}}
DESCRIPCIÓN DE LA INFRACCIÓN: {{infringement_description}}
PLAZO PARA CESAR: {{deadline_days}} días

La carta debe:
1. Identificar al cliente como titular legítimo de la marca
2. Describir la infracción detectada
3. Fundamentar jurídicamente los derechos del titular (Ley de Marcas, Código Penal si procede)
4. Requerir el cese inmediato de la actividad infractora
5. Solicitar indemnización de daños y perjuicios
6. Advertir de las acciones judiciales en caso de incumplimiento
7. Establecer el plazo de respuesta',
  true,
  ARRAY['correspondence', 'cease', 'desist', 'infringement', 'infracción', 'carta']
);