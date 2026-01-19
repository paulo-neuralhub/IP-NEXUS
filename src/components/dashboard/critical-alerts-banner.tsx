import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface CriticalAlertsBannerProps {
  count: number;
}

export function CriticalAlertsBanner({ count }: CriticalAlertsBannerProps) {
  if (count === 0) return null;

  return (
    <Card className="border-destructive bg-destructive/10">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">
              {count} alerta{count > 1 ? "s" : ""} crítica{count > 1 ? "s" : ""} requiere{count > 1 ? "n" : ""} atención
            </p>
            <p className="text-sm text-destructive/80">
              Posibles conflictos detectados en vigilancias
            </p>
          </div>
        </div>
        <Button variant="destructive" asChild>
          <Link to="/app/spider?severity=critical">Ver alertas</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
