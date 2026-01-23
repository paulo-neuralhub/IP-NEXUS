import * as React from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export type TimelineType =
  | "email"
  | "call"
  | "whatsapp"
  | "note"
  | "meeting"
  | "task"
  | "system";

interface TimelineItemProps {
  type: TimelineType;
  title: string;
  description?: string;
  time: Date | string;
  user?: {
    name: string;
    avatar?: string;
  };
  onClick?: () => void;
  expanded?: boolean;
}

const typeConfig: Record<
  TimelineType,
  { icon: string; containerClass: string; iconBgClass: string }
> = {
  email: {
    icon: "✉️",
    containerClass: "ip-timeline-email border",
    iconBgClass: "bg-[hsl(var(--ip-action-email-text))]",
  },
  call: {
    icon: "📞",
    containerClass: "ip-timeline-call border",
    iconBgClass: "bg-[hsl(var(--ip-action-call-text))]",
  },
  whatsapp: {
    icon: "💬",
    containerClass: "ip-timeline-whatsapp border",
    iconBgClass: "bg-[hsl(var(--ip-action-whatsapp-text))]",
  },
  note: {
    icon: "📝",
    containerClass: "ip-timeline-note border",
    iconBgClass: "bg-[hsl(var(--ip-text-secondary))]",
  },
  meeting: {
    icon: "📅",
    containerClass: "ip-timeline-meeting border",
    iconBgClass: "bg-[hsl(var(--ip-stat-purple-from))]",
  },
  task: {
    icon: "✅",
    containerClass: "ip-timeline-task border",
    iconBgClass: "bg-[hsl(var(--ip-pending-text))]",
  },
  system: {
    icon: "🔄",
    containerClass: "border bg-background-card",
    iconBgClass: "bg-[hsl(var(--ip-text-muted))]",
  },
};

export function TimelineItem({
  type,
  title,
  description,
  time,
  user,
  onClick,
  expanded = false,
}: TimelineItemProps) {
  const config = typeConfig[type];
  const timeString =
    typeof time === "string"
      ? time
      : formatDistanceToNow(time, { addSuffix: true, locale: es });

  const Wrapper: React.ElementType = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "w-full rounded-xl p-4 text-left",
        config.containerClass,
        onClick && "transition-colors hover:bg-muted/40",
        expanded && "shadow-sm",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            config.iconBgClass,
            "text-primary-foreground",
          )}
        >
          <span className="text-sm leading-none">{config.icon}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <div className="truncate font-semibold text-foreground">{title}</div>
            <div className="shrink-0 text-xs text-muted-foreground">
              {timeString}
            </div>
          </div>

          {description && (
            <div className="mt-1 text-sm text-muted-foreground">
              {description}
            </div>
          )}

          {/* User footer */}
          {user && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {user.name.charAt(0)}
              </div>
              <span className="truncate">{user.name}</span>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
