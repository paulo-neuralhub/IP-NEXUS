import { useEffect } from "react";
import { usePageTitle } from "@/contexts/page-context";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export function ModulePlaceholder({ title, description, icon: Icon, color }: ModulePlaceholderProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <h1 className="text-2xl font-bold text-secondary mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Badge className="bg-info text-info-foreground">En desarrollo</Badge>
    </div>
  );
}
