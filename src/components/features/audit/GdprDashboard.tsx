// ============================================================
// IP-NEXUS - GDPR DASHBOARD COMPONENT
// ============================================================

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Shield,
  Download,
  Trash2,
  Edit,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  FileText,
  Search,
  ChevronRight,
} from 'lucide-react';
import {
  useGdprRequests,
  useCreateGdprRequest,
  useProcessGdprRequest,
  useGdprStats,
  useDataExports,
  type GdprRequest,
  type GdprRequestType,
} from '@/hooks/audit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const REQUEST_TYPE_CONFIG = {
  access: {
    icon: Eye,
    label: 'Data Access',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  rectification: {
    icon: Edit,
    label: 'Rectification',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  erasure: {
    icon: Trash2,
    label: 'Erasure',
    color: 'bg-destructive/10 text-destructive',
  },
  portability: {
    icon: Download,
    label: 'Portability',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  restriction: {
    icon: AlertCircle,
    label: 'Restriction',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  objection: {
    icon: XCircle,
    label: 'Objection',
    color: 'bg-muted text-muted-foreground',
  },
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500', badge: 'secondary' as const },
  identity_verification: { label: 'Identity Verification', color: 'bg-orange-500', badge: 'secondary' as const },
  in_progress: { label: 'In Progress', color: 'bg-primary', badge: 'default' as const },
  completed: { label: 'Completed', color: 'bg-green-500', badge: 'default' as const },
  rejected: { label: 'Rejected', color: 'bg-destructive', badge: 'destructive' as const },
  cancelled: { label: 'Cancelled', color: 'bg-muted-foreground', badge: 'secondary' as const },
};

type TypeConfigType = typeof REQUEST_TYPE_CONFIG[keyof typeof REQUEST_TYPE_CONFIG];
type StatusConfigType = typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG];

export function GdprDashboard() {
  const { t } = useTranslation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GdprRequest | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: requests, isLoading } = useGdprRequests({
    type: typeFilter || undefined,
  });
  const { data: stats } = useGdprStats();
  const { data: exports } = useDataExports();

  const createMutation = useCreateGdprRequest();
  const processMutation = useProcessGdprRequest();

  const [newRequest, setNewRequest] = useState({
    request_type: 'access' as GdprRequestType,
    requester_email: '',
    requester_name: '',
    description: '',
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      requester_email: newRequest.requester_email,
      requester_name: newRequest.requester_name,
      request_type: newRequest.request_type,
      description: newRequest.description,
    });
    setShowCreateDialog(false);
    setNewRequest({
      request_type: 'access',
      requester_email: '',
      requester_name: '',
      description: '',
    });
  };

  const handleProcess = async (request: GdprRequest, action: 'approve' | 'reject') => {
    await processMutation.mutateAsync({
      id: request.id,
      status: action === 'approve' ? 'completed' : 'rejected',
      notes: action === 'reject' ? 'Request rejected' : undefined,
    });
    setSelectedRequest(null);
  };

  const getTypeConfig = (type: string): TypeConfigType => {
    return REQUEST_TYPE_CONFIG[type as keyof typeof REQUEST_TYPE_CONFIG] || REQUEST_TYPE_CONFIG.access;
  };

  const getStatusConfig = (status: string): StatusConfigType => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  };

  const pendingRequests = requests?.filter(r => r.status === 'pending' || r.status === 'in_progress');
  const completedRequests = requests?.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            {t('gdpr.title', 'GDPR & Data Rights')}
          </h2>
          <p className="text-muted-foreground">
            {t('gdpr.description', 'Manage data subject requests and privacy compliance')}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('gdpr.newRequest', 'New Request')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('gdpr.create.title', 'Create GDPR Request')}</DialogTitle>
              <DialogDescription>
                {t('gdpr.create.description', 'Record a new data subject request')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('gdpr.form.type', 'Request Type')}</Label>
                <Select
                  value={newRequest.request_type}
                  onValueChange={(value) => setNewRequest({ ...newRequest, request_type: value as GdprRequestType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REQUEST_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('gdpr.form.name', 'Requester Name')}</Label>
                  <Input
                    value={newRequest.requester_name}
                    onChange={(e) => setNewRequest({ ...newRequest, requester_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('gdpr.form.email', 'Requester Email')}</Label>
                  <Input
                    type="email"
                    value={newRequest.requester_email}
                    onChange={(e) => setNewRequest({ ...newRequest, requester_email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('gdpr.form.details', 'Description')}</Label>
                <Textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Describe the request..."
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('gdpr.stats.pending', 'Pending')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.pending_requests || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('gdpr.stats.total', 'Total Requests')}
                </p>
                <p className="text-2xl font-bold">
                  {stats?.total_requests || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('gdpr.stats.completed', 'Completed')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.completed_requests || 0}
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
                  {t('gdpr.stats.avgTime', 'Avg. Processing')}
                </p>
                <p className="text-2xl font-bold">
                  {stats?.avg_completion_days ? `${Math.round(stats.avg_completion_days)}d` : '-'}
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Select
          value={typeFilter || '__all__'}
          onValueChange={(v) => setTypeFilter(v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('gdpr.filter.type', 'All Types')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('gdpr.filter.all', 'All Types')}</SelectItem>
            {Object.entries(REQUEST_TYPE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            {t('gdpr.tabs.pending', 'Active')}
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {t('gdpr.tabs.completed', 'Completed')}
          </TabsTrigger>
          <TabsTrigger value="exports" className="gap-2">
            <Download className="h-4 w-4" />
            {t('gdpr.tabs.exports', 'Data Exports')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <RequestsList
            requests={pendingRequests}
            isLoading={isLoading}
            onSelect={setSelectedRequest}
            getTypeConfig={getTypeConfig}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <RequestsList
            requests={completedRequests}
            isLoading={isLoading}
            onSelect={setSelectedRequest}
            getTypeConfig={getTypeConfig}
            getStatusConfig={getStatusConfig}
          />
        </TabsContent>

        <TabsContent value="exports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('gdpr.exports.title', 'Data Exports')}</CardTitle>
              <CardDescription>
                {t('gdpr.exports.description', 'Recent data export requests')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exports && exports.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {exports.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{exp.export_type}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.created_at && format(new Date(exp.created_at), 'PPp')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={exp.status === 'completed' ? 'default' : 'secondary'}>
                          {exp.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('gdpr.exports.empty', 'No data exports yet')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRequest && (() => {
                const config = getTypeConfig(selectedRequest.request_type);
                const Icon = config.icon;
                return <Icon className="h-5 w-5" />;
              })()}
              {t('gdpr.detail.title', 'GDPR Request Details')}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.created_at && format(new Date(selectedRequest.created_at), 'PPpp')}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getTypeConfig(selectedRequest.request_type).color}>
                  {getTypeConfig(selectedRequest.request_type).label}
                </Badge>
                <Badge variant={getStatusConfig(selectedRequest.status || 'pending').badge}>
                  {getStatusConfig(selectedRequest.status || 'pending').label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('gdpr.detail.subjectName', 'Requester')}
                  </label>
                  <p>{selectedRequest.requester_name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('gdpr.detail.subjectEmail', 'Email')}
                  </label>
                  <p>{selectedRequest.requester_email}</p>
                </div>
              </div>

              {selectedRequest.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('gdpr.detail.details', 'Description')}
                  </label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequest.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('gdpr.detail.dueDate', 'Due Date')}
                  </label>
                  <p>
                    {selectedRequest.due_date
                      ? format(new Date(selectedRequest.due_date), 'PPp')
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('gdpr.detail.identityVerified', 'Identity Verified')}
                  </label>
                  <p>
                    {selectedRequest.identity_verified ? (
                      <span className="text-primary flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Pending
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {selectedRequest.processing_notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('gdpr.detail.notes', 'Processing Notes')}
                  </label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedRequest.processing_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              {t('common.close', 'Close')}
            </Button>
            {selectedRequest?.status === 'pending' || selectedRequest?.status === 'in_progress' ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedRequest && handleProcess(selectedRequest, 'reject')}
                  disabled={processMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('gdpr.actions.reject', 'Reject')}
                </Button>
                <Button
                  onClick={() => selectedRequest && handleProcess(selectedRequest, 'approve')}
                  disabled={processMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('gdpr.actions.complete', 'Complete')}
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Requests List Component
function RequestsList({
  requests,
  isLoading,
  onSelect,
  getTypeConfig,
  getStatusConfig,
}: {
  requests: GdprRequest[] | undefined;
  isLoading: boolean;
  onSelect: (request: GdprRequest) => void;
  getTypeConfig: (type: string) => TypeConfigType;
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

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('gdpr.empty.title', 'No requests')}</h3>
          <p className="text-muted-foreground">
            {t('gdpr.empty.description', 'No GDPR requests at this time.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3">
        {requests.map((request) => {
          const typeConfig = getTypeConfig(request.request_type);
          const TypeIcon = typeConfig.icon;
          const statusConfig = getStatusConfig(request.status || 'pending');

          return (
            <Card
              key={request.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => onSelect(request)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${typeConfig.color}`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {request.requester_name || request.requester_email}
                      </span>
                      <Badge className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {request.description || 'No description provided'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{request.created_at && format(new Date(request.created_at), 'MMM d, yyyy')}</span>
                      <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
                      <span>{statusConfig.label}</span>
                      {request.due_date && (
                        <>
                          <span>•</span>
                          <span>Due: {format(new Date(request.due_date), 'MMM d')}</span>
                        </>
                      )}
                    </div>
                  </div>
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
