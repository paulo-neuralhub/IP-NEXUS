import { CommunicationsList } from "@/components/features/communications/CommunicationsList";

export default function WhatsAppInboxPage() {
  return <CommunicationsList title="WhatsApp Inbox" channel="whatsapp" basePath="/app/communications/whatsapp" />;
}
