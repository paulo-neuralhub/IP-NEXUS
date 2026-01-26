import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type {
  MatterCost,
  CostFilters,
  Invoice,
  InvoiceFilters,
  InvoiceItem,
  Quote,
  BillingClient,
  ServiceFee,
  OfficialFee,
  RenewalSchedule,
  RenewalFilters,
} from '@/types/finance';

// ===== TARIFAS OFICIALES =====
export function useOfficialFees(office?: string, ipType?: string) {
  return useQuery({
    queryKey: ['official-fees', office, ipType],
    queryFn: async () => {
      let query = supabase
        .from('official_fees')
        .select('*')
        .eq('is_current', true)
        .order('office')
        .order('fee_type');
      
      if (office) query = query.eq('office', office);
      if (ipType) query = query.eq('ip_type', ipType);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as OfficialFee[];
    },
  });
}

// ===== TARIFAS DE SERVICIOS =====
export function useServiceFees(category?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['service-fees', currentOrganization?.id, category],
    queryFn: async () => {
      let query = supabase
        .from('service_fees')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .eq('is_active', true)
        .order('category')
        .order('name');
      
      if (category) query = query.eq('category', category);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceFee[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateServiceFee() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Omit<Partial<ServiceFee>, 'organization_id'>) => {
      const insertData = { 
        ...data, 
        organization_id: currentOrganization!.id,
        amount: data.amount || 0,
        category: data.category || 'other',
        code: data.code || '',
        name: data.name || '',
      };
      const { data: fee, error } = await supabase
        .from('service_fees')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return fee as ServiceFee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-fees'] });
    },
  });
}

export function useUpdateServiceFee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceFee> }) => {
      const { data: fee, error } = await supabase
        .from('service_fees')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return fee as ServiceFee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-fees'] });
    },
  });
}

// ===== COSTES =====
export function useMatterCosts(filters?: CostFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['matter-costs', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('matter_costs')
        .select(`
          *,
          matter:matters(id, reference, title, type),
          official_fee:official_fees(id, name, office),
          service_fee:service_fees(id, name)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('cost_date', { ascending: false });
      
      if (filters?.matter_id) query = query.eq('matter_id', filters.matter_id);
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      if (filters?.cost_type) {
        const types = Array.isArray(filters.cost_type) ? filters.cost_type : [filters.cost_type];
        query = query.in('cost_type', types);
      }
      if (filters?.is_billable !== undefined) query = query.eq('is_billable', filters.is_billable);
      if (filters?.date_from) query = query.gte('cost_date', filters.date_from);
      if (filters?.date_to) query = query.lte('cost_date', filters.date_to);
      
      const { data, error } = await query.limit(500);
      if (error) throw error;
      return data as MatterCost[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useMatterCostsByMatter(matterId: string) {
  return useMatterCosts({ matter_id: matterId });
}

export function useCreateMatterCost() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Omit<Partial<MatterCost>, 'organization_id'>) => {
      const insertData = { 
        ...data, 
        organization_id: currentOrganization!.id,
        matter_id: data.matter_id!,
        cost_type: data.cost_type || 'service_fee',
        description: data.description || '',
        amount: data.amount || 0,
      };
      const { data: cost, error } = await supabase
        .from('matter_costs')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return cost as MatterCost;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-costs'] });
      if (variables.matter_id) {
        queryClient.invalidateQueries({ queryKey: ['matter', variables.matter_id] });
      }
    },
  });
}

export function useUpdateMatterCost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MatterCost> }) => {
      const { data: cost, error } = await supabase
        .from('matter_costs')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return cost as MatterCost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-costs'] });
    },
  });
}

export function useDeleteMatterCost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('matter_costs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-costs'] });
    },
  });
}

// ===== CLIENTES DE FACTURACIÓN =====
export function useBillingClients() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['billing-clients', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_clients')
        .select(`
          *,
          contact:contacts(id, name, email, company_name)
        `)
        .eq('organization_id', currentOrganization!.id)
        .eq('is_active', true)
        .order('legal_name');
      if (error) throw error;
      return data as BillingClient[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useBillingClient(id: string) {
  return useQuery({
    queryKey: ['billing-client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_clients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as BillingClient;
    },
    enabled: !!id,
  });
}

export function useCreateBillingClient() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Omit<Partial<BillingClient>, 'organization_id'>) => {
      const insertData = { 
        ...data, 
        organization_id: currentOrganization!.id,
        legal_name: data.legal_name || '',
      };
      const { data: client, error } = await supabase
        .from('billing_clients')
        .insert(insertData)
        .select()
        .single();
      if (error) throw error;
      return client as BillingClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-clients'] });
    },
  });
}

export function useUpdateBillingClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BillingClient> }) => {
      const { data: client, error } = await supabase
        .from('billing_clients')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return client as BillingClient;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing-clients'] });
      queryClient.invalidateQueries({ queryKey: ['billing-client', variables.id] });
    },
  });
}

// ===== FACTURAS =====
export function useInvoices(filters?: InvoiceFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['invoices', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          billing_client:billing_clients(id, legal_name)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('invoice_date', { ascending: false });
      
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      if (filters?.billing_client_id) query = query.eq('billing_client_id', filters.billing_client_id);
      if (filters?.date_from) query = query.gte('invoice_date', filters.date_from);
      if (filters?.date_to) query = query.lte('invoice_date', filters.date_to);
      
      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          billing_client:billing_clients(*),
          items:invoice_items(
            *,
            matter:matters(id, reference, title)
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: { 
      invoice: Partial<Invoice>; 
      items: Array<{ description: string; subtotal: number; unit_price: number; quantity?: number; matter_id?: string; matter_cost_id?: string; discount_percent?: number; tax_rate?: number; tax_amount?: number; notes?: string }>;
    }) => {
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization!.id)
        .gte('invoice_date', `${year}-01-01`);
      
      const invoiceNumber = `${year}-${String((count || 0) + 1).padStart(5, '0')}`;
      
      // Extract only DB-safe fields (exclude relations and TypeScript-only fields)
      const { billing_client, items, ...invoiceFields } = data.invoice;
      
      const invoiceData = {
        billing_client_id: invoiceFields.billing_client_id!,
        client_name: invoiceFields.client_name || '',
        invoice_number: invoiceNumber,
        organization_id: currentOrganization!.id,
        subtotal: invoiceFields.subtotal || 0,
        tax_amount: invoiceFields.tax_amount || 0,
        total: invoiceFields.total || 0,
        invoice_date: invoiceFields.invoice_date || new Date().toISOString().split('T')[0],
        due_date: invoiceFields.due_date,
        tax_rate: invoiceFields.tax_rate ?? 21,
        discount_amount: invoiceFields.discount_amount ?? 0,
        currency: invoiceFields.currency || 'EUR',
        status: invoiceFields.status || 'draft',
        notes: invoiceFields.notes,
        internal_notes: invoiceFields.internal_notes,
        footer_text: invoiceFields.footer_text,
        invoice_type: invoiceFields.invoice_type,
        client_tax_id: invoiceFields.client_tax_id,
        client_address: invoiceFields.client_address,
      };
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData as any)
        .select()
        .single();
      if (invoiceError) throw invoiceError;
      
      if (data.items.length > 0) {
        const items = data.items.map((item, index) => ({
          invoice_id: invoice.id,
          line_number: index + 1,
          description: item.description,
          subtotal: item.subtotal,
          unit_price: item.unit_price,
          quantity: item.quantity,
          matter_id: item.matter_id,
          matter_cost_id: item.matter_cost_id,
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);
        if (itemsError) throw itemsError;
      }
      
      return invoice as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['matter-costs'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Invoice> }) => {
      // Extract only DB-safe fields
      const { billing_client, items, ...updateFields } = data;
      
      const { data: invoice, error } = await supabase
        .from('invoices')
        .update({ ...updateFields, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return invoice;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payment }: { 
      id: string; 
      payment: { amount: number; date: string; method?: string; reference?: string }
    }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status: 'paid',
          paid_amount: payment.amount,
          paid_date: payment.date,
          payment_method: payment.method,
          payment_reference: payment.reference,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Aquí iría la lógica de envío por email
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    },
  });
}

// ===== PRESUPUESTOS =====
export function useQuotes(status?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['quotes', currentOrganization?.id, status],
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('quote_date', { ascending: false });
      
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as Quote[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: Partial<Quote>) => {
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization!.id)
        .gte('quote_date', `${year}-01-01`);
      
      const quoteNumber = `P${year}-${String((count || 0) + 1).padStart(4, '0')}`;
      
      const quoteData = {
        client_name: data.client_name || '',
        quote_number: quoteNumber,
        organization_id: currentOrganization!.id,
        ...data,
      };
      
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();
      if (error) throw error;
      return quote as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useConvertQuoteToInvoice() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (quoteId: string): Promise<{ success: boolean; invoiceId: string; invoiceNumber: string }> => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      // PASO 1: Obtener presupuesto completo con items
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*, items:quote_items(*)')
        .eq('id', quoteId)
        .single();
      if (quoteError) throw quoteError;
      if (!quote) throw new Error('Presupuesto no encontrado');
      
      // PASO 2: Generar número de factura
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .gte('invoice_date', `${year}-01-01`);
      
      const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
      
      // Calcular fecha de vencimiento (30 días)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      // PASO 3: Crear factura
      const invoiceData = {
        organization_id: currentOrganization.id,
        invoice_number: invoiceNumber,
        billing_client_id: quote.billing_client_id || quote.id, // Fallback to quote id if no client
        client_name: quote.client_name || '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        subtotal: quote.subtotal || 0,
        tax_rate: quote.tax_rate || 21,
        tax_amount: quote.tax_amount || 0,
        discount_amount: quote.discount_amount || 0,
        total: quote.total || 0,
        currency: quote.currency || 'EUR',
        status: 'draft',
        notes: quote.notes || null,
        internal_notes: `Generada desde presupuesto ${quote.quote_number}`,
      };
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();
      if (invoiceError) throw invoiceError;
      if (!invoice) throw new Error('Error al crear factura');
      
      // PASO 4: Crear invoice_items desde quote_items
      const quoteItems = (quote as { items?: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        notes?: string;
      }> }).items || [];
      
      if (quoteItems.length > 0) {
        const invoiceItems = quoteItems.map((item, index) => ({
          invoice_id: invoice.id,
          line_number: index + 1,
          description: item.description,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          subtotal: (item.quantity || 1) * (item.unit_price || 0),
          discount_percent: 0,
          notes: item.notes || null,
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
        if (itemsError) throw itemsError;
      }
      
      // PASO 5: Actualizar quote como convertido
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ 
          status: 'converted',
          converted_invoice_id: invoice.id,
          converted_at: new Date().toISOString(),
        })
        .eq('id', quoteId);
      if (updateError) throw updateError;
      
      return { 
        success: true, 
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// ===== RENOVACIONES =====
export function useRenewalSchedule(filters?: RenewalFilters) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['renewal-schedule', currentOrganization?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('renewal_schedule')
        .select(`
          *,
          matter:matters(id, reference, title, type, jurisdiction, mark_name)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('due_date', { ascending: true });
      
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      if (filters?.renewal_type) {
        const types = Array.isArray(filters.renewal_type) ? filters.renewal_type : [filters.renewal_type];
        query = query.in('renewal_type', types);
      }
      if (filters?.due_before) query = query.lte('due_date', filters.due_before);
      if (filters?.due_after) query = query.gte('due_date', filters.due_after);
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as RenewalSchedule[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUpcomingRenewals(days = 90) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return useRenewalSchedule({
    status: ['upcoming', 'due', 'in_grace'],
    due_before: futureDate.toISOString().split('T')[0],
  });
}

export function useInstructRenewal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, instruction }: { 
      id: string; 
      instruction: 'renew' | 'abandon';
    }) => {
      const { data, error } = await supabase
        .from('renewal_schedule')
        .update({ 
          client_instruction: instruction,
          instruction_date: new Date().toISOString().split('T')[0],
          status: instruction === 'renew' ? 'instructed' : 'abandoned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renewal-schedule'] });
    },
  });
}

// ===== ESTADÍSTICAS =====
export function useFinanceStats() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['finance-stats', currentOrganization?.id],
    queryFn: async () => {
      const orgId = currentOrganization!.id;
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = today.slice(0, 7) + '-01';
      
      // Costes pendientes
      const { data: pendingCosts } = await supabase
        .from('matter_costs')
        .select('total_amount')
        .eq('organization_id', orgId)
        .eq('status', 'pending');
      
      // Facturas pendientes
      const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total, paid_amount')
        .eq('organization_id', orgId)
        .in('status', ['sent', 'viewed', 'partial', 'overdue']);
      
      // Facturado este mes
      const { data: monthInvoices } = await supabase
        .from('invoices')
        .select('total')
        .eq('organization_id', orgId)
        .gte('invoice_date', thisMonth)
        .neq('status', 'cancelled');
      
      // Renovaciones próximas
      const { count: renewalsDue } = await supabase
        .from('renewal_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['upcoming', 'due', 'in_grace']);
      
      return {
        pendingCostsTotal: pendingCosts?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0,
        pendingInvoicesTotal: pendingInvoices?.reduce((sum, i) => sum + (i.total - (i.paid_amount || 0)), 0) || 0,
        invoicedThisMonth: monthInvoices?.reduce((sum, i) => sum + i.total, 0) || 0,
        renewalsDue: renewalsDue || 0,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== HELPERS =====
export function useNextInvoiceNumber() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['next-invoice-number', currentOrganization?.id],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization!.id)
        .gte('invoice_date', `${year}-01-01`);
      
      return `${year}-${String((count || 0) + 1).padStart(5, '0')}`;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function calculateFeeWithClasses(fee: OfficialFee, numClasses: number): number {
  if (!fee.per_class) return fee.amount;
  
  const extraClasses = Math.max(0, numClasses - fee.base_classes);
  return fee.amount + (extraClasses * (fee.extra_class_fee || 0));
}

// ===== GENERATE INVOICE PDF =====
export function useGenerateInvoicePDF() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      sendEmail, 
      emailTo 
    }: { 
      invoiceId: string; 
      sendEmail?: boolean; 
      emailTo?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoiceId, sendEmail, emailTo },
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data as { success: boolean; pdfUrl: string; filePath: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
