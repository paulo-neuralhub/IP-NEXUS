// ============================================================
// IP-NEXUS AI BRAIN - TEST SUITES TAB (PHASE 5)
// ============================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  FlaskConical, Plus, Play, CheckCircle, XCircle, 
  Clock, Star, Trash2, ChevronDown, ChevronRight,
  AlertTriangle, ShieldCheck, FileText
} from 'lucide-react';

import {
  useAITestSuites,
  useCreateTestSuite,
  useDeleteTestSuite,
  useAITestCases,
  useCreateTestCase,
  useDeleteTestCase,
  useAITestRuns,
  useStartTestRun,
  useAITaskAssignments,
} from '@/hooks/ai-brain';
import type { AITestSuiteWithStats, AITestRun } from '@/types/ai-evaluation.types';

export function TestSuitesTab() {
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);
  const [isAddingSuite, setIsAddingSuite] = useState(false);
  const [isAddingCase, setIsAddingCase] = useState(false);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());

  // Queries
  const { data: suites, isLoading } = useAITestSuites();
  const { tasks } = useAITaskAssignments();
  const { data: testCases } = useAITestCases(selectedSuiteId || undefined);
  const { data: testRuns } = useAITestRuns(selectedSuiteId || undefined);

  // Mutations
  const createSuite = useCreateTestSuite();
  const deleteSuite = useDeleteTestSuite();
  const createCase = useCreateTestCase();
  const deleteCase = useDeleteTestCase();
  const startRun = useStartTestRun();

  // Form state
  const [suiteForm, setSuiteForm] = useState({
    name: '',
    description: '',
    task_id: '',
    is_required_for_publish: false,
    pass_threshold: 0.8,
  });

  const [caseForm, setCaseForm] = useState({
    name: '',
    description: '',
    input_variables: '{}',
    expected_contains: '',
    is_golden: false,
    priority: 5,
  });

  const toggleSuiteExpand = (suiteId: string) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteId)) {
      newExpanded.delete(suiteId);
    } else {
      newExpanded.add(suiteId);
    }
    setExpandedSuites(newExpanded);
  };

  const getStatusIcon = (run?: AITestRun | null) => {
    if (!run) return <Clock className="h-5 w-5 text-muted-foreground" />;
    if (run.status === 'running') return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    if (run.passed) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const handleCreateSuite = () => {
    if (!suiteForm.name || !suiteForm.task_id) return;
    
    createSuite.mutate({
      name: suiteForm.name,
      description: suiteForm.description,
      task_id: suiteForm.task_id,
      is_required_for_publish: suiteForm.is_required_for_publish,
      pass_threshold: suiteForm.pass_threshold,
    }, {
      onSuccess: () => {
        setIsAddingSuite(false);
        setSuiteForm({
          name: '',
          description: '',
          task_id: '',
          is_required_for_publish: false,
          pass_threshold: 0.8,
        });
      }
    });
  };

  const handleCreateCase = () => {
    if (!selectedSuiteId || !caseForm.name) return;
    
    let inputVars = {};
    try {
      inputVars = JSON.parse(caseForm.input_variables);
    } catch {
      inputVars = {};
    }

    createCase.mutate({
      suiteId: selectedSuiteId,
      data: {
        name: caseForm.name,
        description: caseForm.description,
        input_variables: inputVars,
        expected_contains: caseForm.expected_contains.split('\n').filter(s => s.trim()),
        is_golden: caseForm.is_golden,
        priority: caseForm.priority,
      }
    }, {
      onSuccess: () => {
        setIsAddingCase(false);
        setCaseForm({
          name: '',
          description: '',
          input_variables: '{}',
          expected_contains: '',
          is_golden: false,
          priority: 5,
        });
      }
    });
  };

  // Stats
  const totalSuites = suites?.length || 0;
  const passingSuites = suites?.filter(s => s.latest_run?.passed).length || 0;
  const failingSuites = suites?.filter(s => s.latest_run && !s.latest_run.passed).length || 0;
  const totalCases = suites?.reduce((sum, s) => sum + s.total_cases, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-6 w-6 text-purple-500" />
          <div>
            <h2 className="text-xl font-semibold">Test Suites & Quality Gates</h2>
            <p className="text-sm text-muted-foreground">
              Evaluation suites for prompt quality and regression detection
            </p>
          </div>
        </div>
        
        <Dialog open={isAddingSuite} onOpenChange={setIsAddingSuite}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Suite
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Test Suite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={suiteForm.name}
                  onChange={(e) => setSuiteForm({ ...suiteForm, name: e.target.value })}
                  placeholder="e.g., Opposition Document Tests"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={suiteForm.description}
                  onChange={(e) => setSuiteForm({ ...suiteForm, description: e.target.value })}
                  placeholder="Describe what this suite tests..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Task *</Label>
                <Select
                  value={suiteForm.task_id}
                  onValueChange={(v) => setSuiteForm({ ...suiteForm, task_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks?.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.task_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Pass Threshold: {(suiteForm.pass_threshold * 100).toFixed(0)}%</Label>
                <Slider
                  value={[suiteForm.pass_threshold * 100]}
                  onValueChange={(v) => setSuiteForm({ ...suiteForm, pass_threshold: v[0] / 100 })}
                  min={50}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Required for Publish</Label>
                  <p className="text-xs text-muted-foreground">
                    Block prompt publishing if tests fail
                  </p>
                </div>
                <Switch
                  checked={suiteForm.is_required_for_publish}
                  onCheckedChange={(c) => setSuiteForm({ ...suiteForm, is_required_for_publish: c })}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddingSuite(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSuite}
                  disabled={!suiteForm.name || !suiteForm.task_id || createSuite.isPending}
                >
                  Create Suite
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Suites</p>
                <p className="text-2xl font-bold">{totalSuites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Passing</p>
                <p className="text-2xl font-bold text-green-600">{passingSuites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Failing</p>
                <p className="text-2xl font-bold text-red-600">{failingSuites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Test Cases</p>
                <p className="text-2xl font-bold">{totalCases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suites List */}
      <div className="space-y-3">
        {suites?.map((suite) => (
          <SuiteCard
            key={suite.id}
            suite={suite}
            isExpanded={expandedSuites.has(suite.id)}
            isSelected={selectedSuiteId === suite.id}
            onToggleExpand={() => toggleSuiteExpand(suite.id)}
            onSelect={() => setSelectedSuiteId(suite.id)}
            onDelete={() => {
              if (confirm('Delete this test suite?')) {
                deleteSuite.mutate(suite.id);
              }
            }}
            onRun={() => startRun.mutate({ suiteId: suite.id })}
            getStatusIcon={getStatusIcon}
          />
        ))}

        {suites?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No test suites yet. Create one to start evaluating your AI tasks.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Suite Detail */}
      {selectedSuiteId && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Test Cases for: {suites?.find(s => s.id === selectedSuiteId)?.name}
            </CardTitle>
            <Dialog open={isAddingCase} onOpenChange={setIsAddingCase}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Test Case</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={caseForm.name}
                      onChange={(e) => setCaseForm({ ...caseForm, name: e.target.value })}
                      placeholder="e.g., Generate opposition with similar mark"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={caseForm.description}
                      onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Input Variables (JSON)</Label>
                    <Textarea
                      value={caseForm.input_variables}
                      onChange={(e) => setCaseForm({ ...caseForm, input_variables: e.target.value })}
                      placeholder='{"client_name": "Acme Corp", "context": "..."}'
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label>Expected Contains (one per line)</Label>
                    <Textarea
                      value={caseForm.expected_contains}
                      onChange={(e) => setCaseForm({ ...caseForm, expected_contains: e.target.value })}
                      placeholder={"fundamentos de derecho\nsolicita\nmarca"}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label>Priority: {caseForm.priority}</Label>
                    <Slider
                      value={[caseForm.priority]}
                      onValueChange={(v) => setCaseForm({ ...caseForm, priority: v[0] })}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={caseForm.is_golden}
                      onCheckedChange={(c) => setCaseForm({ ...caseForm, is_golden: c })}
                    />
                    <Label>Mark as Golden Test (required to pass)</Label>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddingCase(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateCase}
                      disabled={!caseForm.name || createCase.isPending}
                    >
                      Create Test
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testCases?.map((tc) => (
                <div 
                  key={tc.id}
                  className={`p-4 border rounded-lg ${tc.is_golden ? 'border-yellow-300 bg-yellow-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {tc.is_golden && <Star className="h-5 w-5 text-yellow-500 mt-0.5" />}
                      <div>
                        <p className="font-medium">{tc.name}</p>
                        {tc.description && (
                          <p className="text-sm text-muted-foreground">{tc.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tc.expected_contains?.slice(0, 3).map((exp, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              contains: "{exp}"
                            </Badge>
                          ))}
                          {tc.expected_contains?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tc.expected_contains.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this test case?')) {
                          deleteCase.mutate({ id: tc.id, suiteId: selectedSuiteId });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {testCases?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No test cases yet. Add one to start testing.
                </p>
              )}
            </div>
            
            {/* Recent Runs */}
            {testRuns && testRuns.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Recent Runs</h4>
                <div className="space-y-2">
                  {testRuns.slice(0, 5).map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {run.status === 'running' ? (
                          <Clock className="h-5 w-5 text-blue-500 animate-spin" />
                        ) : run.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {run.passed_tests}/{run.total_tests} passed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(run.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={run.passed ? 'default' : 'destructive'}>
                        {run.pass_rate ? `${(run.pass_rate * 100).toFixed(0)}%` : '-'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Suite Card Component
function SuiteCard({
  suite,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect,
  onDelete,
  onRun,
  getStatusIcon,
}: {
  suite: AITestSuiteWithStats;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onRun: () => void;
  getStatusIcon: (run?: AITestRun | null) => React.ReactNode;
}) {
  const passRate = suite.latest_run?.pass_rate ? suite.latest_run.pass_rate * 100 : null;
  
  return (
    <Card className={isSelected ? 'ring-2 ring-primary' : ''}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={onSelect}>
            {getStatusIcon(suite.latest_run)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{suite.name}</p>
                {suite.is_required_for_publish && (
                  <Badge variant="outline" className="text-xs">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{suite.task?.task_code || 'Unknown task'}</span>
                <span>{suite.total_cases} tests</span>
                {suite.golden_cases > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {suite.golden_cases} golden
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Pass Rate */}
            {passRate !== null && (
              <div className="w-32">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className={passRate >= 80 ? 'text-green-600' : 'text-red-600'}>
                    {passRate.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={passRate} 
                  className={`h-2 ${passRate >= 80 ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
                />
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onRun}>
                <Play className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onToggleExpand}>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
        
        {isExpanded && suite.latest_run && (
          <div className="mt-4 pt-4 border-t text-sm">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-muted-foreground">Last Run</p>
                <p>{new Date(suite.latest_run.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Passed</p>
                <p className="text-green-600">{suite.latest_run.passed_tests}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Failed</p>
                <p className="text-red-600">{suite.latest_run.failed_tests}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cost</p>
                <p>${suite.latest_run.total_cost?.toFixed(4) || '0'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
