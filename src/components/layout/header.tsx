import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { usePageTitle } from "@/contexts/page-context";
import { ChevronRight, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function Header() {
  const { profile } = useAuth();
  const { currentOrganization } = useOrganization();
  const { title } = usePageTitle();

  return (
    <header className="sticky top-0 z-10 h-16 bg-background-card border-b border-border px-6 flex items-center justify-between">
      {/* Breadcrumbs & Title */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link to="/app" className="hover:text-foreground">
            {currentOrganization?.name || "Home"}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground">{title}</span>
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Avatar */}
        <Link to="/app/settings">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary">
              {getInitials(profile?.full_name || profile?.email || "U")}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
