import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoipTransferTargets } from '@/hooks/useVoipTransferTargets';

type TransferType = 'mobile' | 'user' | 'external';

export interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (number: string) => void;
  userMobile?: string | null;
}

export function TransferModal({ isOpen, onClose, onTransfer, userMobile }: TransferModalProps) {
  const [transferType, setTransferType] = useState<TransferType>(userMobile ? 'mobile' : 'user');
  const [targetNumber, setTargetNumber] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { data: users } = useVoipTransferTargets();

  const selectedUserPhone = useMemo(() => {
    const u = (users ?? []).find((x) => x.user_id === selectedUserId);
    return u?.phone ?? '';
  }, [selectedUserId, users]);

  const canTransfer = useMemo(() => {
    if (transferType === 'mobile') return !!userMobile;
    if (transferType === 'user') return !!selectedUserPhone;
    return !!targetNumber.trim();
  }, [selectedUserPhone, targetNumber, transferType, userMobile]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir llamada</DialogTitle>
          <DialogDescription>Elige el destino de la transferencia.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <Label>Destino</Label>
            <RadioGroup value={transferType} onValueChange={(v) => setTransferType(v as TransferType)}>
              {userMobile && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mobile" id="transfer-mobile" />
                  <Label htmlFor="transfer-mobile">Mi móvil ({userMobile})</Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="transfer-user" />
                <Label htmlFor="transfer-user">Otro usuario</Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="external" id="transfer-external" />
                <Label htmlFor="transfer-external">Número externo</Label>
              </div>
            </RadioGroup>
          </div>

          {transferType === 'user' && (
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario…" />
                </SelectTrigger>
                <SelectContent>
                  {(users ?? [])
                    .filter((u) => !!u.phone)
                    .map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {(u.full_name ?? 'Usuario')} · {u.phone}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {transferType === 'external' && (
            <div className="space-y-2">
              <Label>Número</Label>
              <Input value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} placeholder="+34 612 345 678" />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const number =
                  transferType === 'mobile'
                    ? (userMobile ?? '')
                    : transferType === 'user'
                      ? selectedUserPhone
                      : targetNumber;
                if (number) onTransfer(number);
              }}
              disabled={!canTransfer}
            >
              Transferir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
