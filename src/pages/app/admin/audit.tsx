// ============================================================
// IP-NEXUS - Database Audit Page (READ-ONLY, Temporary)
// ============================================================

import { useState, useMemo } from 'react';
import { useAuditData, type AuditTableRow } from '@/hooks/use-audit-data';
import { getRowBgClass, PROJECT_FILTERS } from '@/lib/audit/classifyTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { generateCSV } from '@/lib/export/excel-generator';
import {
  Search, Download, Copy, AlertTriangle,
  Database, ShieldCheck, ShieldOff, HardDrive,
  Loader2, RefreshCw,
} from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { toast } from 'sonner';

// ── Known edge functions ──
const KNOWN_EDGE_FUNCTIONS = [
  'automation-execute', 'automation-cron-runner', 'automation-event-processor',
  'send-email', 'voip-topup-checkout', 'stripe-webhook',
  'ai-chat', 'ai-agent-chat', 'spider-scan', 'market-webhook',
];

export default function DatabaseAuditPage() {
  const { tables, buckets, summary, sharedTables, tablesWithoutRls, loading, error } = useAuditData();
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('Todos');

  // Filtered tables
  const filtered = useMemo(() => {
    let result = tables;
    if (projectFilter !== 'Todos') {
      result = result.filter(t => t.classification.project === projectFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.table_name.toLowerCase().includes(q));
    }
    return result;
  }, [tables, projectFilter, search]);

  // ── Export CSV ──
  const handleExportCSV = () => {
    generateCSV({
      filename: `audit-db-${new Date().toISOString().slice(0, 10)}`,
      columns: [
        { key: 'table_name', header: 'Tabla' },
        { key: 'project', header: 'Proyecto', format: (_v, row) => (row as any).project },
        { key: 'module', header: 'Módulo', format: (_v, row) => (row as any).module },
        { key: 'row_count', header: 'Filas' },
        { key: 'column_count', header: 'Columnas' },
        { key: 'table_size', header: 'Tamaño' },
        { key: 'rls', header: 'RLS', format: (_v, row) => (row as any).rls ? 'Sí' : 'No' },
      ],
      data: tables.map(t => ({
        table_name: t.table_name,
        project: t.classification.project,
        module: t.classification.module,
        row_count: t.row_count,
        column_count: t.column_count,
        table_size: t.table_size,
        rls: t.rls_enabled,
      })),
    });
    toast.success('CSV exportado');
  };

  // ── Copy report ──
  const handleCopyReport = () => {
    const lines = [
      '═══════════════════════════════════════',
      '  AUDITORÍA BASE DE DATOS IP-NEXUS',
      `  Fecha: ${new Date().toLocaleDateString('es-ES')}`,
      '═══════════════════════════════════════',
      '',
      '── RESUMEN ──',
      ...summary.map(s => `${s.emoji} ${s.project}: ${s.tableCount} tablas, ${formatNumber(s.totalRows)} filas`),
      '',
      `Total tablas: ${tables.length}`,
      `Total filas: ${formatNumber(tables.reduce((a, t) => a + t.row_count, 0))}`,
      `Tablas sin RLS: ${tablesWithoutRls.length}`,
      '',
      '── TABLAS COMPARTIDAS ──',
      ...sharedTables.map(t => `  - ${t.table_name} (${t.row_count} filas)`),
      '',
      '── INVENTARIO COMPLETO ──',
      ...tables.map(t =>
        `${t.classification.emoji} ${t.table_name.padEnd(45)} | ${t.classification.project.padEnd(18)} | ${String(t.row_count).padStart(8)} filas | ${t.rls_enabled ? '🔒' : '⚠️'}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    toast.success('Informe copiado al portapapeles');
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Cargando auditoría…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Banner */}
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm font-medium text-amber-800">
          ⚠️ Modo auditoría: No se realizan cambios en la base de datos — Solo lectura
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6" />
            Auditoría de Base de Datos
          </h1>
          <p className="text-muted-foreground text-sm">
            Inventario completo · {tables.length} tablas detectadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyReport}>
            <Copy className="h-4 w-4 mr-1" /> Copiar informe
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" /> Exportar CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* ── SECTION 2: Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map(s => (
          <Card key={s.project} style={{ borderLeftColor: s.color, borderLeftWidth: 4 }}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{s.emoji} {s.tableCount}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.project}</p>
              <p className="text-xs text-muted-foreground">{formatNumber(s.totalRows)} filas</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── SECTION 6: Shared Tables Warning ── */}
      {sharedTables.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Tablas Compartidas Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-2">
              Estas tablas son usadas por AMBOS proyectos. La separación requiere especial cuidado:
            </p>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              {sharedTables.map(t => (
                <li key={t.table_name}>
                  <strong>{t.table_name}</strong> — {t.row_count} filas · {t.classification.module}
                </li>
              ))}
            </ul>
            <p className="text-xs text-red-500 mt-3">
              RECOMENDACIÓN: Antes de separar, exportar estas tablas completas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 7: RLS Warning ── */}
      {tablesWithoutRls.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <ShieldOff className="h-4 w-4" />
              {tablesWithoutRls.length} tablas sin RLS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {tablesWithoutRls.map(t => (
                <Badge key={t.table_name} variant="outline" className="text-orange-700 border-orange-300 bg-orange-100 text-xs">
                  {t.table_name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 3: Edge Functions ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Edge Functions conocidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {KNOWN_EDGE_FUNCTIONS.map(fn => (
              <Badge key={fn} variant="secondary" className="text-xs">{fn}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Verifica las Edge Functions completas en{' '}
            <a
              href="https://supabase.com/dashboard/project/dcdbpmbzizzzzdfkvohl/functions"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              Supabase Dashboard → Edge Functions
            </a>
          </p>
        </CardContent>
      </Card>

      {/* ── SECTION 4: Storage Buckets ── */}
      {buckets.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage Buckets ({buckets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {buckets.map(b => (
                <div key={b.id} className="rounded-md border p-3">
                  <p className="font-medium text-sm">{b.name}</p>
                  <Badge variant={b.public ? 'destructive' : 'secondary'} className="text-[10px] mt-1">
                    {b.public ? 'Público' : 'Privado'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── SECTION 5: Main Table with Filters ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Inventario completo de tablas</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tabla…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-9 w-56"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PROJECT_FILTERS.map(f => (
              <Button
                key={f}
                variant={projectFilter === f ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setProjectFilter(f)}
              >
                {f} {f !== 'Todos' && `(${tables.filter(t => t.classification.project === f).length})`}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">🔒</TableHead>
                <TableHead>Tabla</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead className="text-right">Filas</TableHead>
                <TableHead className="text-right">Cols</TableHead>
                <TableHead className="text-right">Tamaño</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No se encontraron tablas
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(t => (
                <TableRow key={t.table_name} className={getRowBgClass(t.classification.project)}>
                  <TableCell>
                    {t.rls_enabled ? (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <ShieldOff className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{t.table_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px]"
                      style={{ borderColor: t.classification.color, color: t.classification.color }}
                    >
                      {t.classification.emoji} {t.classification.project}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.classification.module}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatNumber(t.row_count)}</TableCell>
                  <TableCell className="text-right text-xs">{t.column_count}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{t.table_size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
