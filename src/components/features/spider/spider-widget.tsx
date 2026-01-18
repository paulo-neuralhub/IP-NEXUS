import { Link } from 'react-router-dom';
import { Eye, ArrowRight } from 'lucide-react';
import { useSpiderStats, useWatchResults } from '@/hooks/use-spider';
import { RESULT_PRIORITIES } from '@/lib/constants/spider';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function SpiderWidget() {
  const { data: stats } = useSpiderStats();
  const { data: results } = useWatchResults({ status: 'new', priority: ['high', 'critical'] });
  
  const recentResults = results?.slice(0, 3) || [];
  
  return (
    <div className="bg-card rounded-2xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-module-spider" />
          <h3 className="font-semibold text-foreground">IP-SPIDER</h3>
        </div>
        <Link to="/app/spider" className="text-sm text-primary hover:underline flex items-center gap-1">
          Ver todo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-foreground">{stats?.activeWatchlists || 0}</p>
          <p className="text-xs text-muted-foreground">Vigilancias</p>
        </div>
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <p className="text-2xl font-bold text-primary">{stats?.unreviewedResults || 0}</p>
          <p className="text-xs text-muted-foreground">Sin revisar</p>
        </div>
        <div className="text-center p-3 bg-destructive/10 rounded-lg">
          <p className="text-2xl font-bold text-destructive">{stats?.activeThreats || 0}</p>
          <p className="text-xs text-muted-foreground">Amenazas</p>
        </div>
      </div>
      
      {/* Recent high priority results */}
      {recentResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Resultados prioritarios</h4>
          {recentResults.map(result => (
            <Link
              key={result.id}
              to={`/app/spider/results`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: RESULT_PRIORITIES[result.priority as keyof typeof RESULT_PRIORITIES]?.color || '#6B7280' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                <p className="text-xs text-muted-foreground">
                  {result.similarity_score}% · {formatDistanceToNow(new Date(result.detected_at), { addSuffix: true, locale: es })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* No results message */}
      {recentResults.length === 0 && stats?.unreviewedResults === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Todo vigilado, sin alertas nuevas</p>
        </div>
      )}
    </div>
  );
}
