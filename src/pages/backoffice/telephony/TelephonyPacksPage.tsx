// ============================================================
// IP-NEXUS BACKOFFICE - Telephony Packs Management
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Package, 
  TrendingUp,
  ShoppingCart,
  Euro,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  useTelephonyPacks, 
  useCreateTelephonyPack, 
  useUpdateTelephonyPack, 
  useDeleteTelephonyPack,
  type TelephonyPack 
} from '@/hooks/useTelephonyPacks';
import { 
  PackCard, 
  PackFormModal, 
  PackProfitabilityAnalysis,
  type PackFormData 
} from '@/components/backoffice/telephony';
import { StatCard } from '@/components/ui/charts';

export default function TelephonyPacksPage() {
  const { data: packs, isLoading } = useTelephonyPacks();
  const createPack = useCreateTelephonyPack();
  const updatePack = useUpdateTelephonyPack();
  const deletePack = useDeleteTelephonyPack();

  const [showModal, setShowModal] = useState(false);
  const [editingPack, setEditingPack] = useState<TelephonyPack | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('packs');

  // Simulated sales data (in production, fetch from DB)
  const salesData: Record<string, number> = {
    'PACK_STARTER': 3,
    'PACK_BASIC': 8,
    'PACK_STANDARD': 12,
    'PACK_PROFESSIONAL': 5,
    'PACK_ENTERPRISE': 2,
    'PACK_UNLIMITED': 1,
  };

  // Calculate metrics
  const activePacks = packs?.filter(p => p.is_active).length || 0;
  const totalSales = Object.values(salesData).reduce((sum, v) => sum + v, 0);
  const totalRevenue = packs?.reduce((sum, p) => {
    const sales = salesData[p.code] || 0;
    return sum + (sales * Number(p.price));
  }, 0) || 0;
  const estimatedMargin = totalRevenue * 0.73; // ~73% average margin

  const openCreateModal = () => {
    setEditingPack(null);
    setShowModal(true);
  };

  const openEditModal = (pack: TelephonyPack) => {
    setEditingPack(pack);
    setShowModal(true);
  };

  const handleDuplicate = (pack: TelephonyPack) => {
    // Create a copy with modified code/name
    const duplicated: TelephonyPack = {
      ...pack,
      id: '', // Will be generated
      code: `${pack.code}_COPY`,
      name: `${pack.name} (Copia)`,
      is_active: false,
      is_featured: false,
      created_at: new Date().toISOString(),
    };
    setEditingPack(duplicated);
    setShowModal(true);
  };

  const handleSubmit = async (data: PackFormData) => {
    if (editingPack?.id) {
      await updatePack.mutateAsync({ id: editingPack.id, ...data });
    } else {
      await createPack.mutateAsync(data);
    }
    setShowModal(false);
    setEditingPack(null);
  };

  const handleToggleActive = async (pack: TelephonyPack, isActive: boolean) => {
    await updatePack.mutateAsync({ id: pack.id, is_active: isActive });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deletePack.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/backoffice/telephony">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Packs de Minutos</h1>
            <p className="text-muted-foreground">
              Gestiona los packs disponibles para tenants
            </p>
          </div>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Pack
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Packs activos"
          value={activePacks}
          icon={Package}
          color="#3B82F6"
        />
        <StatCard
          title="Vendidos este mes"
          value={totalSales}
          icon={ShoppingCart}
          color="#10B981"
        />
        <StatCard
          title="Ingresos este mes"
          value={formatCurrency(totalRevenue)}
          isFormatted
          icon={Euro}
          color="#F59E0B"
        />
        <StatCard
          title="Margen estimado"
          value={formatCurrency(estimatedMargin)}
          isFormatted
          subtitle="~73%"
          icon={TrendingUp}
          color="#8B5CF6"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="packs" className="gap-2">
            <Package className="h-4 w-4" />
            Packs
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis de Rentabilidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packs" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : packs && packs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packs.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  salesCount={salesData[pack.code]}
                  onEdit={() => openEditModal(pack)}
                  onDuplicate={() => handleDuplicate(pack)}
                  onToggleActive={(isActive) => handleToggleActive(pack, isActive)}
                  onDelete={() => setDeleteId(pack.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay packs creados</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crea tu primer pack de minutos para que los tenants puedan comprar
                </p>
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer pack
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          {packs && packs.length > 0 ? (
            <PackProfitabilityAnalysis packs={packs} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin datos para analizar</h3>
                <p className="text-muted-foreground text-center">
                  Crea packs primero para ver el análisis de rentabilidad
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <PackFormModal
        open={showModal}
        onOpenChange={setShowModal}
        editingPack={editingPack}
        onSubmit={handleSubmit}
        isLoading={createPack.isPending || updatePack.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pack?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pack será eliminado permanentemente.
              Los tenants que tengan minutos de este pack podrán seguir usándolos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
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
