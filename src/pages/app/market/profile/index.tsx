import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Shield, 
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Building2,
  Globe,
  Mail,
  Phone,
  FileText,
  Award
} from 'lucide-react';
import { useMarketProfile, useUpdateMarketProfile } from '@/hooks/use-market';
import { KYC_LEVEL_CONFIG, type KycLevel } from '@/types/market.types';

export default function ProfilePage() {
  const { data: profile, isLoading } = useMarketProfile();
  const updateProfile = useUpdateMarketProfile();
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const kycLevel = (profile?.kyc_level || 'none') as KycLevel;
  const kycConfig = KYC_LEVEL_CONFIG[kycLevel];
  const kycProgress = {
    none: 0,
    basic: 25,
    verified: 50,
    enhanced: 75,
    institutional: 100,
  }[kycLevel] || 0;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile?.display_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{profile?.display_name || 'Usuario'}</h2>
                <p className="text-muted-foreground">
                  {profile?.company_name || 'Sin empresa configurada'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    {kycConfig?.name || 'Sin verificar'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{profile?.total_transactions || 0}</p>
                <p className="text-xs text-muted-foreground">Transacciones</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Compras</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  -
                </p>
                <p className="text-xs text-muted-foreground">0 reviews</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">€0K</p>
                <p className="text-xs text-muted-foreground">Volumen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado de Verificación (KYC)
          </CardTitle>
          <CardDescription>
            Mayor nivel de verificación = Mayor confianza y límites de transacción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Nivel actual: {kycConfig?.name}</span>
              <span className="text-sm text-muted-foreground">
                Límite: €{kycConfig?.transactionLimit?.toLocaleString() || '∞'}
              </span>
            </div>
            <Progress value={kycProgress} className="h-2" />
            <div className="grid grid-cols-5 gap-2 text-xs text-center">
              {Object.entries(KYC_LEVEL_CONFIG).map(([level, config]) => (
                <div 
                  key={level}
                  className={`p-2 rounded ${
                    level === kycLevel 
                      ? 'bg-primary/10 border border-primary' 
                      : 'bg-muted'
                  }`}
                >
                  {config.name}
                </div>
              ))}
            </div>
            {kycLevel !== 'institutional' as any && (
              <Button className="w-full mt-4">
                <Upload className="h-4 w-4 mr-2" />
                Subir de Nivel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileForm profile={profile} onUpdate={updateProfile.mutate} />
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <CompanyForm profile={profile} onUpdate={updateProfile.mutate} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <ReviewsSection profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileForm({ profile, onUpdate }: { profile: any; onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || '',
    preferred_contact: profile?.preferred_contact || 'email',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nombre público</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Cuéntanos sobre ti y tu experiencia en PI..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
          <Button type="submit">Guardar Cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CompanyForm({ profile, onUpdate }: { profile: any; onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    company_name: profile?.company_name || '',
    company_type: profile?.company_type || '',
    tax_id: profile?.tax_id || '',
    company_address: profile?.company_address || {},
    specializations: profile?.specializations || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Empresa</CardTitle>
        <CardDescription>
          Requerido para transacciones B2B y niveles de KYC avanzados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la empresa</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_id">NIF/CIF</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_type">Tipo de empresa</Label>
            <Input
              id="company_type"
              value={formData.company_type}
              onChange={(e) => setFormData({ ...formData, company_type: e.target.value })}
              placeholder="Ej: Despacho de abogados, Consultora PI, Startup..."
            />
          </div>
          <Button type="submit">Guardar Cambios</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReviewsSection({ profile }: { profile: any }) {
  // TODO: Fetch actual reviews
  const reviews: any[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews Recibidas</CardTitle>
        <CardDescription>
          {profile?.rating_count || 0} valoraciones · Puntuación media: {profile?.rating_average?.toFixed(1) || '-'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aún no tienes reviews</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
