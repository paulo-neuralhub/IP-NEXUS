import * as React from 'react';
import { useState } from 'react';
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
import { ProfileSelector } from '@/components/market/landing/ProfileSelector';
import { ParticularWizard } from '@/components/market/landing/ParticularWizard';

type LandingView = 'landing' | 'selector' | 'wizard';

export default function MarketLandingPage() {
  const { data: stats } = usePublicStats();
  const { data: topAgents } = useTopAgentsPublic(8);
  const [view, setView] = useState<LandingView>('landing');

  // Profile selector
  if (view === 'selector') {
    return (
      <div className="min-h-screen" style={{ background: '#f1f4f9' }}>
        <LandingHeader />
        <ProfileSelector onSelectParticular={() => setView('wizard')} />
        <LandingFooter />
      </div>
    );
  }

  // Particular wizard
  if (view === 'wizard') {
    return (
      <div className="min-h-screen" style={{ background: '#f1f4f9' }}>
        <LandingHeader />
        <ParticularWizard onBack={() => setView('selector')} />
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <HeroSection onParticularClick={() => setView('wizard')} onSelectorClick={() => setView('selector')} />
      
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
