// ============================================================
// IP-NEXUS - AUDIT LOG VIEWER COMPONENT
// ============================================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Activity,
  Search,
  Filter,
  Download,
  User,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { useAuditLogs, type AuditLog } from '@/hooks/audit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const ACTION_ICONS: Record<string, typeof Activity> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  export: Download,
};

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  view: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  export: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export function AuditLogViewer() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: logs, isLoading } = useAuditLogs({
    resourceType: resourceFilter || undefined,
    action: actionFilter || undefined,
  });

  const filteredLogs = logs?.filter(log => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.resource_type.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.description?.toLowerCase().includes(searchLower) ||
      log.resource_id?.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = async () => {
    // Export functionality - simplified for now
    const dataStr = JSON.stringify(filteredLogs || [], null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    const Icon = ACTION_ICONS[action] || Activity;
    return Icon;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || ACTION_COLORS.view;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t('audit.logs.title', 'Audit Logs')}
          </h2>
          <p className="text-muted-foreground">
            {t('audit.logs.description', 'Track all changes and activities in your organization')}
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          {t('common.export', 'Export')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('audit.logs.search', 'Search logs...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
             <Select
               value={resourceFilter || '__all__'}
               onValueChange={(v) => setResourceFilter(v === '__all__' ? '' : v)}
             >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('audit.logs.resource', 'Resource Type')} />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="__all__">All Resources</SelectItem>
                <SelectItem value="matter">Matters</SelectItem>
                <SelectItem value="contact">Contacts</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="deal">Deals</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
             <Select
               value={actionFilter || '__all__'}
               onValueChange={(v) => setActionFilter(v === '__all__' ? '' : v)}
             >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('audit.logs.action', 'Action')} />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="__all__">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('audit.logs.recent', 'Recent Activity')}
          </CardTitle>
          <CardDescription>
            {filteredLogs?.length || 0} {t('audit.logs.entries', 'entries')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredLogs?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('audit.logs.empty', 'No logs found')}</h3>
                <p className="text-muted-foreground">
                  {t('audit.logs.emptyDesc', 'Try adjusting your filters')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs?.map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                        <ActionIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{log.action}</span>
                          <Badge variant="outline">{log.resource_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {log.description || `${log.action} ${log.resource_type} ${log.resource_id || ''}`}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {log.created_at && format(new Date(log.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.created_at && format(new Date(log.created_at), 'HH:mm')}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('audit.logs.detail', 'Log Details')}
            </DialogTitle>
            <DialogDescription>
              {selectedLog?.created_at && format(new Date(selectedLog.created_at), 'PPpp')}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('audit.logs.actionLabel', 'Action')}
                  </label>
                  <p className="capitalize">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('audit.logs.resourceLabel', 'Resource')}
                  </label>
                  <p>{selectedLog.resource_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('audit.logs.resourceId', 'Resource ID')}
                  </label>
                  <p className="font-mono text-sm">{selectedLog.resource_id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('audit.logs.userId', 'User ID')}
                  </label>
                  <p className="font-mono text-sm">{selectedLog.user_id || 'System'}</p>
                </div>
              </div>
              
              {selectedLog.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('audit.logs.description', 'Description')}
                  </label>
                  <p>{selectedLog.description}</p>
                </div>
              )}

              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('audit.logs.changes', 'Changes')}
                  </label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('audit.logs.metadata', 'Metadata')}
                  </label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {selectedLog.ip_address && (
                  <span>IP: {String(selectedLog.ip_address)}</span>
                )}
                {selectedLog.user_agent && (
                  <span className="truncate max-w-xs">
                    UA: {selectedLog.user_agent}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
