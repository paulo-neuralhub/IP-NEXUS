import { NavLink, Outlet } from "react-router-dom";
import { Mail, MessageSquare, SlidersHorizontal, LayoutList, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { to: "/app/communications", label: "Inbox", icon: LayoutList, end: true },
  { to: "/app/communications/whatsapp", label: "WhatsApp", icon: MessageSquare },
  { to: "/app/communications/email", label: "Email", icon: Mail },
  { to: "/app/communications/templates", label: "Templates", icon: FileText },
  { to: "/app/communications/settings", label: "Config", icon: SlidersHorizontal },
];

export default function CommunicationsLayout() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Comunicaciones</h1>
        <p className="text-sm text-muted-foreground">
          Inbox unificado por organización (tabla: <span className="font-mono">communications</span>)
        </p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card text-foreground hover:bg-muted"
              )
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </NavLink>
        ))}
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
