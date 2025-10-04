'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface EducationStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const educationLevels = [
  {
    id: 'high-school',
    label: 'High School',
    description: 'Currently in or completed high school',
    icon: '🎓',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'undergraduate',
    label: 'Undergraduate',
    description: 'Currently pursuing or completed bachelor\'s degree',
    icon: '📚',
    color: 'from-purple-500 to-violet-400'
  },
  {
    id: 'graduate',
    label: 'Graduate',
    description: 'Currently pursuing or completed master\'s degree',
    icon: '🎓',
    color: 'from-indigo-500 to-blue-400'
  },
  {
    id: 'phd',
    label: 'PhD/Doctorate',
    description: 'Currently pursuing or completed doctoral degree',
    icon: '🔬',
    color: 'from-emerald-500 to-teal-400'
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Working professional, self-taught, or career-focused learning',
    icon: '💼',
    color: 'from-orange-500 to-red-400'
  },
  {
    id: 'lifelong-learner',
    label: 'Lifelong Learner',
    description: 'Learning for personal growth and curiosity',
    icon: '🌟',
    color: 'from-yellow-500 to-orange-400'
  }
];

export default function EducationStep({ data, onNext, onPrevious, onDataUpdate }: EducationStepProps) {
  const [selectedLevel, setSelectedLevel] = useState(data.educationLevel);

  const handleNext = () => {
    onDataUpdate({ educationLevel: selectedLevel });
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-light text-white">
          What's your education level?
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          This helps us tailor the learning experience to your background and knowledge level.
        </p>
      </div>

      {/* Education Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {educationLevels.map((level) => (
          <button
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 text-left ${
              selectedLevel === level.id
                ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/20 to-violet-500/20'
                : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />
            
            {/* Content */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{level.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white group-hover:text-cyan-300 transition-colors">
                    {level.label}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {level.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedLevel === level.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-violet-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ))}
      </div>

      {/* Additional Context */}
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Why we ask</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your education level helps us understand your learning context and adjust the complexity 
            of explanations, examples, and connections in your knowledge graph.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8">
        <button
          onClick={onPrevious}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-300"
        >
          ← Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!selectedLevel}
          className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium rounded-xl hover:from-cyan-500 hover:to-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
