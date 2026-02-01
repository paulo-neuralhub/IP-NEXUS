import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  ChevronDown,
  ChevronRight,
  Download,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  category: string;
  name: string;
  status: "passed" | "failed" | "warning" | "skipped";
  message?: string;
  duration_ms: number;
  details?: Record<string, unknown>;
}

interface TestSummary {
  run_id: string;
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  skipped: number;
  duration_ms: number;
  pass_rate: number;
}

interface TestRunResponse {
  summary: TestSummary;
  by_category: Record<string, TestResult[]>;
  results: TestResult[];
}

const TEST_CATEGORIES = [
  { id: "auth", label: "Autenticación", icon: "🔐" },
  { id: "organizations", label: "Organizaciones", icon: "🏢" },
  { id: "accounts", label: "Cuentas CRM", icon: "👥" },
  { id: "contacts", label: "Contactos", icon: "📇" },
  { id: "matters", label: "Expedientes", icon: "📁" },
  { id: "workflow", label: "Workflows", icon: "⚙️" },
  { id: "communications", label: "Comunicaciones", icon: "💬" },
  { id: "documents", label: "Documentos", icon: "📄" },
  { id: "tasks", label: "Tareas", icon: "✅" },
  { id: "alerts", label: "Alertas", icon: "🔔" },
  { id: "calendar", label: "Calendario", icon: "📅" },
  { id: "time_tracking", label: "Time Tracking", icon: "⏱️" },
  { id: "invoicing", label: "Facturación", icon: "💰" },
  { id: "templates", label: "Plantillas", icon: "📝" },
  { id: "signatures", label: "Firmas", icon: "✍️" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "search", label: "Búsqueda", icon: "🔍" },
  { id: "nice_classes", label: "Clases Nice", icon: "🏷️" },
  { id: "portal", label: "Portal Cliente", icon: "🌐" },
  { id: "settings", label: "Configuración", icon: "⚙️" },
  { id: "edge_functions", label: "Edge Functions", icon: "⚡" },
];

export default function SystemTestsPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch previous test runs
  // NOTE: system_test_summary view was dropped (system_test_results table doesn't exist)
  // This query returns empty array until the test infrastructure is implemented
  const { data: previousRuns, isLoading: loadingRuns } = useQuery({
    queryKey: ["system-test-runs"],
    queryFn: async () => {
      // Return empty array - test summary view not available
      return [] as Array<{
        run_id: string;
        started_at: string;
        completed_at: string;
        total_tests: number;
        passed: number;
        failed: number;
        warnings: number;
        skipped: number;
        overall_status: string;
      }>;
    },
  });

  // Run tests mutation
  const runTestsMutation = useMutation({
    mutationFn: async (category?: string) => {
      const url = category 
        ? `${import.meta.env.VITE_SUPABASE_URL || 'https://dcdbpmbzizzzzdfkvohl.supabase.co'}/functions/v1/run-system-tests?category=${category}`
        : `${import.meta.env.VITE_SUPABASE_URL || 'https://dcdbpmbzizzzzdfkvohl.supabase.co'}/functions/v1/run-system-tests`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGJwbWJ6aXp6enpkZmt2b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjgzNTcsImV4cCI6MjA4NDMwNDM1N30.m-eYHXgQAPEejDLHKgJQaBiwEB19HJT3zjQSsPqLf5g'}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Test run failed: ${response.statusText}`);
      }

      return response.json() as Promise<TestRunResponse>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["system-test-runs"] });
      toast({
        title: "Tests completados",
        description: `${data.summary.passed}/${data.summary.total} tests pasados (${data.summary.pass_rate}%)`,
        variant: data.summary.failed > 0 ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error ejecutando tests",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    },
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      passed: "default",
      failed: "destructive",
      warning: "secondary",
      skipped: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const results = runTestsMutation.data;

  const downloadReport = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-test-report-${results.summary.run_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Verificación del Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Ejecuta ~105 tests para verificar todas las funcionalidades de IP-NEXUS
          </p>
        </div>
        <div className="flex gap-2">
          {results && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          )}
          <Button
            onClick={() => runTestsMutation.mutate(undefined)}
            disabled={runTestsMutation.isPending}
            size="lg"
          >
            {runTestsMutation.isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {runTestsMutation.isPending ? "Ejecutando..." : "Ejecutar Tests"}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {runTestsMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Ejecutando tests del sistema...</p>
                <p className="text-sm text-muted-foreground">Esto puede tardar unos segundos</p>
              </div>
            </div>
            <Progress value={50} className="mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{results.summary.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{results.summary.passed}</div>
              <p className="text-sm text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
          <Card className={cn(
            results.summary.failed > 0 && "border-red-200 bg-red-50/50 dark:bg-red-950/20"
          )}>
            <CardContent className="pt-6 text-center">
              <div className={cn("text-3xl font-bold", results.summary.failed > 0 && "text-red-600")}>
                {results.summary.failed}
              </div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{results.summary.pass_rate}%</div>
              <p className="text-sm text-muted-foreground">Pass Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{(results.summary.duration_ms / 1000).toFixed(1)}s</div>
              <p className="text-sm text-muted-foreground">Duración</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results by Category */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados por Categoría</CardTitle>
            <CardDescription>
              Click en cada categoría para ver los tests individuales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {TEST_CATEGORIES.map((category) => {
              const categoryResults = results.by_category[category.id] || [];
              if (categoryResults.length === 0) return null;

              const passed = categoryResults.filter((r) => r.status === "passed").length;
              const failed = categoryResults.filter((r) => r.status === "failed").length;
              const allPassed = failed === 0;
              const isExpanded = expandedCategories.has(category.id);

              return (
                <Collapsible key={category.id} open={isExpanded}>
                  <CollapsibleTrigger
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                      allPassed 
                        ? "hover:bg-green-50 dark:hover:bg-green-950/20" 
                        : "hover:bg-red-50 dark:hover:bg-red-950/20",
                      isExpanded && (allPassed ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20")
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                      {allPassed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <Badge variant={allPassed ? "default" : "destructive"}>
                      {passed}/{categoryResults.length}
                    </Badge>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="ml-10 mt-2 space-y-1">
                      {categoryResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded text-sm bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="font-mono text-xs">{result.name}</span>
                            {result.message && (
                              <span className="text-muted-foreground text-xs">
                                — {result.message}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {result.duration_ms}ms
                            </span>
                            {getStatusBadge(result.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Previous Runs */}
      {!results && previousRuns && previousRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ejecuciones Anteriores</CardTitle>
            <CardDescription>Últimos 10 tests ejecutados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {previousRuns.map((run: any) => (
                <div
                  key={run.run_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {run.failed === 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {run.passed}/{run.total_tests} tests pasados
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(run.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={run.failed === 0 ? "default" : "destructive"}>
                    {run.pass_rate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!results && !runTestsMutation.isPending && (!previousRuns || previousRuns.length === 0) && (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay tests ejecutados</h3>
            <p className="text-muted-foreground mb-6">
              Ejecuta la suite de tests para verificar el estado del sistema
            </p>
            <Button onClick={() => runTestsMutation.mutate(undefined)}>
              <Play className="mr-2 h-4 w-4" />
              Ejecutar Tests
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
