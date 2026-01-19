// src/pages/app/finance/valuation/index.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calculator, Briefcase, TrendingUp } from 'lucide-react';
import { usePortfolios, useCreatePortfolio } from '@/hooks/finance/usePortfolioValuation';
import { PortfolioCard } from '@/components/features/ip-finance/PortfolioCard';
import { ValuationWizard } from '@/components/features/ip-finance/ValuationWizard';
import { EmptyState } from '@/components/ui/empty-state';

export default function ValuationDashboardPage() {
  const { data: portfolios, isLoading } = usePortfolios();
  const createPortfolio = useCreatePortfolio();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ name: '', description: '' });

  const handleCreatePortfolio = async () => {
    await createPortfolio.mutateAsync(newPortfolio);
    setShowCreateDialog(false);
    setNewPortfolio({ name: '', description: '' });
  };

  const totalValue = portfolios?.reduce((sum, p) => sum + (p.total_value || 0), 0) || 0;
  const totalAssets = portfolios?.reduce((sum, p) => sum + (p.total_assets || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            Valoración de Portfolios
          </h1>
          <p className="text-muted-foreground">Valora y gestiona tus activos de propiedad intelectual</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWizard(true)}>
            <Calculator className="h-4 w-4 mr-2" />
            Valoración Rápida
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Portfolio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input 
                    value={newPortfolio.name} 
                    onChange={(e) => setNewPortfolio(p => ({ ...p, name: e.target.value }))}
                    placeholder="Mi Portfolio de Marcas"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea 
                    value={newPortfolio.description} 
                    onChange={(e) => setNewPortfolio(p => ({ ...p, description: e.target.value }))}
                    placeholder="Descripción opcional..."
                  />
                </div>
                <Button 
                  onClick={handleCreatePortfolio} 
                  disabled={!newPortfolio.name || createPortfolio.isPending}
                  className="w-full"
                >
                  Crear Portfolio
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Portfolios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolios?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Activos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolios Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : portfolios?.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-12 w-12" />}
          title="Sin portfolios"
          description="Crea tu primer portfolio para comenzar a valorar tus activos IP"
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Portfolio
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios?.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}

      {/* Quick Valuation Wizard Dialog */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl">
          <ValuationWizard onComplete={() => setShowWizard(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
