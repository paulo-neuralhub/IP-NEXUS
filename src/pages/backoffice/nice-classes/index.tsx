// ============================================================
// IP-NEXUS BACKOFFICE - Nice Classes Admin Page
// ============================================================

import { useState } from 'react';
import { 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Star, 
  Eye, 
  EyeOff, 
  Trash2, 
  Plus, 
  CheckCircle,
  Tags,
  Edit2,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  useNiceStats,
  useNiceClasses,
  useNiceClass,
  useNiceProducts,
  useMarkClassReviewed,
  useAddNiceProduct,
  useUpdateNiceProduct,
  useDeleteNiceProduct,
  useExportNiceClasses,
  useNiceRevisionLog,
  needsReview,
  type NiceClass,
  type NiceProduct,
} from '@/hooks/backoffice/useNiceClassesAdmin';

export default function NiceClassesAdminPage() {
  const { data: stats, isLoading: statsLoading } = useNiceStats();
  const { data: classes, isLoading: classesLoading } = useNiceClasses();
  const exportMutation = useExportNiceClasses();
  
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [filterPending, setFilterPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes?.filter(cls => {
    if (filterPending && !needsReview(cls.last_reviewed_at)) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        cls.class_number.toString().includes(term) ||
        cls.title_es.toLowerCase().includes(term) ||
        cls.title_en?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="h-6 w-6 text-primary" />
            Gestión Clases Nice
          </h1>
          <p className="text-muted-foreground">
            Clasificación Internacional de Niza para marcas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar WIPO
          </Button>
        </div>
      </div>

      {/* Alert for pending reviews */}
      {stats && stats.classesNeedingReview > 0 && (
        <Alert variant="default" className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Revisión necesaria</AlertTitle>
          <AlertDescription className="text-warning/80">
            {stats.classesNeedingReview} clases no han sido revisadas en más de 12 meses.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-2 text-warning"
              onClick={() => setFilterPending(true)}
            >
              Ver clases pendientes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))
        ) : (
          <>
            <Card className="p-4">
              <div className="text-2xl font-bold">{stats?.totalClasses || 45}</div>
              <div className="text-sm text-muted-foreground">Clases Nice</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{stats?.totalProducts?.toLocaleString() || 0}</div>
              <div className="text-sm text-muted-foreground">Productos/Servicios</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-success">{stats?.reviewedThisYear || 0}</div>
              <div className="text-sm text-muted-foreground">Revisadas este año</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-warning">{stats?.classesNeedingReview || 0}</div>
              <div className="text-sm text-muted-foreground">Pendientes revisión</div>
            </Card>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Clases</CardTitle>
              {filterPending && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFilterPending(false)}
                >
                  Mostrar todas
                </Button>
              )}
            </div>
            <Input
              placeholder="Buscar clase..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {classesLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                filteredClasses?.map((cls) => (
                  <button
                    key={cls.class_number}
                    type="button"
                    onClick={() => setSelectedClass(cls.class_number)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 text-left border-b hover:bg-muted/50 transition-colors",
                      selectedClass === cls.class_number && "bg-muted"
                    )}
                  >
                    <span className="text-2xl">{cls.icon || '📦'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Clase {cls.class_number}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {cls.title_es}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {cls.product_count || 0}
                      </Badge>
                      {needsReview(cls.last_reviewed_at) && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </button>
                ))
              )}
              {filteredClasses?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No se encontraron clases
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Class detail */}
        <Card className="lg:col-span-2">
          {selectedClass ? (
            <NiceClassDetail 
              classNumber={selectedClass} 
            />
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[650px] text-muted-foreground">
              <Tags className="h-12 w-12 mb-4 opacity-50" />
              <p>Selecciona una clase para ver sus productos</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

// Class Detail Component
function NiceClassDetail({ classNumber }: { classNumber: number }) {
  const { data: classInfo, isLoading: classLoading } = useNiceClass(classNumber);
  const { data: products, isLoading: productsLoading, refetch } = useNiceProducts(classNumber);
  const { data: revisionLog } = useNiceRevisionLog(classNumber);
  
  const markReviewed = useMarkClassReviewed();
  const addProduct = useAddNiceProduct();
  const updateProduct = useUpdateNiceProduct();
  const deleteProduct = useDeleteNiceProduct();

  const [newProductName, setNewProductName] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    
    await addProduct.mutateAsync({
      classNumber,
      nameEs: newProductName,
    });
    setNewProductName('');
  };

  const handleToggleCommon = (product: NiceProduct) => {
    updateProduct.mutate({
      productId: product.id,
      classNumber,
      updates: { is_common: !product.is_common },
    });
  };

  const handleToggleActive = (product: NiceProduct) => {
    updateProduct.mutate({
      productId: product.id,
      classNumber,
      updates: { is_active: !product.is_active },
    });
  };

  const handleUpdateProductName = (productId: string, newName: string) => {
    if (!newName.trim()) return;
    updateProduct.mutate({
      productId,
      classNumber,
      updates: { name_es: newName.trim() },
    });
    setEditingProductId(null);
  };

  const handleDeleteProduct = (product: NiceProduct) => {
    if (confirm(`¿Eliminar "${product.name_es}"?`)) {
      deleteProduct.mutate({
        productId: product.id,
        classNumber,
        hardDelete: true,
      });
    }
  };

  const filteredProducts = products?.filter(p => showInactive || p.is_active);

  if (classLoading) {
    return (
      <CardContent className="p-6">
        <Skeleton className="h-20 mb-4" />
        <Skeleton className="h-[400px]" />
      </CardContent>
    );
  }

  if (!classInfo) {
    return (
      <CardContent className="flex items-center justify-center h-[650px] text-muted-foreground">
        Clase no encontrada
      </CardContent>
    );
  }

  return (
    <>
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{classInfo.icon || '📦'}</span>
            <div>
              <CardTitle className="text-xl">
                Clase {classNumber}: {classInfo.title_es}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{classInfo.title_en}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={classInfo.class_type === 'product' ? 'default' : 'secondary'}>
              {classInfo.class_type === 'product' ? 'Productos' : 'Servicios'}
            </Badge>
            {classInfo.version_id && (
              <Badge variant="outline">v{classInfo.version_id}</Badge>
            )}
          </div>
        </div>

        {/* Review status */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm">
            {classInfo.last_reviewed_at ? (
              <span className={needsReview(classInfo.last_reviewed_at) ? 'text-amber-600' : 'text-green-600'}>
                Última revisión: {formatDate(classInfo.last_reviewed_at)}
              </span>
            ) : (
              <span className="text-destructive">Nunca revisada</span>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={() => markReviewed.mutate(classNumber)}
            disabled={markReviewed.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar como revisada
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">
              Productos ({filteredProducts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Add product */}
            <div className="flex gap-2">
              <Input
                placeholder="Añadir nuevo producto/servicio..."
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
              />
              <Button 
                onClick={handleAddProduct} 
                disabled={!newProductName.trim() || addProduct.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir
              </Button>
            </div>

            {/* Toggle inactive */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowInactive(!showInactive)}
              >
                {showInactive ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
              </Button>
            </div>

            {/* Products list */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {productsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-10" />
                  ))
                ) : filteredProducts?.length ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded hover:bg-muted/50 group",
                        !product.is_active && "opacity-50"
                      )}
                    >
                      {/* Star toggle */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleToggleCommon(product)}
                        title={product.is_common ? 'Quitar de frecuentes' : 'Marcar como frecuente'}
                      >
                        <Star 
                          className={cn(
                            "h-4 w-4",
                            product.is_common 
                              ? "text-warning fill-warning" 
                              : "text-muted-foreground"
                          )} 
                        />
                      </Button>

                      {/* Product name */}
                      <div className="flex-1 min-w-0">
                        {editingProductId === product.id ? (
                          <Input
                            defaultValue={product.name_es}
                            autoFocus
                            className="h-8"
                            onBlur={(e) => handleUpdateProductName(product.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateProductName(product.id, e.currentTarget.value);
                              }
                              if (e.key === 'Escape') {
                                setEditingProductId(null);
                              }
                            }}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span 
                              className="cursor-pointer hover:underline truncate"
                              onClick={() => setEditingProductId(product.id)}
                            >
                              {product.name_es}
                            </span>
                            {product.name_en && (
                              <span className="text-xs text-muted-foreground truncate">
                                ({product.name_en})
                              </span>
                            )}
                            {product.wipo_code && (
                              <Badge variant="outline" className="text-[10px] h-5">
                                {product.wipo_code}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingProductId(product.id)}
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleActive(product)}
                          title={product.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {product.is_active ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(product)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay productos definidos para esta clase
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[450px]">
              <div className="space-y-2">
                {revisionLog?.length ? (
                  revisionLog.map((log: any) => (
                    <div 
                      key={log.id} 
                      className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {log.action === 'reviewed' && '✅ Marcada como revisada'}
                          {log.action === 'product_added' && `➕ Producto añadido: ${log.details?.name || ''}`}
                          {log.action === 'product_removed' && '➖ Producto eliminado'}
                          {log.action === 'product_updated' && '✏️ Producto actualizado'}
                          {log.action === 'class_updated' && '📝 Clase actualizada'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {log.performer?.full_name || log.performer?.email || 'Sistema'} • {formatDate(log.performed_at)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Sin historial de revisiones
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}
