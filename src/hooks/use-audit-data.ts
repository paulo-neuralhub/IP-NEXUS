// ============================================================
// IP-NEXUS - Database Audit Data Hook (READ-ONLY)
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rpcFn } from '@/lib/supabase';
import { classifyTable, type TableClassification } from '@/lib/audit/classifyTable';

export interface AuditTableRow {
  table_name: string;
  row_count: number;
  table_size: string;
  column_count: number;
  rls_enabled: boolean;
  classification: TableClassification;
}

export interface AuditBucket {
  id: string;
  name: string;
  public: boolean;
  classification: TableClassification;
}

export interface AuditSummary {
  project: string;
  emoji: string;
  color: string;
  tableCount: number;
  totalRows: number;
}

export function useAuditData() {
  const [tables, setTables] = useState<AuditTableRow[]>([]);
  const [buckets, setBuckets] = useState<AuditBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch table stats via RPC
        const { data: tableData, error: tableError } = await rpcFn('audit_get_table_stats');

        if (tableError) {
          throw new Error(`Error obteniendo estadísticas: ${tableError.message}`);
        }

        const classified: AuditTableRow[] = (tableData || []).map((t: any) => ({
          table_name: t.table_name,
          row_count: Number(t.row_count) || 0,
          table_size: t.table_size || '0 bytes',
          column_count: Number(t.column_count) || 0,
          rls_enabled: Boolean(t.rls_enabled),
          classification: classifyTable(t.table_name),
        }));

        setTables(classified);

        // Fetch storage buckets
        try {
          const { data: bucketData } = await supabase.storage.listBuckets();
          const classifiedBuckets: AuditBucket[] = (bucketData || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            public: b.public,
            classification: classifyTable(b.name),
          }));
          setBuckets(classifiedBuckets);
        } catch {
          // Storage access may fail — non-critical
          setBuckets([]);
        }
      } catch (e: any) {
        setError(e.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const summary = useMemo<AuditSummary[]>(() => {
    const groups: Record<string, AuditSummary> = {};

    for (const t of tables) {
      const key = t.classification.project;
      if (!groups[key]) {
        groups[key] = {
          project: key,
          emoji: t.classification.emoji,
          color: t.classification.color,
          tableCount: 0,
          totalRows: 0,
        };
      }
      groups[key].tableCount++;
      groups[key].totalRows += t.row_count;
    }

    // Order: IP-NEXUS, Umbrella, Compartido, Revisar
    const order = ['IP-NEXUS', 'Umbrella Brands', '⚠️ COMPARTIDO', '❓ REVISAR'];
    return order
      .filter(k => groups[k])
      .map(k => groups[k])
      .concat(Object.values(groups).filter(g => !order.includes(g.project)));
  }, [tables]);

  const sharedTables = useMemo(
    () => tables.filter(t => t.classification.project.includes('COMPARTIDO')),
    [tables]
  );

  const tablesWithoutRls = useMemo(
    () => tables.filter(t => !t.rls_enabled),
    [tables]
  );

  return { tables, buckets, summary, sharedTables, tablesWithoutRls, loading, error };
}
