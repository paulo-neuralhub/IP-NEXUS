/**
 * CRM Account Detail - Redirect to enhanced Client360Page
 * This wrapper ensures the enhanced client detail view is used
 */

import { useParams } from "react-router-dom";
import { Client360Page } from "@/components/legal-ops/Client360Page";

export default function CRMV2AccountDetail() {
  const { id } = useParams<{ id: string }>();

  // DEBUG TEMP: verificar ID en URL
  console.log('Client ID from URL:', id);
  
  if (!id) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        ID de cliente no proporcionado
      </div>
    );
  }

  return <Client360Page clientId={id} />;
}
