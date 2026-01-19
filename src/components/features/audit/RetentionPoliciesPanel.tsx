// ============================================================
// IP-NEXUS - RETENTION POLICIES PANEL COMPONENT
// ============================================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Clock,
  Plus,
  Play,
  Edit,
  Trash2,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Calendar,
  Database,
  ChevronRight,
} from 'lucide-react';
import {
  useRetentionPolicies,
  useCreateRetentionPolicy,
  useUpdateRetentionPolicy,
  useDeleteRetentionPolicy,
  useSetLegalHold,
  useExecuteRetentionPolicy,
  useRetentionExecutions,
  type RetentionPolicy,
} from '@/hooks/audit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const DATA_TYPES = [
  { value: 'audit_logs', label: 'Audit Logs' },
  { value: 'access_logs', label: 'Access Logs' },
  { value: 'activities', label: 'Activities' },
  { value: 'documents', label: 'Documents' },
  { value: 'emails', label: 'Emails' },
  { value: 'exports', label: 'Exports' },
  { value: 'backups', label: 'Backups' },
  { value: 'temp_files', label: 'Temporary Files' },
];

const ACTIONS = [
  { value: 'archive', label: 'Archive', icon: Archive },
  { value: 'delete', label: 'Delete', icon: Trash2 },
  { value: 'anonymize', label: 'Anonymize', icon: Lock },
];

export function RetentionPoliciesPanel() {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);
  const [showLegalHoldDialog, setShowLegalHoldDialog] = useState(false);
  const [legalHoldReason, setLegalHoldReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { data: policies, isLoading } = useRetentionPolicies();
  const { data: executions } = useRetentionExecutions(selectedPolicy?.id);

  const createMutation = useCreateRetentionPolicy();
  const updateMutation = useUpdateRetentionPolicy();
  const deleteMutation = useDeleteRetentionPolicy();
  const legalHoldMutation = useSetLegalHold();
  const executeMutation = useExecuteRetentionPolicy();

  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    data_type: 'audit_logs',
    retention_days: 365,
    action: 'archive',
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(newPolicy);
    setShowCreateDialog(false);
    setNewPolicy({
      name: '',
      description: '',
      data_type: 'audit_logs',
      retention_days: 365,
      action: 'archive',
    });
  };

  const handleSetLegalHold = async (enable: boolean) => {
    if (!selectedPolicy) return;
    await legalHoldMutation.mutateAsync({
      id: selectedPolicy.id,
      legal_hold: enable,
      reason: enable ? legalHoldReason : undefined,
    });
    setShowLegalHoldDialog(false);
    setLegalHoldReason('');
  };

  const handleExecute = async (policy: RetentionPolicy) => {
    await executeMutation.mutateAsync(policy.id);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setShowDeleteConfirm(null);
  };

  const activePolicies = policies?.filter(p => p.is_active);
  const inactivePolicies = policies?.filter(p => !p.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6" />
            {t('retention.title', 'Data Retention Policies')}
          </h2>
          <p className="text-muted-foreground">
            {t('retention.description', 'Configure automatic data lifecycle management')}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('retention.addPolicy', 'Add Policy')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('retention.create.title', 'Create Retention Policy')}</DialogTitle>
              <DialogDescription>
                {t('retention.create.description', 'Define how long data should be retained')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('retention.form.name', 'Policy Name')}</Label>
                <Input
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                  placeholder="Audit Log Retention"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('retention.form.dataType', 'Data Type')}</Label>
                  <Select
                    value={newPolicy.data_type}
                    onValueChange={(value) => setNewPolicy({ ...newPolicy, data_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('retention.form.days', 'Retention Days')}</Label>
                  <Input
                    type="number"
                    value={newPolicy.retention_days}
                    onChange={(e) => setNewPolicy({ ...newPolicy, retention_days: parseInt(e.target.value) || 365 })}
                    min={1}
                    max={3650}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('retention.form.action', 'Action')}</Label>
                <Select
                  value={newPolicy.action}
                  onValueChange={(value) => setNewPolicy({ ...newPolicy, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center gap-2">
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('retention.form.description', 'Description')}</Label>
                <Textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Describe this retention policy..."
                  rows={2}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('retention.stats.active', 'Active Policies')}
                </p>
                <p className="text-2xl font-bold">
                  {activePolicies?.length || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('retention.stats.legalHold', 'Under Legal Hold')}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {policies?.filter(p => p.legal_hold).length || 0}
                </p>
              </div>
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('retention.stats.dataTypes', 'Data Types Covered')}
                </p>
                <p className="text-2xl font-bold">
                  {new Set(policies?.map(p => p.data_type)).size || 0}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('retention.policies', 'Policies')}</CardTitle>
          <CardDescription>
            {t('retention.policiesDesc', 'Manage your data retention rules')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !policies || policies.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">{t('retention.empty.title', 'No policies')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('retention.empty.description', 'Create a retention policy to get started.')}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('retention.addPolicy', 'Add Policy')}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {policies.map((policy) => {
                  const ActionIcon = ACTIONS.find(a => a.value === policy.action)?.icon || Archive;
                  
                  return (
                    <div
                      key={policy.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                        policy.legal_hold ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-full ${
                        policy.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        <ActionIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{policy.name}</span>
                          {policy.legal_hold && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                              <Lock className="h-3 w-3 mr-1" />
                              Legal Hold
                            </Badge>
                          )}
                          {!policy.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {DATA_TYPES.find(t => t.value === policy.data_type)?.label || policy.data_type} • 
                          {policy.retention_days} days • 
                          {ACTIONS.find(a => a.value === policy.action)?.label || policy.action}
                        </p>
                        {policy.next_run_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Next run: {format(new Date(policy.next_run_at), 'PPp')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPolicy(policy);
                            setShowLegalHoldDialog(true);
                          }}
                          title={policy.legal_hold ? 'Remove Legal Hold' : 'Set Legal Hold'}
                        >
                          {policy.legal_hold ? (
                            <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExecute(policy)}
                          disabled={executeMutation.isPending || policy.legal_hold}
                          title="Execute Now"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowDeleteConfirm(policy.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Legal Hold Dialog */}
      <Dialog open={showLegalHoldDialog} onOpenChange={setShowLegalHoldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPolicy?.legal_hold ? (
                <>
                  <Unlock className="h-5 w-5" />
                  {t('retention.legalHold.removeTitle', 'Remove Legal Hold')}
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  {t('retention.legalHold.setTitle', 'Set Legal Hold')}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedPolicy?.legal_hold
                ? t('retention.legalHold.removeDesc', 'This will allow the retention policy to execute normally.')
                : t('retention.legalHold.setDesc', 'This will prevent the retention policy from executing and preserve all data.')}
            </DialogDescription>
          </DialogHeader>
          {!selectedPolicy?.legal_hold && (
            <div className="space-y-2">
              <Label>{t('retention.legalHold.reason', 'Reason')}</Label>
              <Textarea
                value={legalHoldReason}
                onChange={(e) => setLegalHoldReason(e.target.value)}
                placeholder="Enter the reason for the legal hold..."
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLegalHoldDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={() => handleSetLegalHold(!selectedPolicy?.legal_hold)}
              disabled={legalHoldMutation.isPending}
              variant={selectedPolicy?.legal_hold ? 'default' : 'destructive'}
            >
              {selectedPolicy?.legal_hold
                ? t('retention.legalHold.remove', 'Remove Hold')
                : t('retention.legalHold.set', 'Set Hold')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('retention.delete.title', 'Delete Policy')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('retention.delete.description', 'Are you sure you want to delete this retention policy? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
