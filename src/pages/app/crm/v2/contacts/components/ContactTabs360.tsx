import * as React from "react";
import { cn } from "@/lib/utils";
import { ProfessionalCard } from "@/components/ui/professional-card";
import { ColorTag } from "@/components/ui/color-tag";

type TabId = "info" | "matters" | "portfolio" | "deals" | "documents" | "finance";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  count?: number;
}

const tabs: Tab[] = [
  { id: "info", label: "Información", icon: "📋" },
  { id: "matters", label: "Expedientes", icon: "📁" },
  { id: "portfolio", label: "Portfolio PI", icon: "®️" },
  { id: "deals", label: "Deals", icon: "💼" },
  { id: "documents", label: "Documentos", icon: "📄" },
  { id: "finance", label: "Finanzas", icon: "💰" },
];

export interface ContactTabs360Props {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  counts?: Partial<Record<TabId, number>>;
}

export function ContactTabs360({ activeTab, onTabChange, counts }: ContactTabs360Props) {
  return (
    <ProfessionalCard padding="none" className="overflow-hidden">
      {/* Headers */}
      <div className="flex flex-wrap gap-1 border-b border-border bg-background-card px-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
          >
            <span aria-hidden>{tab.icon}</span>
            <span>{tab.label}</span>
            {(counts?.[tab.id] ?? tab.count) !== undefined ? (
              <ColorTag variant="gray" className="ml-1">
                {counts?.[tab.id] ?? tab.count}
              </ColorTag>
            ) : null}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="rounded-xl border border-border bg-background-card p-5 text-sm text-muted-foreground">
          Contenido “{tabs.find((t) => t.id === activeTab)?.label}” (placeholder). 
        </div>
      </div>
    </ProfessionalCard>
  );
}
