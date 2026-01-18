import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  WATCHLIST_TYPES, 
  NICE_CLASSES_LABELS 
} from '@/lib/constants/spider';
import { JURISDICTIONS } from '@/lib/constants/matters';
import { useCreateWatchlist, useUpdateWatchlist } from '@/hooks/use-spider';
import { useMatters } from '@/hooks/use-matters';
import type { Watchlist, WatchlistType, NotifyFrequency, RunFrequency } from '@/types/spider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ArrowLeft, Stamp, Lightbulb, Globe, Search, Share2, ShoppingBag, X, Plus } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Stamp, Lightbulb, Globe, Search, Share2, ShoppingBag
};

interface Props {
  watchlist?: Watchlist;
}

export function WatchlistForm({ watchlist }: Props) {
  const navigate = useNavigate();
  const createMutation = useCreateWatchlist();
  const updateMutation = useUpdateWatchlist();
  const { data: matters } = useMatters();
  
  const [formData, setFormData] = useState({
    name: watchlist?.name || '',
    description: watchlist?.description || '',
    type: (watchlist?.type || '') as WatchlistType,
    watch_terms: watchlist?.watch_terms || [],
    watch_classes: watchlist?.watch_classes || [],
    watch_jurisdictions: watchlist?.watch_jurisdictions || [],
    matter_id: watchlist?.matter_id || '',
    similarity_threshold: watchlist?.similarity_threshold || 70,
    notify_email: watchlist?.notify_email ?? true,
    notify_in_app: watchlist?.notify_in_app ?? true,
    notify_frequency: watchlist?.notify_frequency || 'daily',
    run_frequency: watchlist?.run_frequency || 'daily',
  });
  
  const [newTerm, setNewTerm] = useState('');
  
  // Auto-fill from linked matter
  useEffect(() => {
    if (formData.matter_id) {
      const matter = matters?.find(m => m.id === formData.matter_id);
      if (matter) {
        setFormData(prev => ({
          ...prev,
          name: prev.name || `Vigilancia ${matter.reference}`,
          watch_terms: prev.watch_terms.length ? prev.watch_terms : 
            [matter.mark_name || matter.title].filter(Boolean) as string[],
          watch_classes: prev.watch_classes.length ? prev.watch_classes :
            matter.nice_classes || [],
          watch_jurisdictions: prev.watch_jurisdictions.length ? prev.watch_jurisdictions :
            [matter.jurisdiction_code].filter(Boolean) as string[],
        }));
      }
    }
  }, [formData.matter_id, matters]);
  
  const addTerm = () => {
    if (newTerm.trim() && !formData.watch_terms.includes(newTerm.trim())) {
      setFormData(prev => ({
        ...prev,
        watch_terms: [...prev.watch_terms, newTerm.trim()]
      }));
      setNewTerm('');
    }
  };
  
  const removeTerm = (term: string) => {
    setFormData(prev => ({
      ...prev,
      watch_terms: prev.watch_terms.filter(t => t !== term)
    }));
  };
  
  const toggleClass = (classNum: number) => {
    setFormData(prev => ({
      ...prev,
      watch_classes: prev.watch_classes.includes(classNum)
        ? prev.watch_classes.filter(c => c !== classNum)
        : [...prev.watch_classes, classNum].sort((a, b) => a - b)
    }));
  };
  
  const toggleJurisdiction = (code: string) => {
    setFormData(prev => ({
      ...prev,
      watch_jurisdictions: prev.watch_jurisdictions.includes(code)
        ? prev.watch_jurisdictions.filter(j => j !== code)
        : [...prev.watch_jurisdictions, code]
    }));
  };
  
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.type) {
      toast.error('Selecciona un tipo de vigilancia');
      return;
    }
    if (formData.watch_terms.length === 0) {
      toast.error('Añade al menos un término a vigilar');
      return;
    }
    
    try {
      if (watchlist) {
        await updateMutation.mutateAsync({ id: watchlist.id, data: formData });
        toast.success('Vigilancia actualizada');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Vigilancia creada');
      }
      navigate('/app/spider');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            {watchlist ? 'Editar vigilancia' : 'Nueva vigilancia'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Configura qué quieres monitorizar
          </p>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {watchlist ? 'Guardar' : 'Crear vigilancia'}
        </Button>
      </div>

      {/* Type Selection */}
      <section className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Tipo de vigilancia
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(WATCHLIST_TYPES).map(([key, config]) => {
            const Icon = TYPE_ICONS[config.icon] || Search;
            const isSelected = formData.type === key;
            
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: key as WatchlistType }))}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <Icon className={cn(
                  "w-8 h-8 mb-2",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <h3 className="font-medium text-foreground">{config.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              </button>
            );
          })}
        </div>
      </section>
      
      {/* Basic Config */}
      <section className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Configuración
        </h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Nombre de la vigilancia *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Vigilancia marca IP-NEXUS"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Descripción (opcional)
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción de esta vigilancia..."
            rows={2}
          />
        </div>
        
        {/* Terms */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Términos a vigilar *
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.watch_terms.map(term => (
              <span 
                key={term}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {term}
                <button
                  type="button"
                  onClick={() => removeTerm(term)}
                  className="hover:text-primary/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm())}
              placeholder="Añadir término..."
              className="flex-1"
            />
            <Button type="button" onClick={addTerm} variant="secondary">
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          </div>
        </div>
      </section>
      
      {/* Nice Classes (only for trademarks) */}
      {formData.type === 'trademark' && (
        <section className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Clases Niza a vigilar
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
            {Array.from({ length: 45 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                type="button"
                onClick={() => toggleClass(num)}
                className={cn(
                  "p-2 text-sm rounded-lg border transition-colors text-left",
                  formData.watch_classes.includes(num)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <span className="font-medium">{num}</span>
                <span className="text-xs text-muted-foreground block truncate">
                  {NICE_CLASSES_LABELS[num]?.substring(0, 15)}...
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Seleccionadas: {formData.watch_classes.length} clases
          </p>
        </section>
      )}
      
      {/* Jurisdictions */}
      {['trademark', 'patent'].includes(formData.type) && (
        <section className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Jurisdicciones
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {JURISDICTIONS.map(({ code, name }) => (
              <label
                key={code}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                  formData.watch_jurisdictions.includes(code)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <input
                  type="checkbox"
                  checked={formData.watch_jurisdictions.includes(code)}
                  onChange={() => toggleJurisdiction(code)}
                  className="rounded border-muted text-primary"
                />
                <span className="text-sm">{name}</span>
              </label>
            ))}
          </div>
        </section>
      )}
      
      {/* Similarity Threshold */}
      <section className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Umbral de similitud
        </h2>
        <div className="p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Similitud mínima</span>
            <span className="text-lg font-semibold text-primary">
              {formData.similarity_threshold}%
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="95"
            step="5"
            value={formData.similarity_threshold}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              similarity_threshold: parseInt(e.target.value) 
            }))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>30% (más alertas)</span>
            <span>95% (solo exactos)</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {formData.similarity_threshold >= 80 && 
              "Solo recibirás alertas de similitud crítica (posibles copias exactas)"}
            {formData.similarity_threshold >= 60 && formData.similarity_threshold < 80 && 
              "Recibirás alertas de similitud alta y crítica (recomendado)"}
            {formData.similarity_threshold < 60 && 
              "Recibirás muchas alertas, incluyendo similitudes bajas (puede haber falsos positivos)"}
          </p>
        </div>
      </section>
      
      {/* Notifications */}
      <section className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Notificaciones
        </h2>
        
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.notify_email}
              onChange={(e) => setFormData(prev => ({ ...prev, notify_email: e.target.checked }))}
              className="rounded border-muted text-primary"
            />
            <span className="text-sm">Email</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.notify_in_app}
              onChange={(e) => setFormData(prev => ({ ...prev, notify_in_app: e.target.checked }))}
              className="rounded border-muted text-primary"
            />
            <span className="text-sm">In-app</span>
          </label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Frecuencia de notificación</label>
            <select
              value={formData.notify_frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, notify_frequency: e.target.value as NotifyFrequency }))}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
            >
              <option value="instant">Instantánea</option>
              <option value="daily">Resumen diario</option>
              <option value="weekly">Resumen semanal</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Frecuencia de escaneo</label>
            <select
              value={formData.run_frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, run_frequency: e.target.value as RunFrequency }))}
              className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
            >
              <option value="hourly">Cada hora</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        </div>
      </section>
      
      {/* Link Matter */}
      <section className="bg-card rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Vincular a expediente (opcional)
        </h2>
        <select
          value={formData.matter_id}
          onChange={(e) => setFormData(prev => ({ ...prev, matter_id: e.target.value }))}
          className="w-full border border-input rounded-lg px-3 py-2 bg-background text-sm"
        >
          <option value="">Sin vincular</option>
          {matters?.map(m => (
            <option key={m.id} value={m.id}>
              {m.reference} - {m.title}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground mt-2">
          Al vincular, los resultados aparecerán en la ficha del expediente
        </p>
      </section>
      
      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {watchlist ? 'Guardar cambios' : 'Crear vigilancia'}
        </Button>
      </div>
    </div>
  );
}
