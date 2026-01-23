import { useParams } from "react-router-dom";

import { CommunicationDetail } from "@/components/legal-ops/CommunicationDetail";

export default function CommunicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <CommunicationDetail communicationId={id} />;
}

