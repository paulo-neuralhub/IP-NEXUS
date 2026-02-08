import * as React from 'react';
import { useState } from 'react';
import {
  LandingHeader,
  HeroSection,
  StatsBar,
  HowItWorksSection,
  ServiceCategoriesSection,
  ForAgentsCTA,
  FinalCTA,
  LandingFooter,
  TopAgentsSection,
} from '@/components/market/landing';
import { ParticularWizard } from '@/components/market/landing/ParticularWizard';

export default function MarketLandingPage() {
  const [showWizard, setShowWizard] = useState(false);

  if (showWizard) {
    return (
      <div className="min-h-screen" style={{ background: '#F5F3FF', fontFamily: "'Inter', sans-serif" }}>
        <LandingHeader />
        <ParticularWizard onBack={() => setShowWizard(false)} />
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <HeroSection onParticularClick={() => setShowWizard(true)} />
      <StatsBar />
      <HowItWorksSection />
      <ForAgentsCTA onParticularClick={() => setShowWizard(true)} />
      <ServiceCategoriesSection />
      <TopAgentsSection />
      <FinalCTA onParticularClick={() => setShowWizard(true)} />
      <LandingFooter />
    </div>
  );
}
