import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { usePageTitle } from "@/contexts/page-context";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { GlobalSearchTrigger } from "@/components/search";
import { NotificationBell } from "@/components/notifications";
import { WorkflowApprovalBadge } from "@/components/workflows/WorkflowApprovalBadge";
interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  onMenuClick?: () => void;
}

export function Header({ breadcrumbs, onMenuClick }: HeaderProps) {
  const { profile } = useAuth();
  const { currentOrganization } = useOrganization();
  const { title } = usePageTitle();

  const computedBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs && breadcrumbs.length) return breadcrumbs;
    return [
      { label: currentOrganization?.name || "Home", href: "/app" },
      { label: title },
    ];
  }, [breadcrumbs, currentOrganization?.name, title]);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border bg-background-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background-card/80 sm:px-6">
      <div className="flex h-full items-center justify-between gap-3">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background-card text-foreground md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="min-w-0 items-center gap-1 text-sm text-muted-foreground hidden sm:flex">
            {computedBreadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="inline-flex min-w-0 items-center">
                {index > 0 && <ChevronRight className="mx-1 h-4 w-4 shrink-0" />}
                {crumb.href ? (
                  <Link to={crumb.href} className="truncate hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="truncate text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Center (desktop search keeps existing GlobalSearch) */}
        <div className="hidden flex-1 max-w-xl md:block">
          <GlobalSearchTrigger />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Mobile search shortcut */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background-card text-foreground md:hidden"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Workflow Approvals */}
          <div className="hidden sm:block">
            <WorkflowApprovalBadge />
          </div>

          {/* Notifications */}
          <div className="hidden sm:block">
            <NotificationBell />
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background-card text-foreground sm:hidden"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* User Avatar */}
          <Link to="/app/settings" className="ml-1">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary">
                {getInitials(profile?.full_name || profile?.email || "U")}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}

