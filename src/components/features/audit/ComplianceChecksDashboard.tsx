// ============================================================
// IP-NEXUS - COMPLIANCE CHECKS DASHBOARD COMPONENT
// ============================================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Plus,
  Play,
  ChevronRight,
  Filter,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  useComplianceChecks,
  usePendingReviewChecks,
  useNonCompliantChecks,
  useCreateComplianceCheck,
  useRunComplianceCheck,
  useComplianceStats,
  type ComplianceCheck,
  type ComplianceFramework,
} from '@/hooks/audit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_CONFIG = {
  compliant: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    badge: 'default' as const,
  },
  non_compliant: {
    icon: AlertCircle,
    color: 'bg-destructive/10 text-destructive',
    badge: 'destructive' as const,
  },
  pending_review: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    badge: 'secondary' as const,
  },
  partial: {
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    badge: 'secondary' as const,
  },
  not_applicable: {
    icon: FileText,
    color: 'bg-muted text-muted-foreground',
    badge: 'outline' as const,
  },
};

const FRAMEWORKS: { value: ComplianceFramework; label: string }[] = [
  { value: 'gdpr', label: 'GDPR' },
  { value: 'iso27001', label: 'ISO 27001' },
  { value: 'soc2', label: 'SOC 2' },
  { value: 'hipaa', label: 'HIPAA' },
  { value: 'pci_dss', label: 'PCI DSS' },
  { value: 'internal', label: 'Internal' },
];

type StatusConfigType = typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG];

export function ComplianceChecksDashboard() {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<ComplianceCheck | null>(null);
  const [frameworkFilter, setFrameworkFilter] = useState<string>('');

  const { data: allChecks, isLoading } = useComplianceChecks({
    framework: frameworkFilter as ComplianceFramework | undefined,
  });
  const { data: pendingChecks } = usePendingReviewChecks();
  const { data: nonCompliantChecks } = useNonCompliantChecks();
  const { data: stats } = useComplianceStats();

  const createMutation = useCreateComplianceCheck();
  const runMutation = useRunComplianceCheck();

  const [newCheck, setNewCheck] = useState({
    check_name: '',
    check_code: '',
    check_description: '',
    framework: 'gdpr' as ComplianceFramework,
    category: '',
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      framework: newCheck.framework,
      check_code: newCheck.check_code,
      check_name: newCheck.check_name,
      check_description: newCheck.check_description,
      category: newCheck.category,
    });
    setShowCreateDialog(false);
    setNewCheck({
      check_name: '',
      check_code: '',
      check_description: '',
      framework: 'gdpr',
      category: '',
    });
  };

  const handleRunCheck = async (check: ComplianceCheck) => {
    await runMutation.mutateAsync({ id: check.id, status: 'compliant' });
  };

  const getStatusConfig = (status: string): StatusConfigType => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending_review;
  };

  const compliancePercentage = stats?.compliance_percentage || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            {t('compliance.title', 'Compliance Checks')}
          </h2>
          <p className="text-muted-foreground">
            {t('compliance.description', 'Monitor regulatory compliance across frameworks')}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('compliance.addCheck', 'Add Check')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('compliance.create.title', 'Create Compliance Check')}</DialogTitle>
              <DialogDescription>
                {t('compliance.create.description', 'Add a new compliance check to monitor')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('compliance.form.name', 'Check Name')}</Label>
                  <Input
                    value={newCheck.check_name}
                    onChange={(e) => setNewCheck({ ...newCheck, check_name: e.target.value })}
                    placeholder="Data Encryption"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('compliance.form.code', 'Check Code')}</Label>
                  <Input
                    value={newCheck.check_code}
                    onChange={(e) => setNewCheck({ ...newCheck, check_code: e.target.value })}
                    placeholder="GDPR-01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('compliance.form.framework', 'Framework')}</Label>
                  <Select
                    value={newCheck.framework}
                    onValueChange={(value) => setNewCheck({ ...newCheck, framework: value as ComplianceFramework })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FRAMEWORKS.map((fw) => (
                        <SelectItem key={fw.value} value={fw.value}>
                          {fw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('compliance.form.category', 'Category')}</Label>
                  <Input
                    value={newCheck.category}
                    onChange={(e) => setNewCheck({ ...newCheck, category: e.target.value })}
                    placeholder="Data Security"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('compliance.form.description', 'Description')}</Label>
                <Textarea
                  value={newCheck.check_description}
                  onChange={(e) => setNewCheck({ ...newCheck, check_description: e.target.value })}
                  placeholder="Describe what this compliance check verifies..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {t('common.create', 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('compliance.stats.overall', 'Overall Compliance')}
                </p>
                <p className="text-3xl font-bold">
                  {compliancePercentage.toFixed(1)}%
                </p>
              </div>
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <Progress value={compliancePercentage} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('compliance.stats.compliant', 'Compliant')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.compliant || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('compliance.stats.nonCompliant', 'Non-Compliant')}
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {stats?.non_compliant || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Filter */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select
          value={frameworkFilter || '__all__'}
          onValueChange={(v) => setFrameworkFilter(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('compliance.filter.framework', 'All Frameworks')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('compliance.filter.all', 'All Frameworks')}</SelectItem>
            {FRAMEWORKS.map((fw) => (
              <SelectItem key={fw.value} value={fw.value}>
                {fw.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Checks Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            {t('compliance.tabs.all', 'All Checks')}
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            {t('compliance.tabs.pending', 'Pending Review')}
            {pendingChecks && pendingChecks.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingChecks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="non_compliant" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            {t('compliance.tabs.nonCompliant', 'Non-Compliant')}
            {nonCompliantChecks && nonCompliantChecks.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {nonCompliantChecks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ChecksList
            checks={allChecks}
            isLoading={isLoading}
            onSelect={setSelectedCheck}
            onRun={handleRunCheck}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <ChecksList
            checks={pendingChecks}
            isLoading={isLoading}
            onSelect={setSelectedCheck}
            onRun={handleRunCheck}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>

        <TabsContent value="non_compliant" className="mt-4">
          <ChecksList
            checks={nonCompliantChecks}
            isLoading={isLoading}
            onSelect={setSelectedCheck}
            onRun={handleRunCheck}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>
      </Tabs>

      {/* Check Detail Dialog */}
      <Dialog open={!!selectedCheck} onOpenChange={() => setSelectedCheck(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {selectedCheck?.check_name}
            </DialogTitle>
            <DialogDescription>
              {selectedCheck?.check_code} • {selectedCheck?.framework.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          {selectedCheck && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusConfig(selectedCheck.status).badge}>
                  {selectedCheck.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {selectedCheck.category && (
                  <Badge variant="outline">{selectedCheck.category}</Badge>
                )}
              </div>

              {selectedCheck.check_description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('compliance.detail.description', 'Description')}
                  </label>
                  <p className="mt-1">{selectedCheck.check_description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('compliance.detail.lastChecked', 'Last Checked')}
                  </label>
                  <p>
                    {selectedCheck.last_checked_at
                      ? format(new Date(selectedCheck.last_checked_at), 'PPp')
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('compliance.detail.nextReview', 'Next Review')}
                  </label>
                  <p>
                    {selectedCheck.next_review_at
                      ? format(new Date(selectedCheck.next_review_at), 'PPp')
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedCheck.evidence_notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('compliance.detail.evidence', 'Evidence Notes')}
                  </label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedCheck.evidence_notes}</p>
                </div>
              )}

              {selectedCheck.remediation_plan && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('compliance.detail.remediation', 'Remediation Plan')}
                  </label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedCheck.remediation_plan}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCheck(null)}>
              {t('common.close', 'Close')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => selectedCheck && handleRunCheck(selectedCheck)}
              disabled={runMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              {t('compliance.actions.runCheck', 'Run Check')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Checks List Component
function ChecksList({
  checks,
  isLoading,
  onSelect,
  onRun,
  getStatusConfig,
}: {
  checks: ComplianceCheck[] | undefined;
  isLoading: boolean;
  onSelect: (check: ComplianceCheck) => void;
  onRun: (check: ComplianceCheck) => void;
  getStatusConfig: (status: string) => StatusConfigType;
}) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!checks || checks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('compliance.empty.title', 'No checks found')}</h3>
          <p className="text-muted-foreground">
            {t('compliance.empty.description', 'Create a compliance check to get started.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {checks.map((check) => {
          const config = getStatusConfig(check.status);
          const StatusIcon = config.icon;

          return (
            <Card
              key={check.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => onSelect(check)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{check.check_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {check.check_code}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {check.check_description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{check.framework.toUpperCase()}</Badge>
                      {check.category && <span>{check.category}</span>}
                      {check.last_checked_at && (
                        <>
                          <span>•</span>
                          <span>Last: {format(new Date(check.last_checked_at), 'MMM d')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRun(check);
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
