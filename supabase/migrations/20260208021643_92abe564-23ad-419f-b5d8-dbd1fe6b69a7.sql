
-- Payment events audit trail (append-only)
CREATE TABLE IF NOT EXISTS public.market_payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.market_service_transactions(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'escrow_deposit', 'official_fees_advance', 'phase_release', 'platform_fee', 'final_release', 'refund', 'dispute_hold'
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  direction TEXT NOT NULL, -- 'in', 'out', 'fee', 'hold'
  description TEXT,
  recipient TEXT,
  milestone_id UUID REFERENCES public.market_milestones(id),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_transaction ON public.market_payment_events(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_type ON public.market_payment_events(type);

-- Enable RLS
ALTER TABLE public.market_payment_events ENABLE ROW LEVEL SECURITY;

-- Users can see payment events for their own transactions
CREATE POLICY "Users can view their transaction payment events"
  ON public.market_payment_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.market_service_transactions t
      WHERE t.id = market_payment_events.transaction_id
      AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid())
    )
  );

-- Add metadata column to market_service_messages for system message data
ALTER TABLE public.market_service_messages
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add sender_display_name for system messages (where sender_user_id is null)
ALTER TABLE public.market_service_messages
  ADD COLUMN IF NOT EXISTS sender_display_name TEXT;

-- Allow null sender_user_id for system messages
ALTER TABLE public.market_service_messages
  ALTER COLUMN sender_user_id DROP NOT NULL;

-- RLS for market_service_messages (ensure users in the transaction can read/write)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'market_service_messages' AND policyname = 'Users can view their transaction messages'
  ) THEN
    CREATE POLICY "Users can view their transaction messages"
      ON public.market_service_messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.market_service_transactions t
          WHERE t.id = market_service_messages.transaction_id
          AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'market_service_messages' AND policyname = 'Users can insert messages in their transactions'
  ) THEN
    CREATE POLICY "Users can insert messages in their transactions"
      ON public.market_service_messages FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.market_service_transactions t
          WHERE t.id = market_service_messages.transaction_id
          AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid())
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'market_service_messages' AND policyname = 'Users can update read status of their messages'
  ) THEN
    CREATE POLICY "Users can update read status of their messages"
      ON public.market_service_messages FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.market_service_transactions t
          WHERE t.id = market_service_messages.transaction_id
          AND (t.buyer_user_id = auth.uid() OR t.seller_user_id = auth.uid())
        )
      );
  END IF;
END $$;
