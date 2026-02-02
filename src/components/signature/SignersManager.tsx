// ============================================================
// IP-NEXUS - SIGNERS MANAGER
// PROMPT 22: Gestión de firmantes
// ============================================================

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignatureSigner } from '@/hooks/use-signature';
import { SIGNER_ROLES } from '@/hooks/use-signature';

interface SignersManagerProps {
  signers: SignatureSigner[];
  onSignersChange: (signers: SignatureSigner[]) => void;
  disabled?: boolean;
}

export function SignersManager({ signers, onSignersChange, disabled }: SignersManagerProps) {
  const addSigner = () => {
    const newId = `signer_${Date.now()}`;
    onSignersChange([
      ...signers,
      {
        id: newId,
        name: '',
        email: '',
        role: 'representative',
        order: signers.length + 1,
      },
    ]);
  };

  const removeSigner = (id: string) => {
    onSignersChange(signers.filter((s) => s.id !== id));
  };

  const updateSigner = (id: string, field: keyof SignatureSigner, value: unknown) => {
    onSignersChange(
      signers.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            Firmantes
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={addSigner}
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-1" />
            Añadir
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {signers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Añada al menos un firmante
          </p>
        )}

        {signers.map((signer, index) => (
          <div
            key={signer.id}
            className={cn(
              "flex gap-3 p-3 rounded-lg border bg-muted/30",
              disabled && "opacity-60 pointer-events-none"
            )}
          >
            <div className="flex items-center text-muted-foreground">
              <GripVertical className="h-4 w-4" />
              <span className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-full text-xs font-medium">
                {index + 1}
              </span>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Nombre</Label>
                <Input
                  placeholder="Nombre completo"
                  value={signer.name}
                  onChange={(e) => updateSigner(signer.id, 'name', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Email</Label>
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={signer.email}
                  onChange={(e) => updateSigner(signer.id, 'email', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Rol</Label>
                <Select
                  value={signer.role}
                  onValueChange={(v) => updateSigner(signer.id, 'role', v)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {signers.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeSigner(signer.id)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
