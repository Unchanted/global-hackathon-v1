'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface WelcomeStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function WelcomeStep({ data, onNext, onDataUpdate }: WelcomeStepProps) {
  const [name, setName] = useState(data.name);

  const handleNext = () => {
    onDataUpdate({ name });
    onNext();
  };

  return (
    <div className="text-center spacing-cognitive">
      {/* Logo/Brand */}
      <div className="spacing-cognitive">
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-burnished-bronze to-accent-gold rounded-full flex items-center justify-center animate-cognitive-glow shadow-cognitive-elevated">
            <div className="w-20 h-20 bg-charcoal-slate rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-burnished-bronze to-accent-gold rounded-full animate-cognitive-pulse" />
            </div>
          </div>
          <div className="absolute inset-0 w-32 h-32 mx-auto bg-burnished-bronze/20 rounded-full animate-cognitive-float" />
        </div>
        
        <h1 className="text-6xl text-cognitive-title mt-cognitive-lg">
          Brain<span className="text-burnished-bronze">Web</span>
        </h1>
        <p className="text-xl text-text-secondary text-cognitive-label mt-cognitive-sm">
          Your Second Brain for Learning
        </p>
      </div>

      {/* Description */}
      <div className="spacing-cognitive max-w-2xl mx-auto">
        <p className="text-text-secondary leading-cognitive text-cognitive-body text-lg">
          Welcome to BrainWeb, where learning becomes a living, connected experience. 
          We'll help you build your personal knowledge graph that grows and evolves with you.
        </p>
        
        <div className="flex items-center justify-center space-x-12 text-sm text-text-muted mt-cognitive-md">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-burnished-bronze rounded-full animate-cognitive-pulse shadow-cognitive-halo" />
            <span className="text-cognitive-label">Graph-Based Learning</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-verdant-teal rounded-full animate-cognitive-pulse shadow-cognitive-glow" />
            <span className="text-cognitive-label">Personalized Intelligence</span>
          </div>
        </div>
      </div>

      {/* Name Input */}
      <div className="spacing-cognitive max-w-md mx-auto">
        <label className="block text-text-secondary text-lg text-cognitive-label mb-cognitive-sm">
          What should we call you?
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="input-cognitive w-full px-cognitive-md py-cognitive-sm text-lg"
            autoFocus
          />
          <div className="absolute inset-0 bg-gradient-cognitive rounded-cognitive pointer-events-none opacity-0 transition-opacity duration-200 focus-within:opacity-100" />
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-cognitive-lg">
        <button
          onClick={handleNext}
          disabled={!name.trim()}
          className="btn-primary px-cognitive-lg py-cognitive-sm text-lg disabled:opacity-50 disabled:cursor-not-allowed motion-cognitive cognitive-hover disabled:hover:scale-100"
        >
          Begin Your Journey
        </button>
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-burnished-bronze/40 rounded-full animate-cognitive-float shadow-cognitive-halo" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-verdant-teal/50 rounded-full animate-cognitive-float delay-1000 shadow-cognitive-glow" />
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-arctic-sand/30 rounded-full animate-cognitive-float delay-2000" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-accent-blue/40 rounded-full animate-cognitive-float delay-3000" />
      </div>
    </div>
  );
}
