// ============================================================
// IP-NEXUS HELP - HELP BOX
// Prompt P78: Contextual Help System
// ============================================================

import { useMemo, useState } from "react";
import { AlertCircle, ExternalLink, HelpCircle, Lightbulb, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type HelpBoxVariant = "info" | "tip" | "warning";

interface HelpBoxProps {
  title?: string;
  children: React.ReactNode;
  variant?: HelpBoxVariant;
  learnMoreUrl?: string;
  dismissible?: boolean;
  dismissKey?: string; // Para recordar si el usuario lo cerró
  className?: string;
}

export function HelpBox({
  title,
  children,
  variant = "info",
  learnMoreUrl,
  dismissible = false,
  dismissKey,
  className,
}: HelpBoxProps) {
  const storageKey = dismissKey ? `help_dismissed_${dismissKey}` : undefined;

  const [isDismissed, setIsDismissed] = useState(() => {
    if (!storageKey) return false;
    return localStorage.getItem(storageKey) === "true";
  });

  const config = useMemo(() => {
    const base = {
      wrapper: "rounded-xl border p-4",
      iconClass: "h-5 w-5 flex-shrink-0",
    };

    switch (variant) {
      case "tip":
        return {
          ...base,
          Icon: Lightbulb,
          wrapper: cn(base.wrapper, "bg-warning/10 border-warning/20"),
          iconColor: "text-warning",
        };
      case "warning":
        return {
          ...base,
          Icon: AlertCircle,
          wrapper: cn(base.wrapper, "bg-destructive/10 border-destructive/20"),
          iconColor: "text-destructive",
        };
      case "info":
      default:
        return {
          ...base,
          Icon: HelpCircle,
          wrapper: cn(base.wrapper, "bg-primary/5 border-primary/20"),
          iconColor: "text-primary",
        };
    }
  }, [variant]);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (storageKey) localStorage.setItem(storageKey, "true");
  };

  const isInternal = learnMoreUrl?.startsWith("/");

  return (
    <div className={cn(config.wrapper, className)}>
      <div className="flex items-start gap-3">
        <config.Icon className={cn(config.iconClass, config.iconColor)} />

        <div className="min-w-0 flex-1 space-y-2">
          {title ? <p className="font-medium leading-tight">{title}</p> : null}
          <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>

          {learnMoreUrl ? (
            <div>
              {isInternal ? (
                <Link
                  to={learnMoreUrl}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Más información <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <a
                  href={learnMoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Más información <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ) : null}
        </div>

        {dismissible ? (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md",
              "text-muted-foreground hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
            aria-label="Cerrar ayuda"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
