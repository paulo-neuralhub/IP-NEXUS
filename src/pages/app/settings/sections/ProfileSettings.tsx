// src/pages/app/settings/sections/ProfileSettings.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, User } from 'lucide-react';

export default function ProfileSettings() {
  const { user, profile } = useAuth();
  const { data: settings, isLoading } = useUserSettings();
  const updateMutation = useUpdateUserSettings();

  const [formData, setFormData] = useState({
    display_name: '',
    job_title: '',
    department: '',
    bio: '',
    phone: '',
    linkedin: '',
  });

  useEffect(() => {
    if (settings?.profile) {
      setFormData({
        display_name: settings.profile.display_name || profile?.full_name || '',
        job_title: settings.profile.job_title || '',
        department: settings.profile.department || '',
        bio: settings.profile.bio || '',
        phone: settings.profile.phone || '',
        linkedin: settings.profile.linkedin || '',
      });
    } else if (profile) {
      setFormData(prev => ({
        ...prev,
        display_name: profile.full_name || '',
      }));
    }
  }, [settings, profile]);

  const handleSave = () => {
    updateMutation.mutate({
      category: 'profile',
      updates: formData,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Tu información personal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getInitials(formData.display_name || user?.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">
              Cambiar Avatar
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG o GIF. Máximo 2MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nombre</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Cargo</Label>
            <Input
              id="job_title"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              placeholder="Ej: Abogado Senior"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departamento</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Ej: Marcas y Patentes"
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Contacta con el administrador para cambiar tu email
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+34 600 123 456"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/tu-perfil"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Cuéntanos sobre ti..."
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
