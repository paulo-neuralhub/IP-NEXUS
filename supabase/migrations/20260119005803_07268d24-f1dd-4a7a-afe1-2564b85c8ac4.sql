-- ============================================
-- IP-MARKET DATABASE SCHEMA
-- ============================================

-- ENUMS
CREATE TYPE market_transaction_type AS ENUM (
  'full_sale', 'partial_assignment', 'swap',
  'exclusive_license', 'non_exclusive_license', 'cross_license', 'franchise', 'option_to_buy',
  'auction', 'rfp', 'coexistence', 'settlement'
);

CREATE TYPE market_asset_type AS ENUM (
  'patent_invention', 'patent_utility', 'patent_design',
  'trademark_word', 'trademark_figurative', 'trademark_mixed', 'trademark_3d', 'trademark_sound',
  'industrial_design', 'copyright_software', 'copyright_literary', 'copyright_musical', 'copyright_artistic',
  'domain_gtld', 'domain_cctld', 'know_how', 'trade_secret', 'trade_name', 'portfolio'
);

CREATE TYPE market_asset_category AS ENUM ('industrial_property', 'intellectual_property', 'intangible_assets');

CREATE TYPE market_listing_status AS ENUM (
  'draft', 'pending_verification', 'active', 'under_offer', 'reserved',
  'sold', 'licensed', 'expired', 'withdrawn', 'suspended'
);

CREATE TYPE market_transaction_status AS ENUM (
  'inquiry', 'negotiation', 'offer_made', 'offer_accepted', 'due_diligence',
  'contract_draft', 'contract_review', 'pending_payment', 'payment_in_escrow',
  'pending_transfer', 'completed', 'cancelled', 'disputed'
);

CREATE TYPE market_kyc_level AS ENUM ('0', '1', '2', '3', '4');

CREATE TYPE market_certification_level AS ENUM ('basic', 'standard', 'premium');

CREATE TYPE market_verification_status AS ENUM ('pending', 'verified', 'failed', 'expired', 'not_required');

-- ============================================
-- TABLES
-- ============================================

-- Market User Profiles
CREATE TABLE market_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  kyc_level market_kyc_level DEFAULT '0',
  kyc_verified_at TIMESTAMPTZ,
  kyc_expires_at TIMESTAMPTZ,
  phone VARCHAR(50),
  phone_verified BOOLEAN DEFAULT FALSE,
  country_code VARCHAR(2),
  address JSONB,
  is_agent BOOLEAN DEFAULT FALSE,
  agent_license_number VARCHAR(100),
  bar_association VARCHAR(255),
  professional_insurance JSONB,
  is_company BOOLEAN DEFAULT FALSE,
  company_name VARCHAR(255),
  company_registration_number VARCHAR(100),
  company_vat_number VARCHAR(50),
  legal_representative_name VARCHAR(255),
  preferred_language VARCHAR(2) DEFAULT 'es',
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  total_listings INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_volume DECIMAL(15,2) DEFAULT 0,
  average_rating DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC Verifications
CREATE TABLE market_kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  provider VARCHAR(50),
  external_reference VARCHAR(255),
  status market_verification_status DEFAULT 'pending',
  documents JSONB,
  verification_result JSONB,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Assets
CREATE TABLE market_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type market_asset_type NOT NULL,
  asset_category market_asset_category NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  registration_number VARCHAR(100),
  filing_date DATE,
  registration_date DATE,
  expiration_date DATE,
  jurisdiction VARCHAR(10),
  word_mark VARCHAR(500),
  nice_classes INTEGER[],
  logo_url TEXT,
  claims TEXT[],
  inventors TEXT[],
  abstract TEXT,
  pct_number VARCHAR(100),
  domain_name VARCHAR(255),
  registrar VARCHAR(255),
  author VARCHAR(255),
  creation_date DATE,
  verification_status market_verification_status DEFAULT 'pending',
  verification_data JSONB,
  verified_at TIMESTAMPTZ,
  verification_expires_at TIMESTAMPTZ,
  images TEXT[],
  documents JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Listings
CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_number VARCHAR(20) UNIQUE NOT NULL,
  asset_id UUID NOT NULL REFERENCES market_assets(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  status market_listing_status DEFAULT 'draft',
  transaction_types market_transaction_type[] NOT NULL,
  asking_price DECIMAL(15,2),
  price_negotiable BOOLEAN DEFAULT TRUE,
  minimum_offer DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  license_terms JSONB,
  available_territories TEXT[],
  available_classes INTEGER[],
  title VARCHAR(500) NOT NULL,
  description TEXT,
  highlights TEXT[],
  industries TEXT[],
  keywords TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  is_urgent BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  offer_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Transactions
CREATE TABLE market_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(20) UNIQUE NOT NULL,
  listing_id UUID NOT NULL REFERENCES market_listings(id),
  asset_id UUID NOT NULL REFERENCES market_assets(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  transaction_type market_transaction_type NOT NULL,
  status market_transaction_status DEFAULT 'inquiry',
  offered_price DECIMAL(15,2),
  agreed_price DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(15,2),
  license_terms JSONB,
  certification_level market_certification_level,
  certification_hash VARCHAR(64),
  certification_timestamp TIMESTAMPTZ,
  blockchain_tx_hash VARCHAR(100),
  certificate_url TEXT,
  escrow_provider VARCHAR(50),
  escrow_reference VARCHAR(255),
  escrow_status VARCHAR(50),
  payment_intent_id VARCHAR(255),
  payment_method VARCHAR(50),
  paid_at TIMESTAMPTZ,
  contract_url TEXT,
  contract_signed_at TIMESTAMPTZ,
  nda_url TEXT,
  nda_signed_at TIMESTAMPTZ,
  due_diligence_completed BOOLEAN DEFAULT FALSE,
  due_diligence_report JSONB,
  transfer_completed BOOLEAN DEFAULT FALSE,
  transfer_proof_url TEXT,
  completed_at TIMESTAMPTZ,
  dispute_id UUID,
  dispute_reason TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Offers
CREATE TABLE market_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES market_transactions(id),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  offer_type VARCHAR(20) NOT NULL,
  parent_offer_id UUID REFERENCES market_offers(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  proposed_terms JSONB,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  response_message TEXT,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Messages
CREATE TABLE market_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL,
  listing_id UUID REFERENCES market_listings(id),
  transaction_id UUID REFERENCES market_transactions(id),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  attachments JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Favorites
CREATE TABLE market_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Market Alerts
CREATE TABLE market_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  asset_types market_asset_type[],
  jurisdictions VARCHAR(10)[],
  nice_classes INTEGER[],
  keywords TEXT[],
  min_price DECIMAL(15,2),
  max_price DECIMAL(15,2),
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Reviews
CREATE TABLE market_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES market_transactions(id),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  reviewed_id UUID NOT NULL REFERENCES auth.users(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  title VARCHAR(255),
  review TEXT,
  response TEXT,
  responded_at TIMESTAMPTZ,
  visible BOOLEAN DEFAULT TRUE,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Certifications
CREATE TABLE market_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES market_transactions(id),
  certification_level market_certification_level NOT NULL,
  method VARCHAR(50) NOT NULL,
  document_hash VARCHAR(64) NOT NULL,
  metadata_hash VARCHAR(64),
  provider VARCHAR(100),
  provider_reference VARCHAR(255),
  blockchain_network VARCHAR(50),
  blockchain_tx_hash VARCHAR(100),
  smart_contract_address VARCHAR(100),
  token_id VARCHAR(100),
  certificate_url TEXT,
  certificate_data JSONB,
  verified BOOLEAN DEFAULT FALSE,
  verification_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Audit Log
CREATE TABLE market_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_market_assets_owner ON market_assets(owner_id);
CREATE INDEX idx_market_assets_type ON market_assets(asset_type);
CREATE INDEX idx_market_listings_asset ON market_listings(asset_id);
CREATE INDEX idx_market_listings_seller ON market_listings(seller_id);
CREATE INDEX idx_market_listings_status ON market_listings(status);
CREATE INDEX idx_market_transactions_listing ON market_transactions(listing_id);
CREATE INDEX idx_market_transactions_seller ON market_transactions(seller_id);
CREATE INDEX idx_market_transactions_buyer ON market_transactions(buyer_id);
CREATE INDEX idx_market_transactions_status ON market_transactions(status);
CREATE INDEX idx_market_offers_listing ON market_offers(listing_id);
CREATE INDEX idx_market_messages_thread ON market_messages(thread_id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE market_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_reviews ENABLE ROW LEVEL SECURITY;

-- User Profiles
CREATE POLICY "Users can view all profiles" ON market_user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON market_user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON market_user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- KYC
CREATE POLICY "Users can view own KYC" ON market_kyc_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own KYC" ON market_kyc_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Assets
CREATE POLICY "Users can view verified assets" ON market_assets FOR SELECT USING (verification_status = 'verified' OR owner_id = auth.uid());
CREATE POLICY "Users can manage own assets" ON market_assets FOR ALL USING (owner_id = auth.uid());

-- Listings
CREATE POLICY "Anyone can view active listings" ON market_listings FOR SELECT USING (status = 'active' OR seller_id = auth.uid());
CREATE POLICY "Sellers can manage own listings" ON market_listings FOR ALL USING (seller_id = auth.uid());

-- Transactions
CREATE POLICY "Participants can view transactions" ON market_transactions FOR SELECT USING (seller_id = auth.uid() OR buyer_id = auth.uid());
CREATE POLICY "Buyers can create transactions" ON market_transactions FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Participants can update transactions" ON market_transactions FOR UPDATE USING (seller_id = auth.uid() OR buyer_id = auth.uid());

-- Offers
CREATE POLICY "Participants can view offers" ON market_offers FOR SELECT USING (buyer_id = auth.uid() OR listing_id IN (SELECT id FROM market_listings WHERE seller_id = auth.uid()));
CREATE POLICY "Buyers can create offers" ON market_offers FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Messages
CREATE POLICY "Participants can view messages" ON market_messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
CREATE POLICY "Users can send messages" ON market_messages FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Favorites, Alerts
CREATE POLICY "Users can manage own favorites" ON market_favorites FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own alerts" ON market_alerts FOR ALL USING (user_id = auth.uid());

-- Reviews
CREATE POLICY "Anyone can view visible reviews" ON market_reviews FOR SELECT USING (visible = true);
CREATE POLICY "Reviewers can create reviews" ON market_reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Reviewed can respond" ON market_reviews FOR UPDATE USING (reviewed_id = auth.uid());