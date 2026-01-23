import * as React from "react";
import { Mail, MoreHorizontal, Phone, MessageSquare } from "lucide-react";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { ActionButton } from "@/components/ui/action-button";
import { VipBadge } from "@/components/ui/vip-badge";
import { ColorTag } from "@/components/ui/color-tag";
import { ProfessionalCard } from "@/components/ui/professional-card";
import { Button } from "@/components/ui/button";

type ContactLike = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  account?: { id: string; name?: string | null } | null;
  tags?: string[] | null;
};

export interface ContactHeader360Props {
  contact: ContactLike;
  stats: {
    matters: number;
    trademarks: number;
    patents: number;
    pipelineValue: number;
  };
}

export function ContactHeader360({ contact, stats }: ContactHeader360Props) {
  const name = contact.full_name || contact.id;
  const initials = getInitials(name);
  const isVip = (contact.tags ?? []).some((t) => t.toLowerCase() === "vip");

  return (
    <ProfessionalCard padding="lg" className="bg-background-card">
      {/* Top Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {/* Avatar */}
          <div
            className={cn(
              "ip-avatar-gradient",
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              "text-base font-semibold text-primary-foreground",
              "shadow-sm",
            )}
          >
            {initials}
          </div>

          {/* Identity */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
                {name}
              </h1>
              {isVip ? <VipBadge size="md" /> : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {contact.account?.name ? (
                <ColorTag variant="gray">🏢 {contact.account.name}</ColorTag>
              ) : (
                <ColorTag variant="gray">Sin cuenta</ColorTag>
              )}
              {contact.email ? <ColorTag variant="indigo">✉️ {contact.email}</ColorTag> : null}
              {contact.phone ? <ColorTag variant="teal">📞 {contact.phone}</ColorTag> : null}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <ActionButton
            variant="call"
            icon={<Phone className="h-4 w-4" />}
            onClick={() => {
              if (contact.phone) window.location.href = `tel:${contact.phone}`;
            }}
            disabled={!contact.phone}
          >
            Llamar
          </ActionButton>
          <ActionButton
            variant="email"
            icon={<Mail className="h-4 w-4" />}
            onClick={() => {
              if (contact.email) window.location.href = `mailto:${contact.email}`;
            }}
            disabled={!contact.email}
          >
            Email
          </ActionButton>
          <ActionButton
            variant="whatsapp"
            icon={<MessageSquare className="h-4 w-4" />}
            onClick={() => {
              // Placeholder: hook into WhatsApp composer when available
            }}
          >
            WhatsApp
          </ActionButton>
          <Button variant="outline" size="icon" aria-label="Más acciones">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expedientes" value={stats.matters} variant="blue" change="" />
        <StatCard label="Marcas" value={stats.trademarks} variant="emerald" change="" />
        <StatCard label="Patentes" value={stats.patents} variant="purple" change="" />
        <StatCard
          label="Pipeline"
          value={formatCurrency(stats.pipelineValue)}
          variant="orange"
          change=""
        />
      </div>
    </ProfessionalCard>
  );
}
