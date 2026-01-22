import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Key, Loader2 } from 'lucide-react';
import { AIProvider, AIProviderFormData } from '@/types/ai-brain.types';

const PROVIDER_PRESETS: Array<{ label: string; name: string; code: string; base_url?: string }> = [
  { label: 'OpenAI', name: 'OpenAI', code: 'openai', base_url: 'https://api.openai.com/v1' },
  { label: 'Gemini (Google)', name: 'Gemini', code: 'gemini' },
  { label: 'Claude (Anthropic)', name: 'Anthropic', code: 'anthropic', base_url: 'https://api.anthropic.com' },
  { label: 'Grok (xAI)', name: 'xAI', code: 'grok', base_url: 'https://api.x.ai/v1' },
  { label: 'Meta (Llama)', name: 'Meta', code: 'meta' },
  { label: 'DeepSeek', name: 'DeepSeek', code: 'deepseek', base_url: 'https://api.deepseek.com/v1' },
  { label: 'Qwen (Alibaba)', name: 'Qwen', code: 'qwen', base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { label: 'Mistral', name: 'Mistral', code: 'mistral', base_url: 'https://api.mistral.ai/v1' },
  { label: 'Perplexity', name: 'Perplexity', code: 'perplexity', base_url: 'https://api.perplexity.ai' },
  { label: 'Kimi (Moonshot)', name: 'Kimi', code: 'kimi', base_url: 'https://api.moonshot.cn/v1' },
];

interface ProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: AIProvider | null;
  onSave: (data: AIProviderFormData) => void;
  isSaving: boolean;
}

export function ProviderDialog({ 
  open, 
  onOpenChange, 
  provider, 
  onSave, 
  isSaving 
}: ProviderDialogProps) {
  const [form, setForm] = useState<AIProviderFormData>({
    name: '',
    code: '',
    api_key: '',
    base_url: '',
    is_gateway: false,
    status: 'active'
  });

  useEffect(() => {
    if (provider) {
      setForm({
        name: provider.name,
        code: provider.code,
        api_key: '',
        base_url: provider.base_url || '',
        is_gateway: provider.is_gateway,
        status: provider.status
      });
    } else {
      setForm({
        name: '',
        code: '',
        api_key: '',
        base_url: '',
        is_gateway: false,
        status: 'active'
      });
    }
  }, [provider, open]);

  const handleSubmit = () => {
    onSave(form);
  };

  const applyPreset = (presetCode: string) => {
    const preset = PROVIDER_PRESETS.find((p) => p.code === presetCode);
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      name: preset.name,
      code: preset.code,
      base_url: preset.base_url || '',
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle>{provider ? 'Editar Provider' : 'Nuevo Provider'}</DialogTitle>
          <DialogDescription>
            Configura los datos del proveedor de IA
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!provider && (
            <div className="space-y-2">
              <Label>Plantilla (opcional)</Label>
              <Select onValueChange={applyPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un provider…" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {PROVIDER_PRESETS.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Nombre</Label>
              <Input
                id="provider-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ej: Anthropic, OpenAI..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-code">Código</Label>
              <Input
                id="provider-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })}
                placeholder="ej: anthropic, openai..."
                disabled={!!provider}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key {provider && '(dejar vacío para mantener)'}</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="api-key"
                type="password"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                placeholder="sk-..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="base-url">Base URL (opcional)</Label>
            <Input
              id="base-url"
              value={form.base_url}
              onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              placeholder="https://api.example.com"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Es Gateway</Label>
              <p className="text-xs text-muted-foreground">
                Un gateway enruta a múltiples providers
              </p>
            </div>
            <Switch
              checked={form.is_gateway}
              onCheckedChange={(checked) => setForm({ ...form, is_gateway: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select 
              value={form.status} 
              onValueChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' | 'error' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving || !form.name || !form.code}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
