import { useMemo, useState } from 'react';
import { TrendingUp, Users, Settings, FileText, Phone, DollarSign } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProfessionalCard, CardHeader } from '@/components/ui/professional-card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBackofficeVoipStats } from '@/hooks/useBackofficeVoipStats';
import { useBackofficeVoipOrgs } from '@/hooks/useBackofficeVoipOrgs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Tab = 'overview' | 'organizations' | 'plans' | 'invoices';

function formatEur(cents: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100);
}

export default function VoipManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { data: stats, isLoading: statsLoading } = useBackofficeVoipStats();
  const { data: organizations, isLoading: orgsLoading } = useBackofficeVoipOrgs();

  const totals = useMemo(() => {
    const list = organizations ?? [];
    return {
      calls: list.reduce((sum, o) => sum + (o.month_total_calls ?? 0), 0),
      minutes: list.reduce((sum, o) => sum + (o.month_total_minutes ?? 0), 0),
      cost: list.reduce((sum, o) => sum + (o.month_total_cost_cents ?? 0), 0),
      revenue: list.reduce((sum, o) => sum + (o.month_total_price_cents ?? 0), 0),
      margin: list.reduce((sum, o) => sum + (o.month_margin_cents ?? 0), 0),
    };
  }, [organizations]);

  return (
    <PageContainer>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Gestión de Telefonía VoIP</h1>
        <p className="mt-1 text-sm text-muted-foreground">Costes, márgenes y facturación (Backoffice).</p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            { id: 'overview', label: 'Resumen', icon: TrendingUp },
            { id: 'organizations', label: 'Por organización', icon: Users },
            { id: 'plans', label: 'Planes', icon: Settings },
            { id: 'invoices', label: 'Facturación', icon: FileText },
          ] as const
        ).map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={activeTab === t.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')}>
            <StatCard
              label="Organizaciones activas"
              value={statsLoading ? '…' : String(stats?.active_organizations ?? 0)}
              icon={Users}
              variant="blue"
            />
            <StatCard
              label="Llamadas (mes)"
              value={statsLoading ? '…' : String(stats?.total_calls ?? 0)}
              icon={Phone}
              variant="purple"
            />
            <StatCard
              label="Coste (Twilio)"
              value={statsLoading ? '…' : formatEur(stats?.total_cost_cents ?? 0)}
              icon={DollarSign}
              variant="orange"
            />
            <StatCard
              label="Margen (mes)"
              value={statsLoading ? '…' : formatEur(stats?.total_margin_cents ?? 0)}
              icon={TrendingUp}
              variant="emerald"
              change={`${stats?.margin_percentage ?? 0}%`}
            />
          </div>

          <ProfessionalCard>
            <CardHeader title="Rentabilidad mensual" subtitle="Resumen del periodo actual" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-muted p-4">
                <div className="text-xs text-muted-foreground">Coste total</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{formatEur(stats?.total_cost_cents ?? 0)}</div>
              </div>
              <div className="rounded-xl border bg-muted p-4">
                <div className="text-xs text-muted-foreground">Ingresos</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{formatEur(stats?.total_revenue_cents ?? 0)}</div>
              </div>
              <div className="rounded-xl border bg-muted p-4">
                <div className="text-xs text-muted-foreground">Beneficio</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{formatEur(stats?.total_margin_cents ?? 0)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stats?.margin_percentage ?? 0}% margen</div>
              </div>
            </div>
          </ProfessionalCard>
        </div>
      )}

      {activeTab === 'organizations' && (
        <ProfessionalCard>
          <CardHeader title="Detalle por organización" subtitle="Resumen del periodo actual" />
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organización</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Llamadas</TableHead>
                  <TableHead className="text-right">Minutos</TableHead>
                  <TableHead className="text-right">Coste</TableHead>
                  <TableHead className="text-right">Ingreso</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      Cargando…
                    </TableCell>
                  </TableRow>
                ) : (organizations ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                      Aún no hay datos de VoIP.
                    </TableCell>
                  </TableRow>
                ) : (
                  (organizations ?? []).map((org) => {
                    const marginPct =
                      (org.month_total_price_cents ?? 0) > 0
                        ? ((org.month_margin_cents / org.month_total_price_cents) * 100).toFixed(1)
                        : '0.0';
                    return (
                      <TableRow key={org.organization_id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{org.organization_name}</div>
                          <div className="text-xs text-muted-foreground">{org.twilio_phone_number ?? '—'}</div>
                        </TableCell>
                        <TableCell>{org.plan_name ?? '—'}</TableCell>
                        <TableCell className="text-right">{org.month_total_calls}</TableCell>
                        <TableCell className="text-right">{org.month_total_minutes}</TableCell>
                        <TableCell className="text-right">{formatEur(org.month_total_cost_cents)}</TableCell>
                        <TableCell className="text-right">{formatEur(org.month_total_price_cents)}</TableCell>
                        <TableCell className="text-right">{formatEur(org.month_margin_cents)}</TableCell>
                        <TableCell className="text-right">{marginPct}%</TableCell>
                      </TableRow>
                    );
                  })
                )}

                {!orgsLoading && (organizations ?? []).length > 0 && (
                  <TableRow>
                    <TableCell className="font-semibold">TOTAL</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-semibold">{totals.calls}</TableCell>
                    <TableCell className="text-right font-semibold">{totals.minutes}</TableCell>
                    <TableCell className="text-right font-semibold">{formatEur(totals.cost)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatEur(totals.revenue)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatEur(totals.margin)}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </ProfessionalCard>
      )}

      {activeTab === 'plans' && (
        <ProfessionalCard>
          <CardHeader title="Planes" subtitle="(MVP) Alta/edición de planes se implementa en el siguiente paso" />
          <p className="text-sm text-muted-foreground">
            La lectura de planes ya está lista en base de datos. Añadiremos el editor CRUD en backoffice a continuación.
          </p>
        </ProfessionalCard>
      )}

      {activeTab === 'invoices' && (
        <ProfessionalCard>
          <CardHeader title="Facturación" subtitle="(MVP) Generación de facturas se implementa en el siguiente paso" />
          <p className="text-sm text-muted-foreground">
            Aquí mostraremos facturas y el botón de generar el mes. De momento queda preparado el esquema.
          </p>
        </ProfessionalCard>
      )}
    </PageContainer>
  );
}
