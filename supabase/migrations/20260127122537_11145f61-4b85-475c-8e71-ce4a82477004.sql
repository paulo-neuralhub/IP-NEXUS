-- ============================================================
-- IP-NEXUS: Seed Idempotente para Oficinas IP Globales
-- Usa ON CONFLICT (code) DO UPDATE para upsert
-- ============================================================

-- TIER 1 - CRITICAL OFFICES (Nivel A & B - 75-100% Automatizado)
INSERT INTO public.ipo_offices (
  code, code_alt, name_official, name_short, country_code, country_name, flag_emoji,
  region, office_type, ip_types, timezone, languages, currency, tier,
  automation_level, automation_percentage, website_official, website_search,
  has_api, api_type, e_filing_available, online_payment, capabilities, status, priority_score
) VALUES
-- EUIPO (Nivel A - 100%)
('EM', 'EUIPO', 'European Union Intellectual Property Office', 'EUIPO', NULL, 'European Union', '🇪🇺',
 'europe', 'regional', ARRAY['trademark', 'design'], 'Europe/Madrid', ARRAY['en', 'es', 'de', 'fr', 'it'], 'EUR', 1,
 'A', 100, 'https://euipo.europa.eu', 'https://euipo.europa.eu/eSearch/', true, 'REST', true, true,
 '{"filing": {"available": true, "method": "api", "notes": "E-filing completo via API"}, "search": {"available": true, "method": "api"}, "payment": {"available": true, "method": "api"}, "statusTracking": {"available": true, "method": "api"}, "renewal": {"available": true, "method": "api"}, "niceClassification": {"available": true, "method": "api"}}'::jsonb, 'active', 95),
-- EPO (Nivel B - 75%)
('EP', 'EPO', 'European Patent Office', 'EPO', NULL, 'European Union', '🇪🇺',
 'europe', 'regional', ARRAY['patent'], 'Europe/Munich', ARRAY['en', 'de', 'fr'], 'EUR', 1,
 'B', 75, 'https://www.epo.org', 'https://worldwide.espacenet.com', true, 'REST', true, true,
 '{"filing": {"available": true, "method": "api"}, "search": {"available": true, "method": "api"}, "payment": {"available": true, "method": "api"}, "statusTracking": {"available": true, "method": "api"}}'::jsonb, 'active', 90),
-- USPTO (Nivel C - 50%)
('US', 'USPTO', 'United States Patent and Trademark Office', 'USPTO', 'US', 'United States', '🇺🇸',
 'north_america', 'national', ARRAY['trademark', 'patent', 'design'], 'America/New_York', ARRAY['en'], 'USD', 1,
 'C', 50, 'https://www.uspto.gov', 'https://tmsearch.uspto.gov', true, 'REST', true, true,
 '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "api"}, "payment": {"available": true, "method": "web"}, "statusTracking": {"available": true, "method": "api"}}'::jsonb, 'active', 90),
-- WIPO (Nivel C - 50%)
('WO', 'WIPO', 'World Intellectual Property Organization', 'WIPO', NULL, 'International', '🌐',
 'europe', 'international', ARRAY['trademark', 'patent', 'design'], 'Europe/Zurich', ARRAY['en', 'es', 'fr', 'ar', 'zh', 'ru'], 'CHF', 1,
 'C', 50, 'https://www.wipo.int', 'https://www.wipo.int/madrid/monitor/', true, 'REST', true, true,
 '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "api"}, "payment": {"available": true, "method": "web"}, "statusTracking": {"available": true, "method": "api"}}'::jsonb, 'active', 95),
-- CNIPA (Nivel C - 50%)
('CN', 'CNIPA', 'China National Intellectual Property Administration', 'CNIPA', 'CN', 'China', '🇨🇳',
 'asia_pacific', 'national', ARRAY['trademark', 'patent', 'design'], 'Asia/Shanghai', ARRAY['zh', 'en'], 'CNY', 1,
 'C', 50, 'https://english.cnipa.gov.cn', 'https://wsjs.saic.gov.cn', true, 'REST', true, true,
 '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "api"}, "payment": {"available": true, "method": "web"}, "statusTracking": {"available": true, "method": "api"}}'::jsonb, 'active', 85)
ON CONFLICT (code) DO UPDATE SET
  code_alt = EXCLUDED.code_alt, name_official = EXCLUDED.name_official, name_short = EXCLUDED.name_short,
  country_code = EXCLUDED.country_code, country_name = EXCLUDED.country_name, flag_emoji = EXCLUDED.flag_emoji,
  region = EXCLUDED.region, office_type = EXCLUDED.office_type, ip_types = EXCLUDED.ip_types,
  timezone = EXCLUDED.timezone, languages = EXCLUDED.languages, currency = EXCLUDED.currency, tier = EXCLUDED.tier,
  automation_level = EXCLUDED.automation_level, automation_percentage = EXCLUDED.automation_percentage,
  website_official = EXCLUDED.website_official, website_search = EXCLUDED.website_search,
  has_api = EXCLUDED.has_api, api_type = EXCLUDED.api_type, e_filing_available = EXCLUDED.e_filing_available,
  online_payment = EXCLUDED.online_payment, capabilities = EXCLUDED.capabilities, status = EXCLUDED.status,
  priority_score = EXCLUDED.priority_score, updated_at = NOW();

-- TIER 2 - IMPORTANT OFFICES (Nivel C & D - 25-50%)
INSERT INTO public.ipo_offices (
  code, code_alt, name_official, name_short, country_code, country_name, flag_emoji,
  region, office_type, ip_types, timezone, languages, currency, tier,
  automation_level, automation_percentage, website_official, website_search,
  has_api, api_type, e_filing_available, online_payment, capabilities, status, priority_score
) VALUES
('ES', 'OEPM', 'Oficina Española de Patentes y Marcas', 'OEPM', 'ES', 'Spain', '🇪🇸', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Madrid', ARRAY['es'], 'EUR', 2, 'D', 25, 'https://www.oepm.es', 'https://consultas2.oepm.es/LocalizadorWeb/', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 75),
('GB', 'UKIPO', 'UK Intellectual Property Office', 'UKIPO', 'GB', 'United Kingdom', '🇬🇧', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/London', ARRAY['en'], 'GBP', 2, 'D', 25, 'https://www.gov.uk/government/organisations/intellectual-property-office', 'https://trademarks.ipo.gov.uk/ipo-tmcase', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 75),
('JP', 'JPO', 'Japan Patent Office', 'JPO', 'JP', 'Japan', '🇯🇵', 'asia_pacific', 'national', ARRAY['trademark', 'patent', 'design'], 'Asia/Tokyo', ARRAY['ja', 'en'], 'JPY', 2, 'C', 50, 'https://www.jpo.go.jp', 'https://www.j-platpat.inpit.go.jp', true, 'REST', true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "api"}}'::jsonb, 'active', 80),
('KR', 'KIPO', 'Korean Intellectual Property Office', 'KIPO', 'KR', 'South Korea', '🇰🇷', 'asia_pacific', 'national', ARRAY['trademark', 'patent', 'design'], 'Asia/Seoul', ARRAY['ko', 'en'], 'KRW', 2, 'C', 50, 'https://www.kipo.go.kr', 'http://eng.kipris.or.kr', true, 'REST', true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "api"}}'::jsonb, 'active', 80),
('DE', 'DPMA', 'Deutsches Patent- und Markenamt', 'DPMA', 'DE', 'Germany', '🇩🇪', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Berlin', ARRAY['de'], 'EUR', 2, 'D', 25, 'https://www.dpma.de', 'https://register.dpma.de', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 75),
('FR', 'INPI-FR', 'Institut National de la Propriété Industrielle', 'INPI France', 'FR', 'France', '🇫🇷', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Paris', ARRAY['fr'], 'EUR', 2, 'D', 25, 'https://www.inpi.fr', 'https://bases-marques.inpi.fr', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 75),
('CA', 'CIPO', 'Canadian Intellectual Property Office', 'CIPO', 'CA', 'Canada', '🇨🇦', 'north_america', 'national', ARRAY['trademark', 'patent', 'design'], 'America/Toronto', ARRAY['en', 'fr'], 'CAD', 2, 'D', 25, 'https://www.ic.gc.ca/eic/site/cipointernet-internetopic.nsf/', 'https://www.ic.gc.ca/app/opic-cipo/trdmrks/srch/home', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 70),
('AU', 'IPA', 'IP Australia', 'IP Australia', 'AU', 'Australia', '🇦🇺', 'oceania', 'national', ARRAY['trademark', 'patent', 'design'], 'Australia/Sydney', ARRAY['en'], 'AUD', 2, 'D', 25, 'https://www.ipaustralia.gov.au', 'https://search.ipaustralia.gov.au/trademarks/search/', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 70),
('BR', 'INPI-BR', 'Instituto Nacional da Propriedade Industrial', 'INPI Brazil', 'BR', 'Brazil', '🇧🇷', 'south_america', 'national', ARRAY['trademark', 'patent', 'design'], 'America/Sao_Paulo', ARRAY['pt'], 'BRL', 2, 'D', 25, 'https://www.gov.br/inpi/', 'https://busca.inpi.gov.br/pePI/', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 65),
('MX', 'IMPI', 'Instituto Mexicano de la Propiedad Industrial', 'IMPI', 'MX', 'Mexico', '🇲🇽', 'north_america', 'national', ARRAY['trademark', 'patent', 'design'], 'America/Mexico_City', ARRAY['es'], 'MXN', 2, 'D', 25, 'https://www.gob.mx/impi', 'https://marcia.impi.gob.mx/', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 65),
('IT', 'UIBM', 'Ufficio Italiano Brevetti e Marchi', 'UIBM', 'IT', 'Italy', '🇮🇹', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Rome', ARRAY['it'], 'EUR', 2, 'D', 25, 'https://www.mise.gov.it/index.php/it/component/content/article?id=2031313', 'https://uibm.mise.gov.it/bancadati/', false, NULL, true, true, '{"filing": {"available": true, "method": "web"}, "search": {"available": true, "method": "web"}}'::jsonb, 'active', 70)
ON CONFLICT (code) DO UPDATE SET
  code_alt = EXCLUDED.code_alt, name_official = EXCLUDED.name_official, name_short = EXCLUDED.name_short,
  country_code = EXCLUDED.country_code, country_name = EXCLUDED.country_name, flag_emoji = EXCLUDED.flag_emoji,
  region = EXCLUDED.region, office_type = EXCLUDED.office_type, ip_types = EXCLUDED.ip_types,
  timezone = EXCLUDED.timezone, languages = EXCLUDED.languages, currency = EXCLUDED.currency, tier = EXCLUDED.tier,
  automation_level = EXCLUDED.automation_level, automation_percentage = EXCLUDED.automation_percentage,
  website_official = EXCLUDED.website_official, website_search = EXCLUDED.website_search,
  has_api = EXCLUDED.has_api, api_type = EXCLUDED.api_type, e_filing_available = EXCLUDED.e_filing_available,
  online_payment = EXCLUDED.online_payment, capabilities = EXCLUDED.capabilities, status = EXCLUDED.status,
  priority_score = EXCLUDED.priority_score, updated_at = NOW();

-- REGIONAL OFFICES (Nivel D - 25%)
INSERT INTO public.ipo_offices (
  code, code_alt, name_official, name_short, country_code, country_name, flag_emoji,
  region, office_type, ip_types, timezone, languages, currency, tier,
  automation_level, automation_percentage, website_official, has_api, e_filing_available,
  online_payment, capabilities, status, priority_score
) VALUES
('OA', 'OAPI', 'Organisation Africaine de la Propriété Intellectuelle', 'OAPI', NULL, 'OAPI Member States', '🌍', 'africa', 'regional', ARRAY['trademark', 'patent', 'design'], 'Africa/Douala', ARRAY['fr'], 'XOF', 2, 'D', 25, 'https://www.oapi.int', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 60),
('AP', 'ARIPO', 'African Regional Intellectual Property Organization', 'ARIPO', NULL, 'ARIPO Member States', '🌍', 'africa', 'regional', ARRAY['trademark', 'patent', 'design'], 'Africa/Harare', ARRAY['en'], 'USD', 2, 'D', 25, 'https://www.aripo.org', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 60),
('BX', 'BOIP', 'Benelux Office for Intellectual Property', 'BOIP', NULL, 'Benelux', '🇪🇺', 'europe', 'regional', ARRAY['trademark', 'design'], 'Europe/Brussels', ARRAY['nl', 'fr', 'de'], 'EUR', 2, 'D', 25, 'https://www.boip.int', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 70),
('EA', 'EAPO', 'Eurasian Patent Organization', 'EAPO', NULL, 'Eurasian States', '🌐', 'asia_pacific', 'regional', ARRAY['patent'], 'Europe/Moscow', ARRAY['ru', 'en'], 'USD', 2, 'D', 25, 'https://www.eapo.org', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 60),
('GC', 'GCCPO', 'Gulf Cooperation Council Patent Office', 'GCCPO', NULL, 'GCC States', '🌐', 'middle_east', 'regional', ARRAY['patent'], 'Asia/Riyadh', ARRAY['ar', 'en'], 'SAR', 2, 'D', 25, 'https://www.gccpo.org', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 55)
ON CONFLICT (code) DO UPDATE SET
  code_alt = EXCLUDED.code_alt, name_official = EXCLUDED.name_official, name_short = EXCLUDED.name_short,
  country_code = EXCLUDED.country_code, country_name = EXCLUDED.country_name, flag_emoji = EXCLUDED.flag_emoji,
  region = EXCLUDED.region, office_type = EXCLUDED.office_type, ip_types = EXCLUDED.ip_types,
  timezone = EXCLUDED.timezone, languages = EXCLUDED.languages, currency = EXCLUDED.currency, tier = EXCLUDED.tier,
  automation_level = EXCLUDED.automation_level, automation_percentage = EXCLUDED.automation_percentage,
  website_official = EXCLUDED.website_official, has_api = EXCLUDED.has_api, e_filing_available = EXCLUDED.e_filing_available,
  online_payment = EXCLUDED.online_payment, capabilities = EXCLUDED.capabilities, status = EXCLUDED.status,
  priority_score = EXCLUDED.priority_score, updated_at = NOW();

-- SECONDARY NATIONAL OFFICES (Nivel E - 0%)
INSERT INTO public.ipo_offices (
  code, code_alt, name_official, name_short, country_code, country_name, flag_emoji,
  region, office_type, ip_types, timezone, languages, currency, tier,
  automation_level, automation_percentage, website_official, has_api, e_filing_available,
  online_payment, capabilities, status, priority_score
) VALUES
('IN', 'IPO-IN', 'Intellectual Property India', 'IP India', 'IN', 'India', '🇮🇳', 'asia_pacific', 'national', ARRAY['trademark', 'patent', 'design'], 'Asia/Kolkata', ARRAY['en', 'hi'], 'INR', 3, 'E', 0, 'https://ipindia.gov.in', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 50),
('CH', 'IGE', 'Swiss Federal Institute of Intellectual Property', 'IGE/IPI', 'CH', 'Switzerland', '🇨🇭', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Zurich', ARRAY['de', 'fr', 'it', 'en'], 'CHF', 3, 'E', 0, 'https://www.ige.ch', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 55),
('NL', 'RVO', 'Netherlands Patent Office', 'Octrooicentrum', 'NL', 'Netherlands', '🇳🇱', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Amsterdam', ARRAY['nl', 'en'], 'EUR', 3, 'E', 0, 'https://www.rvo.nl/onderwerpen/octrooien', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 50),
('AT', 'OPA', 'Austrian Patent Office', 'ÖPA', 'AT', 'Austria', '🇦🇹', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Vienna', ARRAY['de'], 'EUR', 3, 'E', 0, 'https://www.patentamt.at', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 50),
('PL', 'UPRP', 'Patent Office of the Republic of Poland', 'UPRP', 'PL', 'Poland', '🇵🇱', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Warsaw', ARRAY['pl'], 'PLN', 3, 'E', 0, 'https://uprp.gov.pl', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 45),
('PT', 'INPI-PT', 'Instituto Nacional da Propriedade Industrial', 'INPI Portugal', 'PT', 'Portugal', '🇵🇹', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Lisbon', ARRAY['pt'], 'EUR', 3, 'E', 0, 'https://inpi.justica.gov.pt', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 50),
('SG', 'IPOS', 'Intellectual Property Office of Singapore', 'IPOS', 'SG', 'Singapore', '🇸🇬', 'asia_pacific', 'national', ARRAY['trademark', 'patent', 'design'], 'Asia/Singapore', ARRAY['en'], 'SGD', 3, 'E', 0, 'https://www.ipos.gov.sg', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 55),
('HK', 'HKIPD', 'Hong Kong Intellectual Property Department', 'HKIPD', 'HK', 'Hong Kong', '🇭🇰', 'asia_pacific', 'national', ARRAY['trademark', 'patent', 'design'], 'Asia/Hong_Kong', ARRAY['zh', 'en'], 'HKD', 3, 'E', 0, 'https://www.ipd.gov.hk', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 50),
('NZ', 'IPONZ', 'Intellectual Property Office of New Zealand', 'IPONZ', 'NZ', 'New Zealand', '🇳🇿', 'oceania', 'national', ARRAY['trademark', 'patent', 'design'], 'Pacific/Auckland', ARRAY['en'], 'NZD', 3, 'E', 0, 'https://www.iponz.govt.nz', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 50),
('RU', 'ROSPATENT', 'Federal Service for Intellectual Property', 'Rospatent', 'RU', 'Russia', '🇷🇺', 'europe', 'national', ARRAY['trademark', 'patent', 'design'], 'Europe/Moscow', ARRAY['ru'], 'RUB', 3, 'E', 0, 'https://rospatent.gov.ru', false, true, true, '{"filing": {"available": true, "method": "web"}}'::jsonb, 'active', 45)
ON CONFLICT (code) DO UPDATE SET
  code_alt = EXCLUDED.code_alt, name_official = EXCLUDED.name_official, name_short = EXCLUDED.name_short,
  country_code = EXCLUDED.country_code, country_name = EXCLUDED.country_name, flag_emoji = EXCLUDED.flag_emoji,
  region = EXCLUDED.region, office_type = EXCLUDED.office_type, ip_types = EXCLUDED.ip_types,
  timezone = EXCLUDED.timezone, languages = EXCLUDED.languages, currency = EXCLUDED.currency, tier = EXCLUDED.tier,
  automation_level = EXCLUDED.automation_level, automation_percentage = EXCLUDED.automation_percentage,
  website_official = EXCLUDED.website_official, has_api = EXCLUDED.has_api, e_filing_available = EXCLUDED.e_filing_available,
  online_payment = EXCLUDED.online_payment, capabilities = EXCLUDED.capabilities, status = EXCLUDED.status,
  priority_score = EXCLUDED.priority_score, updated_at = NOW();