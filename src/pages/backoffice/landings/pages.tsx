// ============================================
// src/pages/backoffice/landings/pages.tsx
// Landing Pages List - CRUD for landing pages
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  FileText,
  Archive,
} from 'lucide-react';
import {
  useLandingPages,
  useDeleteLandingPage,
  useDuplicateLandingPage,
  useUpdateLandingPage,
} from '@/hooks/backoffice/useLandingPages';

export default function LandingPagesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: pages, isLoading } = useLandingPages();
  const deleteMutation = useDeleteLandingPage();
  const duplicateMutation = useDuplicateLandingPage();
  const updateMutation = useUpdateLandingPage();

  // Filter pages
  const filteredPages = pages?.filter((page) => {
    const matchesSearch =
      !search ||
      page.name.toLowerCase().includes(search.toLowerCase()) ||
      page.slug.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const handlePublish = (id: string, currentStatus: string) => {
    updateMutation.mutate({
      id,
      status: currentStatus === 'published' ? 'draft' : 'published',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Activa</Badge>;
      case 'draft':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Páginas</h1>
          <p className="text-muted-foreground">Gestiona las landing pages de cada módulo</p>
        </div>
        <Button asChild>
          <Link to="/backoffice/landings/paginas/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva landing
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {statusFilter === 'all' ? 'Todos los estados' : statusFilter === 'published' ? 'Activas' : statusFilter === 'draft' ? 'Borradores' : 'Archivadas'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('published')}>
              Activas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
              Borradores
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
              Archivadas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Visitas</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Conv.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages && filteredPages.length > 0 ? (
                filteredPages.map((page) => {
                  const conversionRate = page.total_visits > 0
                    ? ((page.total_leads / page.total_visits) * 100).toFixed(1)
                    : '-';

                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: page.accent_color }}
                          />
                          <div>
                            <p className="font-medium">{page.name}</p>
                            <p className="text-xs text-muted-foreground">{page.module_code}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">/{page.slug}</code>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {page.total_visits.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {page.total_leads.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {conversionRate !== '-' ? `${conversionRate}%` : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(page.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Preview
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/backoffice/landings/paginas/${page.id}`)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(page.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePublish(page.id, page.status)}>
                              {page.status === 'published' ? (
                                <>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Despublicar
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Publicar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteId(page.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron landing pages
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar landing page?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la landing page
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
