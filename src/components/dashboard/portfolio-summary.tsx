import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PortfolioSummaryProps {
  value: number;
  change: number;
  currency: string;
  breakdown: {
    trademarks: number;
    patents: number;
    designs: number;
    copyrights: number;
    other: number;
  };
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PortfolioSummary({ value, change, currency, breakdown }: PortfolioSummaryProps) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-module-finance" />
          Valor del Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold">
              {formatCurrency(value, currency)}
            </p>
            <div className={cn(
              "flex items-center gap-1 mt-1",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {isPositive ? "+" : ""}{change.toFixed(1)}%
              </span>
              <span className="text-muted-foreground text-sm">vs coste</span>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/app/finance/valuation">
              Ver detalles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Portfolio breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
          <BreakdownItem label="Marcas" value={breakdown.trademarks} currency={currency} />
          <BreakdownItem label="Patentes" value={breakdown.patents} currency={currency} />
          <BreakdownItem label="Diseños" value={breakdown.designs} currency={currency} />
          <BreakdownItem label="Copyright" value={breakdown.copyrights} currency={currency} />
          <BreakdownItem label="Otros" value={breakdown.other} currency={currency} />
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownItem({ 
  label, 
  value, 
  currency 
}: { 
  label: string; 
  value: number; 
  currency: string 
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{formatCurrency(value, currency)}</p>
    </div>
  );
}
