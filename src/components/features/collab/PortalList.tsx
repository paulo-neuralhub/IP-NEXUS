import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  MoreVertical,
  Users,
  ExternalLink,
  Settings,
  Trash2,
  Globe,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  LogIn,
} from 'lucide-react';
import { useClientPortals, useDeletePortal, useUpdatePortal } from '@/hooks/collab';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CreatePortalDialog from './CreatePortalDialog';
import ClientPreviewModal from './ClientPreviewModal';

export default function PortalList() {
  const { data: portals = [], isLoading } = useClientPortals();
  const deletePortal = useDeletePortal();
  const updatePortal = useUpdatePortal();
  
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [portalToDelete, setPortalToDelete] = useState<string | null>(null);
  const [previewPortal, setPreviewPortal] = useState<any>(null);
  
  const filteredPortals = portals.filter(portal => {
    const searchLower = search.toLowerCase();
    return (
      portal.portal_name?.toLowerCase().includes(searchLower) ||
      (portal.client as any)?.name?.toLowerCase().includes(searchLower) ||
      (portal.client as any)?.company_name?.toLowerCase().includes(searchLower)
    );
  });
  
  const handleToggleActive = (id: string, isActive: boolean) => {
    updatePortal.mutate({
      id,
      is_active: !isActive,
      ...(isActive ? { deactivated_at: new Date().toISOString() } : { activated_at: new Date().toISOString() })
    });
  };
  
  const handleDelete = () => {
    if (portalToDelete) {
      deletePortal.mutate(portalToDelete);
      setPortalToDelete(null);
    }
  };

  const activeCount = portals.filter(p => p.is_active).length;

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header — SILK */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: '#0a2540' }}
          >
            Portales de Cliente
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            Gestiona los portales de colaboración con tus clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Active count — neumorphic badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{
              background: '#f1f4f9',
              boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
            }}
          >
            <span
              className="text-lg font-extrabold"
              style={{ color: '#00b4d8', letterSpacing: '-0.02em' }}
            >
              {activeCount}
            </span>
            <span
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: '#94a3b8' }}
            >
              activos
            </span>
          </div>
          {/* New portal — gradient */}
          <button
            onClick={() => setShowCreateDialog(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
              boxShadow: '0 3px 12px rgba(0, 180, 216, 0.15)',
            }}
          >
            <Plus className="w-4 h-4" />
            Nuevo Portal
            <span
              className="absolute bottom-0 left-[22%] right-[22%] h-[2px] rounded-full"
              style={{ background: 'rgba(255,255,255,0.4)' }}
            />
          </button>
        </div>
      </div>

      {/* Search — SILK */}
      <div className="relative max-w-md mb-5">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: '#94a3b8' }}
        />
        <input
          type="text"
          placeholder="Buscar por nombre o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{
            background: '#f1f4f9',
            border: '1px solid rgba(0,0,0,0.06)',
            color: '#334155',
          }}
          onFocus={(e) => (e.target.style.border = '1px solid rgba(0, 180, 216, 0.3)')}
          onBlur={(e) => (e.target.style.border = '1px solid rgba(0,0,0,0.06)')}
        />
      </div>

      {/* Portal Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[14px] p-5 animate-pulse"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl" style={{ background: '#e8ecf3' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded w-3/4" style={{ background: '#e8ecf3' }} />
                  <div className="h-3 rounded w-1/2" style={{ background: '#e8ecf3' }} />
                </div>
              </div>
              <div className="h-16 rounded-lg" style={{ background: '#e8ecf3' }} />
            </div>
          ))}
        </div>
      ) : filteredPortals.length === 0 ? (
        /* Empty state — SILK */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: '#f1f4f9',
              boxShadow: '4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff',
            }}
          >
            <Globe className="w-7 h-7" style={{ color: '#00b4d8' }} />
          </div>
          <h3 className="text-base font-bold mb-1" style={{ color: '#0a2540' }}>
            {search ? 'Sin resultados' : 'Sin portales de cliente'}
          </h3>
          <p className="text-sm mb-4" style={{ color: '#64748b', maxWidth: 320 }}>
            {search
              ? 'No se encontraron portales con ese criterio'
              : 'Crea un portal para que tus clientes puedan seguir sus expedientes, documentos y comunicaciones'}
          </p>
          {!search && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
                boxShadow: '0 3px 12px rgba(0, 180, 216, 0.15)',
              }}
            >
              <Plus className="w-4 h-4" />
              Crear primer portal
              <span
                className="absolute bottom-0 left-[22%] right-[22%] h-[2px] rounded-full"
                style={{ background: 'rgba(255,255,255,0.4)' }}
              />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPortals.map((portal) => {
            const portalName = portal.portal_name || 'Portal sin nombre';
            const clientName = (portal.client as any)?.name || 'Sin cliente';
            const clientCompany = (portal.client as any)?.company_name || '';
            const usersCount = (portal.users as any)?.[0]?.count || 0;
            const lastAccess = portal.last_accessed_at
              ? format(new Date(portal.last_accessed_at), 'dd MMM', { locale: es })
              : 'Nunca';

            return (
              <div
                key={portal.id}
                className="rounded-[14px] p-5 transition-all hover:scale-[1.005]"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  opacity: portal.is_active ? 1 : 0.6,
                }}
              >
                {/* Row 1: Name + Status + Menu */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{
                        background: portal.is_active
                          ? 'linear-gradient(135deg, #00b4d8, #00d4aa)'
                          : 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
                      }}
                    >
                      {getInitials(portalName)}
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-sm font-bold truncate"
                        style={{ color: '#0a2540' }}
                      >
                        {portalName}
                      </h3>
                      <p className="text-xs truncate" style={{ color: '#64748b' }}>
                        {clientName}
                        {clientCompany ? ` · ${clientCompany}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status badge — neumorphic */}
                    <div
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        background: '#f1f4f9',
                        color: portal.is_active ? '#00b4d8' : '#94a3b8',
                        boxShadow: '2px 2px 5px #cdd1dc, -2px -2px 5px #ffffff',
                      }}
                    >
                      {portal.is_active ? '● Activo' : '● Inactivo'}
                    </div>
                    {/* Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                          <MoreVertical className="w-4 h-4" style={{ color: '#94a3b8' }} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/collab/${portal.id}`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`/portal/${portal.portal_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver Portal
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleActive(portal.id, portal.is_active)}>
                          {portal.is_active ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setPortalToDelete(portal.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Row 2: Metrics */}
                <div
                  className="grid grid-cols-3 gap-3 py-3 mb-3"
                  style={{
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  {[
                    { label: 'Usuarios', value: usersCount, icon: Users },
                    { label: 'Último acceso', value: lastAccess, icon: Clock },
                    { label: 'Total logins', value: portal.total_logins || 0, icon: LogIn },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <Icon className="w-3 h-3" style={{ color: '#94a3b8' }} />
                        <span
                          className="text-[10px] font-medium uppercase tracking-wider"
                          style={{ color: '#94a3b8' }}
                        >
                          {label}
                        </span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: '#0a2540', letterSpacing: '-0.02em' }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Row 3: Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/app/collab/${portal.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: '#f1f4f9',
                      color: '#334155',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Gestionar
                  </Link>
                  <button
                    onClick={() =>
                      setPreviewPortal({
                        id: portal.id,
                        portal_name: portalName,
                        client: { name: clientName, company_name: clientCompany },
                        is_active: portal.is_active,
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
                      boxShadow: '0 2px 8px rgba(0, 180, 216, 0.15)',
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver como cliente
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <CreatePortalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!portalToDelete} onOpenChange={() => setPortalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar portal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el portal y todos sus datos asociados (usuarios, aprobaciones, firmas, etc.).
              Esta acción no se puede deshacer.
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

      {/* Client Preview Modal */}
      <ClientPreviewModal
        portal={previewPortal}
        open={!!previewPortal}
        onClose={() => setPreviewPortal(null)}
      />
    </div>
  );
}
