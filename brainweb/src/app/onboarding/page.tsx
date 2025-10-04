'use client';

import { useState } from 'react';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import InterestsStep from '@/components/onboarding/InterestsStep';
import EducationStep from '@/components/onboarding/EducationStep';
import LearningStyleStep from '@/components/onboarding/LearningStyleStep';
import FamiliarityStep from '@/components/onboarding/FamiliarityStep';
import CompletionStep from '@/components/onboarding/CompletionStep';

export interface OnboardingData {
  name: string;
  interests: string[];
  educationLevel: string;
  learningStyle: {
    visual: number;
    textual: number;
    active: number;
    reflective: number;
  };
  familiarity: Record<string, number>;
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    interests: [],
    educationLevel: '',
    learningStyle: {
      visual: 0,
      textual: 0,
      active: 0,
      reflective: 0,
    },
    familiarity: {},
  });

  const steps = [
    { component: WelcomeStep, title: 'Welcome' },
    { component: InterestsStep, title: 'Interests' },
    { component: EducationStep, title: 'Education' },
    { component: LearningStyleStep, title: 'Learning Style' },
    { component: FamiliarityStep, title: 'Familiarity' },
    { component: CompletionStep, title: 'Complete' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataUpdate = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-charcoal-slate graph-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-soft-carbon">
          <div 
            className="h-full progress-bronze motion-cognitive"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Counter */}
      <div className="fixed top-4 right-4 z-50">
        <div className="panel-cognitive padding-cognitive">
          <span className="text-sm text-text-secondary text-cognitive-label">
            {currentStep + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen padding-cognitive">
        <div className="w-full max-w-2xl">
          <CurrentStepComponent
            data={onboardingData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onDataUpdate={handleDataUpdate}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
          />
        </div>
      </div>

      {/* Background Cognitive Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-gradient-radial from-burnished-bronze/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-radial from-verdant-teal/20 via-transparent to-transparent transform scale-150" />
      </div>
    </div>
  );
}
