// src/components/features/ip-finance/PortfolioCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, TrendingUp, TrendingDown, MoreVertical, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { FinancePortfolio } from '@/types/ip-finance.types';
import { Link } from 'react-router-dom';

interface PortfolioCardProps {
  portfolio: FinancePortfolio;
  onDelete?: (id: string) => void;
}

function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export function PortfolioCard({ portfolio, onDelete }: PortfolioCardProps) {
  const gain = portfolio.unrealized_gain || 0;
  const isPositive = gain >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{portfolio.name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/app/finance/valuation/portfolio/${portfolio.id}`}>
                  <Eye className="h-4 w-4 mr-2" /> Ver detalles
                </Link>
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(portfolio.id)}>
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {portfolio.description && (
          <p className="text-sm text-muted-foreground mt-1">{portfolio.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor total</span>
            <span className="font-semibold">{formatCurrency(portfolio.total_value || 0, portfolio.currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Activos</span>
            <Badge variant="secondary">{portfolio.total_assets || 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ganancia</span>
            <span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrency(gain, portfolio.currency)}
            </span>
          </div>
        </div>
        <Button asChild className="w-full mt-4" variant="outline">
          <Link to={`/app/finance/valuation/portfolio/${portfolio.id}`}>Ver Portfolio</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
