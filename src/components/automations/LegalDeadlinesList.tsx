// ============================================================
// IP-NEXUS - LEGAL DEADLINES LIST
// Reference list of official IP deadlines by jurisdiction
// ============================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Info, Calendar, ExternalLink, Shield, Clock, RefreshCw } from 'lucide-react';
import { useLegalDeadlines, useIPOffices, LegalDeadline } from '@/hooks/useLegalDeadlines';
import { LegalDeadlineCard } from './LegalDeadlineCard';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const RIGHT_TYPES = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'trademark', label: 'Marcas' },
  { value: 'patent', label: 'Patentes' },
  { value: 'design', label: 'Diseños' },
];

export function LegalDeadlinesList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: deadlines, isLoading } = useLegalDeadlines({
    officeCode: officeFilter !== 'all' ? officeFilter : undefined,
    rightType: typeFilter !== 'all' ? typeFilter : undefined,
    searchQuery: searchQuery || undefined,
  });

  const { data: offices } = useIPOffices();

  // Group deadlines by office
  const groupedDeadlines = deadlines?.reduce((acc, deadline) => {
    const officeCode = deadline.ipo_offices?.code || 'OTHER';
    const officeName = deadline.ipo_offices?.name_official || 'Otros';
    const flag = deadline.ipo_offices?.flag_emoji || '🌐';
    
    if (!acc[officeCode]) {
      acc[officeCode] = {
        code: officeCode,
        name: officeName,
        flag,
        deadlines: [],
      };
    }
    acc[officeCode].deadlines.push(deadline);
    return acc;
  }, {} as Record<string, { code: string; name: string; flag: string; deadlines: LegalDeadline[] }>);

  // Calculate last global verification
  const lastVerification = deadlines?.reduce((latest, d) => {
    if (d.last_verified_at && (!latest || d.last_verified_at > latest)) {
      return d.last_verified_at;
    }
    return latest;
  }, null as string | null);

  if (isLoading) {
    return <LegalDeadlinesListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Plazos Legales</h1>
        <p className="text-muted-foreground">
          Base de datos de referencia de plazos oficiales por jurisdicción
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Esta es una base de datos de referencia de plazos legales oficiales. 
          Las reglas de automatización se basan en estos plazos. Si detectas algún error, 
          contacta a soporte para su corrección.
        </AlertDescription>
      </Alert>

      {/* Verification Info */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Última verificación global:{' '}
            {lastVerification 
              ? format(new Date(lastVerification), "d MMMM yyyy", { locale: es })
              : 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Próxima revisión programada: 1 julio 2026</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar plazos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={officeFilter} onValueChange={setOfficeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Oficina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las oficinas</SelectItem>
                {offices?.map(office => (
                  <SelectItem key={office.code} value={office.code}>
                    {office.flag_emoji} {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {RIGHT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deadlines by Office */}
      {!groupedDeadlines || Object.keys(groupedDeadlines).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No se encontraron plazos con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-420px)]">
          <div className="space-y-8">
            {Object.values(groupedDeadlines).map((group) => (
              <div key={group.code}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{group.flag}</span>
                  <h2 className="text-lg font-semibold">{group.name}</h2>
                  <Badge variant="outline">{group.deadlines.length} plazos</Badge>
                </div>
                <div className="grid gap-4">
                  {group.deadlines.map((deadline) => (
                    <LegalDeadlineCard key={deadline.id} deadline={deadline} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function LegalDeadlinesListSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-20" />
      <Skeleton className="h-14" />
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-32" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
