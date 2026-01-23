# IP-NEXUS — Pendientes por tu parte (operación / configuración)

> Documento vivo. Cada vez que haya un bloqueo externo (Stripe/Twilio/Email, DNS, etc.), lo registramos aquí.

**Última actualización:** 2026-01-23

---

## 0) Cómo usar este documento

- Marca con ✅ cuando esté hecho.
- Añade evidencia en “Notas” (p. ej. screenshot, ID de Stripe, URL de webhook, etc.).
- Si algo cambia (p. ej. otro endpoint o otro entorno), lo anotamos en “Cambios”.

**Estados sugeridos:** ⏳ pendiente · 🧪 en pruebas · ✅ hecho · 🧱 bloqueado

---

## 1) Stripe — Keys / Secrets en Supabase

### 1.1 Añadir secrets (Backoffice)

En Supabase Dashboard → **Project Settings → Functions → Secrets**

- [ ] **STRIPE_SECRET_KEY** (⏳)
  - Valor: `sk_test_...` o `sk_live_...`
  - Notas:

- [ ] **STRIPE_WEBHOOK_SECRET** (⏳)
  - Valor: `whsec_...`
  - Notas:

- [ ] **APP_URL** (⏳)
  - Valor recomendado: URL de producción publicada (o la de staging si procede)
  - Ejemplos:
    - `https://app.ip-nexus.com`
    - `https://staging.ip-nexus.com`
  - Notas:

> Importante: sin estas keys, las Edge Functions de Stripe responden 503 (comportamiento esperado).

---

## 2) Stripe — Configuración de Webhook

### 2.1 Crear endpoint webhook en Stripe

En Stripe Dashboard → **Developers → Webhooks → Add endpoint**

- [ ] Endpoint URL (⏳)
  - `https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/stripe-webhooks`

- [ ] Events a suscribir (⏳)
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `payment_method.attached`
  - `charge.dispute.created`

- [ ] Copiar **Signing secret** a `STRIPE_WEBHOOK_SECRET` (⏳)

**Notas / evidencia:**

---

## 3) Stripe — Productos y precios para VoIP (mapeo)

### 3.1 Decidir catálogo (qué vendemos exactamente)

Confirmar si los planes VoIP se venden como:
- Suscripción mensual
- Suscripción anual
- Ambos

**Pendiente de confirmación:**
- [ ] ¿Habrá anual para VoIP desde el día 1? (⏳)

### 3.2 Crear productos en Stripe (por plan VoIP)

Por cada plan en `voip_pricing_plans` (Starter/Professional/Business/Unlimited/Pay-as-you-go si aplica):

- [ ] Crear **Product** en Stripe con metadata (recomendado):
  - `module=voip`
  - `voip_plan_code=<code>`

- [ ] Crear **Price** (mensual y/o anual) y anotar:
  - `prod_...`
  - `price_...` (month)
  - `price_...` (year) (si aplica)

**Notas:**

### 3.3 Mapear en BD (stripe_products / stripe_prices)

Para que el checkout VoIP funcione, debe existir:

1) Un registro en `stripe_products` con:
- `stripe_product_id`
- `active=true`
- `voip_plan_id = <uuid del plan en voip_pricing_plans>`

2) Registros en `stripe_prices` (uno por price de Stripe) con:
- `stripe_price_id`
- `stripe_product_id`
- `active=true`
- `recurring_interval = 'month'` (y `'year'` si hay anual)

> Nota: nosotros podemos ayudar a poblarlo cuando las keys estén listas y tengamos los IDs `prod_`/`price_`.

**Checklist mapeo (rellenar cuando tengáis IDs):**

| Plan VoIP | voip_plan_id | stripe_product_id | price_id (month) | price_id (year) |
|---|---|---|---|---|
| Starter | ⏳ | ⏳ | ⏳ | ⏳ |
| Professional | ⏳ | ⏳ | ⏳ | ⏳ |
| Business | ⏳ | ⏳ | ⏳ | ⏳ |
| Unlimited | ⏳ | ⏳ | ⏳ | ⏳ |
| Pay-as-you-go | ⏳ | ⏳ | ⏳ | ⏳ |

---

## 4) Validación end-to-end (cuando haya keys)

### 4.1 Flujo checkout

- [ ] Ir a Ajustes VoIP / selector de plan y lanzar checkout (🧪)
- [ ] Completar pago en Stripe (test card si entorno test)
- [ ] Confirmar:
  - [ ] Se crea/actualiza `stripe_customers`
  - [ ] Se crea `stripe_subscriptions`
  - [ ] Se activa `voip_subscriptions` (status=active)
  - [ ] Se registra evento en `system_events` (`payment.checkout.started`, `subscription.created`)

### 4.2 Renovación

- [ ] Forzar / esperar `invoice.paid` de ciclo y confirmar:
  - [ ] Se crea `stripe_invoices`
  - [ ] Se resetean minutos en `voip_subscriptions`
  - [ ] Se registra `subscription.renewed` en `system_events`

### 4.3 Fallo de pago / suspensión

- [ ] Simular `invoice.payment_failed` y confirmar:
  - [ ] Se crea `stripe_payment_attempts`
  - [ ] `stripe_subscriptions.status = past_due`
  - [ ] `voip_subscriptions.status = past_due`
- [ ] Simular 3 fallos y confirmar:
  - [ ] `voip_subscriptions.status = suspended`
  - [ ] Evento `subscription.suspended` en `system_events`

---

## 5) Opcional / próximo (si lo queréis ahora)

- [ ] Definir emails automáticos (Resend):
  - Pago fallido
  - Suspensión
  - Confirmación de alta

- [ ] Políticas fiscales / factura (IVA, NIF/CIF):
  - ¿Se gestiona en Stripe Tax o manual?

---

## 6) Cambios / notas de coordinación

**Cambios:**
- (vacío)

**Bloqueos actuales:**
- Añadir secrets Stripe en Backoffice.
