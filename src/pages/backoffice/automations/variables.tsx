// =====================================================================
// IP-NEXUS BACKOFFICE - Variables de Automatización
// =====================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Variable, ArrowLeft, Plus, Pencil, Trash2, Lock, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';

import {
  useAutomationVariables,
  useCreateVariable,
  useUpdateVariable,
  useDeleteVariable,
} from '@/hooks/backoffice/useAutomationVariables';

import type { AutomationVariable } from '@/types/automations';

export default function VariablesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedVariable, setSelectedVariable] = useState<AutomationVariable | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    is_system: false,
  });

  // Queries & Mutations
  const { data: variables, isLoading } = useAutomationVariables(null); // Global variables
  const createVariable = useCreateVariable();
  const updateVariable = useUpdateVariable();
  const deleteVariable = useDeleteVariable();

  const handleCreate = () => {
    setSelectedVariable(null);
    setFormData({ key: '', value: '', description: '', is_system: false });
    setIsDialogOpen(true);
  };

  const handleEdit = (variable: AutomationVariable) => {
    setSelectedVariable(variable);
    setFormData({
      key: variable.key,
      value: variable.value,
      description: variable.description || '',
      is_system: variable.is_system,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (variable: AutomationVariable) => {
    setSelectedVariable(variable);
    setIsDeleting(true);
  };

  const handleSubmit = () => {
    if (selectedVariable) {
      updateVariable.mutate({
        id: selectedVariable.id,
        ...formData,
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedVariable(null);
        },
      });
    } else {
      createVariable.mutate({
        ...formData,
        organization_id: null, // Global variable
      }, {
        onSuccess: () => {
          setIsDialogOpen(false);
        },
      });
    }
  };

  const handleConfirmDelete = () => {
    if (selectedVariable) {
      deleteVariable.mutate(selectedVariable.id, {
        onSuccess: () => {
          setIsDeleting(false);
          setSelectedVariable(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/backoffice/automations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Variable className="h-6 w-6 text-primary" />
              Variables Globales
            </h1>
            <p className="text-muted-foreground">
              Variables disponibles para todas las automatizaciones.
            </p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Variable
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Variables Globales</p>
              <p className="text-sm text-blue-700 mt-1">
                Estas variables están disponibles para todas las automatizaciones y todos los tenants.
                Usa la sintaxis <code className="bg-blue-100 px-1 rounded">{'{{global.key}}'}</code> para referenciarlas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : !variables?.length ? (
            <div className="text-center py-12">
              <Variable className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Sin variables</h3>
              <p className="text-muted-foreground mt-1">
                Crea la primera variable global.
              </p>
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Variable
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-20">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variables.map((variable) => (
                  <TableRow key={variable.id}>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {variable.key}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[200px] truncate block">
                        {variable.value}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {variable.description || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {variable.is_system ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Sistema
                        </Badge>
                      ) : (
                        <Badge variant="outline">Personalizada</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(variable)}
                          disabled={variable.is_system}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(variable)}
                          disabled={variable.is_system}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedVariable ? 'Editar Variable' : 'Nueva Variable'}
            </DialogTitle>
            <DialogDescription>
              {selectedVariable 
                ? 'Modifica los valores de la variable.'
                : 'Crea una nueva variable global para las automatizaciones.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                placeholder="company_support_email"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                disabled={!!selectedVariable}
              />
              <p className="text-xs text-muted-foreground">
                Usa snake_case. Ejemplo: default_currency, max_retries
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Textarea
                id="value"
                placeholder="Valor de la variable"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input
                id="description"
                placeholder="Descripción de la variable"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Variable de Sistema</Label>
                <p className="text-xs text-muted-foreground">
                  Las variables de sistema no pueden ser editadas por tenants.
                </p>
              </div>
              <Switch
                checked={formData.is_system}
                onCheckedChange={(checked) => setFormData({ ...formData, is_system: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.key || !formData.value || createVariable.isPending || updateVariable.isPending}
            >
              {(createVariable.isPending || updateVariable.isPending) && (
                <Spinner className="h-4 w-4 mr-2" />
              )}
              {selectedVariable ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar variable?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la variable "{selectedVariable?.key}".
              Las automatizaciones que la usen podrían dejar de funcionar correctamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
