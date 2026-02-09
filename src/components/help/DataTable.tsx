// ============================================================
// IP-NEXUS HELP — DATA TABLE PREMIUM
// Tablas con diseño consistente para artículos
// ============================================================

interface DataTableProps {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export function DataTable({ headers, rows, caption }: DataTableProps) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-border shadow-sm">
      {caption && (
        <div className="px-5 py-3 bg-muted/50 border-b border-border">
          <span className="text-[12px] font-semibold text-foreground/70">{caption}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/40">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left py-3 px-5 text-[11px] font-bold text-muted-foreground uppercase tracking-[0.06em] border-b border-border"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`py-3 px-5 text-[13px] ${
                      j === 0 ? 'font-semibold text-foreground' : 'text-foreground/70'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
