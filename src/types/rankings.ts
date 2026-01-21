// =====================================================
// TIPOS PARA SISTEMA DE RANKINGS Y BADGES
// =====================================================

import { MarketUser } from './market-users';

// =====================================================
// RANKING TYPES
// =====================================================

export type RankingCategory = 
  | 'global'
  | 'trademark'
  | 'patent'
  | 'country_es'
  | 'country_us'
  | 'country_eu'
  | 'rising';

export interface AgentRanking {
  id: string;
  ranking_date: string;
  agent_id: string;
  rank_position: number;
  rank_previous?: number | null;
  rank_change: number;
  rank_percentile: number;
  reputation_score: number;
  rating_avg: number;
  success_rate: number;
  response_time_avg: number;
  total_transactions: number;
  ranking_category: RankingCategory;
  jurisdiction?: string | null;
  created_at: string;
  
  // Joined
  agent?: Pick<MarketUser, 
    'id' | 'display_name' | 'avatar_url' | 'company_name' | 
    'country' | 'is_verified_agent' | 'badges' | 'jurisdictions'
  >;
}

// =====================================================
// BADGE TYPES
// =====================================================

export type BadgeType =
  // Performance
  | 'top_1'
  | 'top_3'
  | 'top_10'
  | 'top_performer'
  // Speed
  | 'fast_responder'
  | 'lightning_fast'
  // Volume
  | 'trusted_agent'
  | 'veteran'
  | 'master'
  // Quality
  | 'five_star'
  | 'highly_rated'
  | 'perfect_record'
  // Specialization
  | 'expert_trademarks'
  | 'expert_patents'
  | 'expert_litigation'
  // Reach
  | 'multilingual'
  | 'global_reach'
  | 'eu_specialist'
  | 'us_specialist'
  // Engagement
  | 'rising_star'
  | 'comeback'
  | 'consistent'
  // Verification
  | 'verified_pro'
  | 'premium_member';

export interface AgentBadge {
  id: string;
  agent_id: string;
  badge_type: BadgeType;
  earned_at: string;
  expires_at?: string | null;
  context?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeDetails {
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
  color: string;
  tier: BadgeTier;
}

// =====================================================
// CONFIGURATION
// =====================================================

export const BADGE_DETAILS: Record<BadgeType, BadgeDetails> = {
  top_1: {
    label: '#1 Agent',
    labelEs: 'Agente #1',
    description: 'Ranked #1 overall',
    descriptionEs: 'Número 1 del ranking',
    icon: 'Crown',
    color: 'yellow',
    tier: 'platinum',
  },
  top_3: {
    label: 'Top 3',
    labelEs: 'Top 3',
    description: 'Ranked in top 3',
    descriptionEs: 'Entre los 3 mejores',
    icon: 'Medal',
    color: 'yellow',
    tier: 'gold',
  },
  top_10: {
    label: 'Top 10',
    labelEs: 'Top 10',
    description: 'Ranked in top 10',
    descriptionEs: 'Entre los 10 mejores',
    icon: 'Award',
    color: 'orange',
    tier: 'gold',
  },
  top_performer: {
    label: 'Top Performer',
    labelEs: 'Top Performer',
    description: 'Top 10% of all agents',
    descriptionEs: 'Top 10% de todos los agentes',
    icon: 'TrendingUp',
    color: 'purple',
    tier: 'silver',
  },
  fast_responder: {
    label: 'Fast Responder',
    labelEs: 'Respuesta Rápida',
    description: 'Average response under 2 hours',
    descriptionEs: 'Respuesta promedio menor a 2 horas',
    icon: 'Zap',
    color: 'blue',
    tier: 'silver',
  },
  lightning_fast: {
    label: 'Lightning Fast',
    labelEs: 'Ultrarrápido',
    description: 'Average response under 30 minutes',
    descriptionEs: 'Respuesta promedio menor a 30 minutos',
    icon: 'Bolt',
    color: 'cyan',
    tier: 'gold',
  },
  trusted_agent: {
    label: 'Trusted Agent',
    labelEs: 'Agente de Confianza',
    description: '50+ completed transactions',
    descriptionEs: '50+ transacciones completadas',
    icon: 'Shield',
    color: 'green',
    tier: 'silver',
  },
  veteran: {
    label: 'Veteran',
    labelEs: 'Veterano',
    description: '100+ completed transactions',
    descriptionEs: '100+ transacciones completadas',
    icon: 'Star',
    color: 'amber',
    tier: 'gold',
  },
  master: {
    label: 'Master',
    labelEs: 'Maestro',
    description: '250+ completed transactions',
    descriptionEs: '250+ transacciones completadas',
    icon: 'Gem',
    color: 'purple',
    tier: 'platinum',
  },
  five_star: {
    label: 'Five Star',
    labelEs: 'Cinco Estrellas',
    description: 'Perfect 5.0 rating',
    descriptionEs: 'Rating perfecto de 5.0',
    icon: 'Star',
    color: 'yellow',
    tier: 'gold',
  },
  highly_rated: {
    label: 'Highly Rated',
    labelEs: 'Muy Valorado',
    description: '4.8+ rating with 20+ reviews',
    descriptionEs: 'Rating 4.8+ con 20+ reseñas',
    icon: 'ThumbsUp',
    color: 'green',
    tier: 'silver',
  },
  perfect_record: {
    label: 'Perfect Record',
    labelEs: 'Récord Perfecto',
    description: '100% success rate',
    descriptionEs: '100% tasa de éxito',
    icon: 'CheckCircle',
    color: 'emerald',
    tier: 'gold',
  },
  expert_trademarks: {
    label: 'Trademark Expert',
    labelEs: 'Experto en Marcas',
    description: 'Specialized in trademarks',
    descriptionEs: 'Especializado en marcas',
    icon: 'Tag',
    color: 'pink',
    tier: 'silver',
  },
  expert_patents: {
    label: 'Patent Expert',
    labelEs: 'Experto en Patentes',
    description: 'Specialized in patents',
    descriptionEs: 'Especializado en patentes',
    icon: 'FileText',
    color: 'indigo',
    tier: 'silver',
  },
  expert_litigation: {
    label: 'Litigation Expert',
    labelEs: 'Experto en Litigios',
    description: 'Specialized in IP litigation',
    descriptionEs: 'Especializado en litigios de PI',
    icon: 'Gavel',
    color: 'red',
    tier: 'gold',
  },
  multilingual: {
    label: 'Multilingual',
    labelEs: 'Multilingüe',
    description: 'Speaks 3+ languages',
    descriptionEs: 'Habla 3+ idiomas',
    icon: 'Languages',
    color: 'cyan',
    tier: 'bronze',
  },
  global_reach: {
    label: 'Global Reach',
    labelEs: 'Alcance Global',
    description: 'Operates in 5+ jurisdictions',
    descriptionEs: 'Opera en 5+ jurisdicciones',
    icon: 'Globe',
    color: 'teal',
    tier: 'silver',
  },
  eu_specialist: {
    label: 'EU Specialist',
    labelEs: 'Especialista UE',
    description: 'Expert in EU IP matters',
    descriptionEs: 'Experto en PI de la UE',
    icon: 'Flag',
    color: 'blue',
    tier: 'silver',
  },
  us_specialist: {
    label: 'US Specialist',
    labelEs: 'Especialista US',
    description: 'Expert in US IP matters',
    descriptionEs: 'Experto en PI de EE.UU.',
    icon: 'Flag',
    color: 'red',
    tier: 'silver',
  },
  rising_star: {
    label: 'Rising Star',
    labelEs: 'Estrella en Ascenso',
    description: 'New agent with excellent metrics',
    descriptionEs: 'Nuevo agente con métricas excelentes',
    icon: 'Sparkles',
    color: 'orange',
    tier: 'bronze',
  },
  comeback: {
    label: 'Comeback',
    labelEs: 'Remontada',
    description: 'Significantly improved ranking',
    descriptionEs: 'Mejoró significativamente su ranking',
    icon: 'ArrowUp',
    color: 'green',
    tier: 'bronze',
  },
  consistent: {
    label: 'Consistent',
    labelEs: 'Consistente',
    description: '12 months in top 20%',
    descriptionEs: '12 meses en el top 20%',
    icon: 'Activity',
    color: 'blue',
    tier: 'gold',
  },
  verified_pro: {
    label: 'Verified Professional',
    labelEs: 'Profesional Verificado',
    description: 'License verified by IP-NEXUS',
    descriptionEs: 'Licencia verificada por IP-NEXUS',
    icon: 'BadgeCheck',
    color: 'green',
    tier: 'silver',
  },
  premium_member: {
    label: 'Premium Member',
    labelEs: 'Miembro Premium',
    description: 'Premium subscription active',
    descriptionEs: 'Suscripción premium activa',
    icon: 'Crown',
    color: 'purple',
    tier: 'gold',
  },
};

export const RANKING_CATEGORY_LABELS: Record<RankingCategory, { en: string; es: string }> = {
  global: { en: 'Global', es: 'Global' },
  trademark: { en: 'Trademarks', es: 'Marcas' },
  patent: { en: 'Patents', es: 'Patentes' },
  country_es: { en: 'Spain', es: 'España' },
  country_us: { en: 'United States', es: 'Estados Unidos' },
  country_eu: { en: 'European Union', es: 'Unión Europea' },
  rising: { en: 'Rising Stars', es: 'Estrellas en Ascenso' },
};

export const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: 'bg-amber-100 text-amber-700 border-amber-300',
  silver: 'bg-gray-100 text-gray-600 border-gray-300',
  gold: 'bg-yellow-100 text-yellow-700 border-yellow-400',
  platinum: 'bg-purple-100 text-purple-700 border-purple-400',
};
