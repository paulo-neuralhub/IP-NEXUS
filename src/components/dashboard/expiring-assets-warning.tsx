import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ExpiringAssetsWarningProps {
  count: number;
}

export function ExpiringAssetsWarning({ count }: ExpiringAssetsWarningProps) {
  if (count === 0) return null;

  return (
    <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-200 dark:bg-amber-800">
            <Clock className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {count} activo{count > 1 ? "s" : ""} expira{count > 1 ? "n" : ""} en los próximos 90 días
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Revisa las renovaciones pendientes
            </p>
          </div>
        </div>
        <Button variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-100" asChild>
          <Link to="/app/finance/renewals">
            Ver renovaciones
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
