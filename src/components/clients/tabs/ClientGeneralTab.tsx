// =====================================================
// IP-NEXUS - CLIENT GENERAL TAB (PROMPT 28)
// Tab con datos generales del cliente - edición inline
// =====================================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  MapPin,
  Globe,
  Edit,
  Save,
  X,
  Phone,
  Shield,
  CreditCard,
  Mail,
} from 'lucide-react';
import { fromTable } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ClientGeneralTabProps {
  client: any;
  onUpdate: () => void;
}

export function ClientGeneralTab({ client, onUpdate }: ClientGeneralTabProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(client);
  const { toast } = useToast();

  // Sync formData when client changes
  useEffect(() => {
    setFormData(client);
  }, [client]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabaseClient: any = fromTable('crm_accounts');
      const { error } = await supabaseClient
        .update({
          name: formData.name,
          legal_name: formData.legal_name || null,
          trade_name: formData.trade_name || null,
          account_type: formData.account_type,
          status: formData.status,
          tier: formData.tier,
          tax_id: formData.tax_id || null,
          tax_id_type: formData.tax_id_type || 'CIF',
          tax_country: formData.tax_country || 'ES',
          address_line1: formData.address_line1 || null,
          address_line2: formData.address_line2 || null,
          city: formData.city || null,
          state_province: formData.state_province || null,
          postal_code: formData.postal_code || null,
          country: formData.country || 'ES',
          email: formData.email || null,
          phone: formData.phone || null,
          fax: formData.fax || null,
          website: formData.website || null,
          agent_license_number: formData.agent_license_number || null,
          agent_jurisdictions: formData.agent_jurisdictions || null,
          industry: formData.industry || null,
          notes: formData.notes || null,
          // Billing fields
          billing_email: formData.billing_email || null,
          payment_terms: formData.payment_terms ? parseInt(formData.payment_terms) : 30,
          credit_limit: formData.credit_limit || null,
          currency: formData.currency || 'EUR',
          updated_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      if (error) throw error;
      
      setEditing(false);
      toast({ title: 'Cliente actualizado' });
      onUpdate();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({ title: 'Error al guardar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const clientTypeLabels: Record<string, string> = {
    direct: 'Cliente Directo',
    agent: 'Agente de PI',
    law_firm: 'Despacho',
    corporation: 'Corporación',
  };

  const tierLabels: Record<string, { label: string; color: string }> = {
    basic: { label: 'Básico', color: 'bg-gray-100 text-gray-800' },
    standard: { label: 'Estándar', color: 'bg-blue-100 text-blue-800' },
    premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800' },
    enterprise: { label: 'Enterprise', color: 'bg-amber-100 text-amber-800' },
  };

  const currentTier = tierLabels[formData.tier || 'standard'] || tierLabels.standard;

  return (
    <div className="space-y-6">
      {/* Acciones */}
      <div className="flex justify-end gap-2">
        {editing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditing(false); setFormData(client); }}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos de la empresa */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4 text-primary" />
              Datos de la Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre comercial</Label>
                {editing ? (
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{client.name || '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Razón social</Label>
                {editing ? (
                  <Input
                    value={formData.legal_name || ''}
                    onChange={(e) => updateField('legal_name', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{client.legal_name || '—'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de cliente</Label>
                {editing ? (
                  <Select
                    value={formData.account_type || 'direct'}
                    onValueChange={(v) => updateField('account_type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Cliente Directo</SelectItem>
                      <SelectItem value="agent">Agente de PI</SelectItem>
                      <SelectItem value="law_firm">Despacho de Abogados</SelectItem>
                      <SelectItem value="corporation">Corporación</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">
                    {clientTypeLabels[client.account_type] || 'Cliente Directo'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>Nivel</Label>
                {editing ? (
                  <Select
                    value={formData.tier || 'standard'}
                    onValueChange={(v) => updateField('tier', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="standard">Estándar</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={currentTier.color}>
                    {currentTier.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Identificación Fiscal - sección destacada */}
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-3">Identificación Fiscal</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Tipo</Label>
                  {editing ? (
                    <Select
                      value={formData.tax_id_type || 'CIF'}
                      onValueChange={(v) => updateField('tax_id_type', v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="NIF">NIF</SelectItem>
                        <SelectItem value="NIE">NIE</SelectItem>
                        <SelectItem value="VAT">VAT</SelectItem>
                        <SelectItem value="EIN">EIN</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium">{client.tax_id_type || 'CIF'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Número</Label>
                  {editing ? (
                    <Input
                      value={formData.tax_id || ''}
                      onChange={(e) => updateField('tax_id', e.target.value)}
                      placeholder="B12345678"
                      className="h-9"
                    />
                  ) : (
                    <p className="text-sm font-medium font-mono">{client.tax_id || '—'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">País</Label>
                  {editing ? (
                    <Input
                      value={formData.tax_country || 'ES'}
                      onChange={(e) => updateField('tax_country', e.target.value.toUpperCase())}
                      maxLength={2}
                      className="h-9 w-16"
                    />
                  ) : (
                    <p className="text-sm font-medium">{client.tax_country || 'ES'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sector / Industria</Label>
              {editing ? (
                <Input
                  value={formData.industry || ''}
                  onChange={(e) => updateField('industry', e.target.value)}
                  placeholder="Tecnología, Alimentación, Moda..."
                />
              ) : (
                <p className="text-sm font-medium">{client.industry || '—'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-4 h-4 text-primary" />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dirección</Label>
              {editing ? (
                <>
                  <Input
                    value={formData.address_line1 || ''}
                    onChange={(e) => updateField('address_line1', e.target.value)}
                    placeholder="Calle, número"
                    className="mb-2"
                  />
                  <Input
                    value={formData.address_line2 || ''}
                    onChange={(e) => updateField('address_line2', e.target.value)}
                    placeholder="Piso, oficina (opcional)"
                  />
                </>
              ) : (
                <p className="text-sm font-medium">
                  {client.address_line1 || '—'}
                  {client.address_line2 && <><br />{client.address_line2}</>}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                {editing ? (
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{client.city || '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Provincia</Label>
                {editing ? (
                  <Input
                    value={formData.state_province || ''}
                    onChange={(e) => updateField('state_province', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{client.state_province || '—'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código postal</Label>
                {editing ? (
                  <Input
                    value={formData.postal_code || ''}
                    onChange={(e) => updateField('postal_code', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{client.postal_code || '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>País</Label>
                {editing ? (
                  <Input
                    value={formData.country || ''}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="ES"
                  />
                ) : (
                  <p className="text-sm font-medium">{client.country || '—'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="w-4 h-4 text-primary" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email principal</Label>
                {editing ? (
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                ) : (
                  <p className="text-sm">
                    {client.email ? (
                      <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                        {client.email}
                      </a>
                    ) : '—'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                {editing ? (
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                ) : (
                  <p className="text-sm">
                    {client.phone ? (
                      <a href={`tel:${client.phone}`} className="hover:underline">
                        {client.phone}
                      </a>
                    ) : '—'}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fax</Label>
                {editing ? (
                  <Input
                    value={formData.fax || ''}
                    onChange={(e) => updateField('fax', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{client.fax || '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Sitio web</Label>
                {editing ? (
                  <Input
                    value={formData.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://"
                  />
                ) : (
                  <p className="text-sm">
                    {client.website ? (
                      <a 
                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        {client.website}
                      </a>
                    ) : '—'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos de Agente (si aplica) */}
        {(client.account_type === 'agent' || client.account_type === 'law_firm' || editing) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-4 h-4 text-primary" />
                Datos de Representante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Número de colegiado / Licencia</Label>
                {editing ? (
                  <Input
                    value={formData.agent_license_number || ''}
                    onChange={(e) => updateField('agent_license_number', e.target.value)}
                    placeholder="Ej: API-12345"
                  />
                ) : (
                  <p className="text-sm font-medium">{client.agent_license_number || '—'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Jurisdicciones</Label>
                {editing ? (
                  <Input
                    value={formData.agent_jurisdictions?.join(', ') || ''}
                    onChange={(e) => updateField('agent_jurisdictions', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="ES, EU, WIPO, USPTO..."
                  />
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {client.agent_jurisdictions?.length > 0 ? (
                      client.agent_jurisdictions.map((j: string) => (
                        <Badge key={j} variant="secondary">{j}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facturación */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-primary" />
              Facturación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email de facturación</Label>
              {editing ? (
                <Input
                  type="email"
                  value={formData.billing_email || ''}
                  onChange={(e) => updateField('billing_email', e.target.value)}
                  placeholder="facturacion@empresa.com"
                />
              ) : (
                <p className="text-sm">
                  {client.billing_email ? (
                    <a href={`mailto:${client.billing_email}`} className="text-primary hover:underline flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {client.billing_email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Usa email principal</span>
                  )}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plazo de pago</Label>
                {editing ? (
                  <Select
                    value={String(formData.payment_terms || 30)}
                    onValueChange={(v) => updateField('payment_terms', parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Contado</SelectItem>
                      <SelectItem value="15">15 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="45">45 días</SelectItem>
                      <SelectItem value="60">60 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium">
                    {client.payment_terms === 0 ? 'Contado' : `${client.payment_terms || 30} días`}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Límite crédito</Label>
                {editing ? (
                  <Input
                    type="number"
                    value={formData.credit_limit || ''}
                    onChange={(e) => updateField('credit_limit', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0.00"
                  />
                ) : (
                  <p className="text-sm font-medium">
                    {client.credit_limit 
                      ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: client.currency || 'EUR' }).format(client.credit_limit)
                      : '—'
                    }
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Moneda</Label>
                {editing ? (
                  <Select
                    value={formData.currency || 'EUR'}
                    onValueChange={(v) => updateField('currency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CHF">CHF</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium">{client.currency || 'EUR'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notas - full width */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notas Internas</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              placeholder="Notas internas sobre este cliente..."
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {client.notes || 'Sin notas internas.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
