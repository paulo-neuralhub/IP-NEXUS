// ============================================
// Step 2: AI Disclosure (MANDATORY - EU AI Act Art. 50)
// ============================================

import { useState, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Bot, Shield, Eye, FileText, Info } from 'lucide-react';
import type { OnboardingFormData } from '@/hooks/legal-ops/useClientOnboarding';

interface Step2Props {
  formData: OnboardingFormData;
  onChange: (data: Partial<OnboardingFormData>) => void;
}

export function Step2AIDisclosure({ formData, onChange }: Step2Props) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect scroll to bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning header */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              Lectura obligatoria
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              De acuerdo con el Artículo 50 del Reglamento de Inteligencia Artificial de la UE 
              (EU AI Act), debe leer y comprender esta información antes de continuar.
            </p>
          </div>
        </div>
      </div>

      {/* Disclosure content - MANDATORY SCROLL */}
      <div className="border rounded-lg">
        <div className="p-4 bg-muted border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Información sobre uso de Inteligencia Artificial
          </h2>
        </div>
        
        <div 
          className="h-[350px] p-4 overflow-y-auto" 
          onScroll={handleScroll}
          ref={scrollRef}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            {/* Section 1 */}
            <section>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Info className="w-4 h-4 text-blue-500" />
                1. Funcionalidades de IA en la plataforma
              </h3>
              <p>
                Esta plataforma utiliza tecnologías de Inteligencia Artificial 
                para asistir en la gestión de expedientes. Las funcionalidades son:
              </p>
              
              <div className="space-y-3 ml-4">
                <div className="p-3 bg-muted rounded">
                  <strong>📧 Clasificación automática de comunicaciones</strong>
                  <p className="text-sm mt-1">
                    Los emails y mensajes pueden ser clasificados automáticamente por 
                    categoría mediante procesamiento de lenguaje natural.
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <strong>📄 Extracción de entidades de documentos</strong>
                  <p className="text-sm mt-1">
                    Los documentos pueden ser analizados para extraer fechas, 
                    nombres y referencias de forma automática.
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <strong>🎙️ Transcripción de audio</strong>
                  <p className="text-sm mt-1">
                    Las grabaciones de voz pueden ser transcritas automáticamente 
                    a texto para facilitar su búsqueda.
                  </p>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <strong>🤖 Asistente con IA</strong>
                  <p className="text-sm mt-1">
                    Un asistente basado en IA puede responder preguntas sobre el contenido 
                    de los expedientes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                2. Limitaciones importantes
              </h3>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Es fundamental que comprenda las siguientes limitaciones:
                </p>
                <ul className="mt-2 space-y-2 text-sm text-amber-800 dark:text-amber-200">
                  <li>
                    <strong>❌ Los sistemas de IA pueden cometer errores</strong> — 
                    Pueden producir información incorrecta o "alucinaciones".
                  </li>
                  <li>
                    <strong>❌ La IA no sustituye al profesional</strong> — 
                    Todas las respuestas deben ser verificadas por un profesional.
                  </li>
                  <li>
                    <strong>❌ No proporciona asesoramiento legal</strong> — 
                    El asistente NO ofrece asesoramiento legal bajo ninguna circunstancia.
                  </li>
                  <li>
                    <strong>❌ La precisión varía según el contexto</strong> — 
                    La extracción y clasificación pueden tener diferente precisión.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Shield className="w-4 h-4 text-green-500" />
                3. Protección de datos
              </h3>
              <ul className="space-y-2">
                <li>✅ Todos los datos se procesan en servidores dentro de la Unión Europea</li>
                <li>✅ Los datos están encriptados en tránsito y en reposo</li>
                <li>✅ Existe aislamiento completo entre distintos clientes</li>
                <li>✅ Se mantiene un registro de auditoría de todas las operaciones</li>
                <li>✅ Puede revocar los consentimientos en cualquier momento</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Eye className="w-4 h-4 text-purple-500" />
                4. Sus derechos
              </h3>
              <p>De acuerdo con la normativa aplicable, usted tiene derecho a:</p>
              <ul className="space-y-2 mt-2">
                <li>✅ <strong>Saber cuándo interactúa con IA</strong> — Siempre se indicará claramente</li>
                <li>✅ <strong>Desactivar funcionalidades de IA</strong> — Puede usar el sistema sin IA</li>
                <li>✅ <strong>Solicitar revisión humana</strong> — En decisiones asistidas por IA</li>
                <li>✅ <strong>Obtener explicación</strong> — De cómo funcionan los sistemas de IA</li>
                <li>✅ <strong>Revocar consentimientos</strong> — En cualquier momento</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <FileText className="w-4 h-4 text-blue-500" />
                5. Base legal y cumplimiento
              </h3>
              <p>Este sistema cumple con:</p>
              <ul className="space-y-1 mt-2 text-sm">
                <li>• <strong>EU AI Act</strong> — Reglamento (UE) 2024/1689, Artículo 50</li>
                <li>• <strong>GDPR</strong> — Reglamento (UE) 2016/679, especialmente Art. 22</li>
                <li>• <strong>LSSI-CE</strong> — Ley 34/2002 de Servicios de la Sociedad de la Información</li>
              </ul>
            </section>

            {/* Scroll indicator */}
            <div className="pt-6 text-center text-sm text-muted-foreground">
              {hasScrolledToBottom 
                ? '✅ Ha llegado al final del documento'
                : '↓ Por favor, lea el documento completo desplazándose hasta el final'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Checkboxes - Only enabled after scroll */}
      <div className="space-y-4 pt-4">
        <div className={`
          flex items-start gap-3 p-3 rounded-lg border
          ${hasScrolledToBottom ? 'bg-background' : 'bg-muted opacity-60'}
        `}>
          <Checkbox
            id="ai_disclosure_read"
            checked={formData.ai_disclosure_read}
            disabled={!hasScrolledToBottom}
            onCheckedChange={(checked) => 
              onChange({ ai_disclosure_read: checked === true })
            }
          />
          <Label 
            htmlFor="ai_disclosure_read" 
            className={`text-sm ${!hasScrolledToBottom ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            He leído completamente la información sobre el uso de Inteligencia Artificial 
            en esta plataforma.
          </Label>
        </div>

        <div className={`
          flex items-start gap-3 p-3 rounded-lg border
          ${formData.ai_disclosure_read ? 'bg-background' : 'bg-muted opacity-60'}
        `}>
          <Checkbox
            id="ai_disclosure_understood"
            checked={formData.ai_disclosure_understood}
            disabled={!formData.ai_disclosure_read}
            onCheckedChange={(checked) => 
              onChange({ ai_disclosure_understood: checked === true })
            }
          />
          <Label 
            htmlFor="ai_disclosure_understood"
            className={`text-sm ${!formData.ai_disclosure_read ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Comprendo las limitaciones de los sistemas de IA, incluyendo la posibilidad 
            de errores, y entiendo que todas las respuestas deben ser verificadas por 
            un profesional.
          </Label>
        </div>
      </div>

      {!hasScrolledToBottom && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          ⚠️ Debe leer el documento completo antes de poder continuar
        </p>
      )}
    </div>
  );
}
