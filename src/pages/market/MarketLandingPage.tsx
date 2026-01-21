import { usePublicStats, useTopAgentsPublic } from '@/hooks/market/usePublicMarketData';
import {
  LandingHeader,
  HeroSection,
  StatsBar,
  TopAgentsSection,
  HowItWorksSection,
  ServiceCategoriesSection,
  ForAgentsCTA,
  TestimonialsSection,
  FinalCTA,
  LandingFooter,
} from '@/components/market/landing';

export default function MarketLandingPage() {
  const { data: stats } = usePublicStats();
  const { data: topAgents } = useTopAgentsPublic(8);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <HeroSection />
      
      <StatsBar 
        totalAgents={stats?.totalAgents || 150}
        avgSuccess={stats?.avgSuccess || 98}
        totalTransactions={stats?.totalTransactions || 500}
        avgRating={stats?.avgRating || '4.8'}
      />
      
      <TopAgentsSection agents={topAgents} />
      
      <HowItWorksSection />
      
      <ServiceCategoriesSection />
      
      <ForAgentsCTA />
      
      <TestimonialsSection />
      
      <FinalCTA />
      
      <LandingFooter />
    </div>
  );
}
