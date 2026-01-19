import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, UserPlus, Mail } from 'lucide-react';
import { useInviteTeamMember } from '@/hooks/use-team';
import { toast } from 'sonner';

interface StepTeamInviteProps {
  organizationId: string;
}

interface Invite {
  email: string;
  role: string;
}

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Acceso completo' },
  { value: 'manager', label: 'Manager', description: 'Gestión de expedientes' },
  { value: 'member', label: 'Miembro', description: 'Acceso estándar' },
  { value: 'viewer', label: 'Solo lectura', description: 'Ver expedientes' },
];

export function StepTeamInvite({ organizationId }: StepTeamInviteProps) {
  const [invites, setInvites] = useState<Invite[]>([{ email: '', role: 'member' }]);
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  
  const inviteTeamMember = useInviteTeamMember();

  const addInvite = () => {
    if (invites.length < 10) {
      setInvites([...invites, { email: '', role: 'member' }]);
    }
  };

  const updateInvite = (index: number, field: keyof Invite, value: string) => {
    const updated = [...invites];
    updated[index] = { ...updated[index], [field]: value };
    setInvites(updated);
  };

  const removeInvite = (index: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter((_, i) => i !== index));
    }
  };

  const handleSendInvites = async () => {
    const validInvites = invites.filter(inv => inv.email.includes('@'));
    if (validInvites.length === 0) {
      toast.error('Introduce al menos un email válido');
      return;
    }

    setIsSending(true);
    let sent = 0;

    for (const invite of validInvites) {
      try {
        await inviteTeamMember.mutateAsync({
          email: invite.email,
          role: invite.role
        });
        sent++;
      } catch (error) {
        console.error('Error inviting:', invite.email, error);
      }
    }

    setSentCount(sent);
    setIsSending(false);
    
    if (sent > 0) {
      toast.success(`${sent} invitación${sent !== 1 ? 'es' : ''} enviada${sent !== 1 ? 's' : ''}`);
    }
  };

  if (sentCount > 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium">¡Invitaciones enviadas!</h3>
        <p className="text-muted-foreground mt-2">
          {sentCount} persona{sentCount !== 1 ? 's' : ''} recibirá{sentCount !== 1 ? 'n' : ''} un email con el enlace para unirse
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Invita a tu equipo</h2>
        <p className="text-muted-foreground text-sm">
          Colabora con tus compañeros en IP-NEXUS
        </p>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
        {invites.map((invite, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              type="email"
              placeholder="email@ejemplo.com"
              value={invite.email}
              onChange={(e) => updateInvite(index, 'email', e.target.value)}
              className="flex-1"
            />
            <Select
              value={invite.role}
              onValueChange={(v) => updateInvite(index, 'role', v)}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {invites.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeInvite(index)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={addInvite}
          disabled={invites.length >= 10}
          className="flex-1"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Añadir otro
        </Button>
        <Button
          onClick={handleSendInvites}
          disabled={isSending || !invites.some(inv => inv.email.includes('@'))}
          className="flex-1"
        >
          {isSending ? 'Enviando...' : 'Enviar invitaciones'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Recibirán un email con un enlace para unirse. También puedes saltar este paso y hacerlo después.
      </p>
    </div>
  );
}
