import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useStripeConfig, useSaveStripeConfig, useTestStripeConnection } from '@/hooks/backoffice';
import { toast } from 'sonner';

export default function StripeConfigPage() {
  const { data: config, isLoading } = useStripeConfig();
  const saveConfig = useSaveStripeConfig();
  const testConnection = useTestStripeConnection();

  const [mode, setMode] = useState<'test' | 'live'>('test');
  const [publishableKey, setPublishableKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const [defaultCurrency, setDefaultCurrency] = useState('EUR');
  const [trialDays, setTrialDays] = useState(14);
  const [taxRateId, setTaxRateId] = useState('');
  const [successUrl, setSuccessUrl] = useState('https://app.ip-nexus.com/subscription/success');
  const [cancelUrl, setCancelUrl] = useState('https://app.ip-nexus.com/subscription/cancel');

  // Load config values when data arrives
  useState(() => {
    if (config) {
      setMode(config.mode as 'test' | 'live');
      setPublishableKey(config.publishable_key || '');
      setDefaultCurrency(config.default_currency || 'EUR');
      setTrialDays(config.trial_days || 14);
      setTaxRateId(config.tax_rate_id || '');
      setSuccessUrl(config.success_url || '');
      setCancelUrl(config.cancel_url || '');
    }
  });

  const webhookUrl = config?.webhook_url || 'https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/stripe-webhook';

  const handleCopyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('URL copiada');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    saveConfig.mutate({
      mode,
      publishable_key: publishableKey,
      has_secret_key: !!secretKey || config?.has_secret_key,
      has_webhook_secret: !!webhookSecret || config?.has_webhook_secret,
      default_currency: defaultCurrency,
      trial_days: trialDays,
      tax_rate_id: taxRateId || null,
      success_url: successUrl,
      cancel_url: cancelUrl,
      is_configured: !!(publishableKey && (secretKey || config?.has_secret_key)),
    });

    // Note: In production, secret keys should be stored in Supabase secrets
    // This is a simplified version for the backoffice UI
    if (secretKey) {
      toast.info('Recuerda configurar STRIPE_SECRET_KEY en los secrets de Supabase');
    }
    if (webhookSecret) {
      toast.info('Recuerda configurar STRIPE_WEBHOOK_SECRET en los secrets de Supabase');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Configuración de Stripe</h1>
        <p className="text-muted-foreground">
          Configura las credenciales y opciones de pago
        </p>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Modo</CardTitle>
          <CardDescription>
            Selecciona el modo de operación de Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'test' | 'live')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="test" id="test" />
              <Label htmlFor="test">Test (pruebas)</Label>
              <Badge variant="secondary">🧪</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="live" id="live" />
              <Label htmlFor="live">Live (producción)</Label>
              <Badge>🔴</Badge>
            </div>
          </RadioGroup>
          {mode === 'live' && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                El modo Live procesará cobros reales. Asegúrate de que todo esté correctamente configurado.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>Credenciales</CardTitle>
          <CardDescription>
            Obtén estas claves desde el{' '}
            <a 
              href="https://dashboard.stripe.com/apikeys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Dashboard de Stripe <ExternalLink className="inline h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="publishableKey">Publishable Key *</Label>
            <Input
              id="publishableKey"
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder={mode === 'test' ? 'pk_test_...' : 'pk_live_...'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key *</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={config?.has_secret_key ? '••••••••••••••••' : (mode === 'test' ? 'sk_test_...' : 'sk_live_...')}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {config?.has_secret_key && (
              <p className="text-xs text-muted-foreground">
                Ya hay una clave configurada. Deja vacío para mantenerla.
              </p>
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={() => testConnection.mutate()}
            disabled={testConnection.isPending}
          >
            {testConnection.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verificar credenciales
          </Button>
        </CardContent>
      </Card>

      {/* Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook</CardTitle>
          <CardDescription>
            Configura el webhook en Stripe para recibir eventos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL (copiar a Stripe Dashboard)</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopyWebhookUrl}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret *</Label>
            <div className="relative">
              <Input
                id="webhookSecret"
                type={showWebhookSecret ? 'text' : 'password'}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder={config?.has_webhook_secret ? '••••••••••••••••' : 'whsec_...'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              >
                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eventos a escuchar:</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                'checkout.session.completed',
                'customer.subscription.created',
                'customer.subscription.updated',
                'customer.subscription.deleted',
                'invoice.paid',
                'invoice.payment_failed',
                'customer.created',
              ].map((event) => (
                <div key={event} className="flex items-center gap-2">
                  <Checkbox checked disabled />
                  <span className="font-mono text-xs">{event}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Config */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda por defecto</Label>
              <Input
                id="currency"
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value.toUpperCase())}
                placeholder="EUR"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trialDays">Días de prueba</Label>
              <Input
                id="trialDays"
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                min={0}
                max={365}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate ID (opcional)</Label>
            <Input
              id="taxRate"
              value={taxRateId}
              onChange={(e) => setTaxRateId(e.target.value)}
              placeholder="txr_..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="successUrl">Success URL</Label>
            <Input
              id="successUrl"
              value={successUrl}
              onChange={(e) => setSuccessUrl(e.target.value)}
              placeholder="https://app.ip-nexus.com/subscription/success"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancelUrl">Cancel URL</Label>
            <Input
              id="cancelUrl"
              value={cancelUrl}
              onChange={(e) => setCancelUrl(e.target.value)}
              placeholder="https://app.ip-nexus.com/subscription/cancel"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveConfig.isPending}>
          {saveConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}
