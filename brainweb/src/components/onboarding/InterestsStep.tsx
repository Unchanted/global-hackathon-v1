'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface InterestsStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const interestCategories = [
  { id: 'mathematics', label: 'Mathematics', icon: '∑', color: 'burnished-bronze' },
  { id: 'science', label: 'Science', icon: '⚗️', color: 'verdant-teal' },
  { id: 'technology', label: 'Technology', icon: '💻', color: 'burnished-bronze' },
  { id: 'biology', label: 'Biology', icon: '🧬', color: 'verdant-teal' },
  { id: 'physics', label: 'Physics', icon: '⚛️', color: 'burnished-bronze' },
  { id: 'chemistry', label: 'Chemistry', icon: '🧪', color: 'verdant-teal' },
  { id: 'history', label: 'History', icon: '📜', color: 'burnished-bronze' },
  { id: 'literature', label: 'Literature', icon: '📚', color: 'verdant-teal' },
  { id: 'philosophy', label: 'Philosophy', icon: '🤔', color: 'burnished-bronze' },
  { id: 'psychology', label: 'Psychology', icon: '🧠', color: 'verdant-teal' },
  { id: 'economics', label: 'Economics', icon: '💰', color: 'burnished-bronze' },
  { id: 'art', label: 'Art & Design', icon: '🎨', color: 'verdant-teal' },
];

export default function InterestsStep({ data, onNext, onPrevious, onDataUpdate }: InterestsStepProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.interests);

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    onDataUpdate({ interests: selectedInterests });
    onNext();
  };

  return (
    <div className="spacing-cognitive">
      {/* Header */}
      <div className="text-center spacing-cognitive">
        <h2 className="text-3xl text-cognitive-title">
          What interests you?
        </h2>
        <p className="text-text-secondary max-w-lg mx-auto text-cognitive-body">
          Select the subjects and domains that spark your curiosity. This helps us build your personalized knowledge graph.
        </p>
      </div>

      {/* Interest Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {interestCategories.map((interest) => (
          <button
            key={interest.id}
            onClick={() => handleInterestToggle(interest.id)}
            className={`group relative padding-cognitive rounded-cognitive border-2 motion-cognitive cognitive-hover ${
              selectedInterests.includes(interest.id)
                ? 'border-burnished-bronze bg-burnished-bronze/20 shadow-cognitive-halo'
                : 'border-soft-carbon bg-graphene-grey/20 hover:border-soft-carbon/50'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-${interest.color}/10 opacity-0 group-hover:opacity-100 motion-cognitive rounded-cognitive`} />
            
            {/* Content */}
            <div className="relative z-10 spacing-cognitive">
              <div className="text-3xl">{interest.icon}</div>
              <div className="text-sm text-cognitive-label text-text-primary group-hover:text-burnished-bronze motion-cognitive">
                {interest.label}
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedInterests.includes(interest.id) && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-burnished-bronze rounded-full flex items-center justify-center shadow-cognitive-halo">
                <div className="w-2 h-2 bg-charcoal-slate rounded-full" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Interest Input */}
      <div className="max-w-md mx-auto">
        <label className="block text-text-secondary text-sm text-cognitive-label mb-3">
          Don't see your interest? Add it here:
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g., Astronomy, Music Theory..."
            className="input-cognitive flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                const customInterest = e.currentTarget.value.trim().toLowerCase().replace(/\s+/g, '-');
                if (!selectedInterests.includes(customInterest)) {
                  setSelectedInterests(prev => [...prev, customInterest]);
                }
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
      </div>

      {/* Selected Count */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 padding-cognitive panel-cognitive">
          <div className="w-2 h-2 bg-burnished-bronze rounded-full animate-cognitive-pulse" />
          <span className="text-sm text-text-secondary text-cognitive-label">
            {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-text-secondary hover:text-text-primary motion-cognitive text-cognitive-label"
        >
          ← Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={selectedInterests.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed motion-cognitive cognitive-hover disabled:hover:scale-100"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
