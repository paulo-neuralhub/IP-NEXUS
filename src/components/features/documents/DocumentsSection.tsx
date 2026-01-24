import { useState } from 'react';
import { FileText, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DocumentUploader } from './DocumentUploader';
import { DocumentList } from './DocumentList';
import { useDocuments } from '@/hooks/use-documents';
import type { EntityType } from '@/types/documents';

interface DocumentsSectionProps {
  entityType: EntityType;
  entityId: string;
  title?: string;
}

export function DocumentsSection({
  entityType,
  entityId,
  title = 'Documentos',
}: DocumentsSectionProps) {
  const [showUploader, setShowUploader] = useState(false);
  const { data: documents } = useDocuments(entityType, entityId);
  const documentCount = documents?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            {title}
            {documentCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({documentCount})
              </span>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploader(!showUploader)}
          >
            {showUploader ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Cerrar
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Subir
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Uploader (collapsible) */}
        <Collapsible open={showUploader} onOpenChange={setShowUploader}>
          <CollapsibleContent className="pb-4">
            <DocumentUploader
              entityType={entityType}
              entityId={entityId}
              onUploadComplete={() => setShowUploader(false)}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Documents list */}
        <DocumentList entityType={entityType} entityId={entityId} />
      </CardContent>
    </Card>
  );
}
