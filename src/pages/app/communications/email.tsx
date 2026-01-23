import { CommunicationsList } from "@/components/features/communications/CommunicationsList";

export default function EmailInboxPage() {
  return <CommunicationsList title="Email Inbox" channel="email" basePath="/app/communications/email" />;
}
