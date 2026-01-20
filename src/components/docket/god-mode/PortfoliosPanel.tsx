import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  FolderTree,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen
} from 'lucide-react';
import { usePortfolios, usePortfolioTree, useDeletePortfolio } from '@/hooks/docket';
import type { Portfolio } from '@/types/docket-god-mode';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function PortfoliosPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const { data: portfolios = [], isLoading } = usePortfolios({ 
    search: searchQuery || undefined 
  });
  const portfolioTree = usePortfolioTree();
  const deletePortfolio = useDeletePortfolio();

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Eliminar el portfolio "${name}"?`)) {
      deletePortfolio.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Portfolios
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Portfolio</DialogTitle>
              </DialogHeader>
              <CreatePortfolioForm onSuccess={() => {}} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar portfolios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Portfolio Tree */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : portfolioTree.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay portfolios</p>
            <p className="text-sm">Crea tu primer portfolio para organizar expedientes</p>
          </div>
        ) : (
          <div className="space-y-1">
            {portfolioTree.map((portfolio) => (
              <PortfolioTreeItem
                key={portfolio.id}
                portfolio={portfolio}
                level={0}
                expandedIds={expandedIds}
                onToggle={toggleExpand}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <span>Total: {portfolios.length} portfolios</span>
          <span>Activos: {portfolios.filter(p => p.is_active).length}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface PortfolioTreeItemProps {
  portfolio: Portfolio & { children?: Portfolio[] };
  level: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

function PortfolioTreeItem({ portfolio, level, expandedIds, onToggle, onDelete }: PortfolioTreeItemProps) {
  const hasChildren = portfolio.children && portfolio.children.length > 0;
  const isExpanded = expandedIds.has(portfolio.id);

  return (
    <div>
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 group",
          "transition-colors cursor-pointer"
        )}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => hasChildren && onToggle(portfolio.id)}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded",
            hasChildren ? "hover:bg-muted" : "invisible"
          )}
        >
          {hasChildren && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Folder Icon */}
        <div 
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ backgroundColor: portfolio.color ? `${portfolio.color}20` : undefined }}
        >
          {isExpanded ? (
            <FolderOpen className="h-4 w-4" style={{ color: portfolio.color }} />
          ) : (
            <Folder className="h-4 w-4" style={{ color: portfolio.color }} />
          )}
        </div>

        {/* Name */}
        <span className="flex-1 font-medium truncate">{portfolio.name}</span>

        {/* Matter Count Badge */}
        {portfolio.matter_count !== undefined && portfolio.matter_count > 0 && (
          <Badge variant="secondary" className="text-xs">
            {portfolio.matter_count}
          </Badge>
        )}

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus className="h-4 w-4 mr-2" />
              Añadir sub-portfolio
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(portfolio.id, portfolio.name)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {portfolio.children!.map((child) => (
            <PortfolioTreeItem
              key={child.id}
              portfolio={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreatePortfolioForm({ onSuccess }: { onSuccess: () => void }) {
  // Placeholder form
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre</label>
        <Input placeholder="Nombre del portfolio" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción</label>
        <Input placeholder="Descripción opcional" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex gap-2">
          {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-300"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Cancelar</Button>
        <Button>Crear Portfolio</Button>
      </div>
    </div>
  );
}
