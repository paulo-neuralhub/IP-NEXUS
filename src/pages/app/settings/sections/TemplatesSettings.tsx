/**
 * Templates Settings Section — Simple summary with link to /app/templates
 */

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import { useDocumentTypes } from '@/hooks/documents/useDocumentTypes';
import { useActiveDocumentTypes } from '@/hooks/documents/useTemplatePreferences';

export default function TemplatesSettings() {
  const { data: types } = useDocumentTypes();
  const { isTypeEnabled } = useActiveDocumentTypes();
  const activeCount = types?.filter(t => isTypeEnabled(t.id)).length || 0;
  const totalCount = types?.length || 0;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Plantillas de Documentos</h3>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-emerald-600">{activeCount}</span> activas de {totalCount} plantillas
          </p>
        </div>
      </div>
      <Button asChild variant="outline" className="gap-2">
        <Link to="/app/templates">
          Ir a Plantillas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
