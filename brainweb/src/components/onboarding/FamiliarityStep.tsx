'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface FamiliarityStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const familiarityLevels = [
  { value: 1, label: 'Beginner', description: 'No prior knowledge', color: 'from-gray-500 to-gray-400' },
  { value: 2, label: 'Novice', description: 'Basic awareness', color: 'from-red-500 to-orange-400' },
  { value: 3, label: 'Familiar', description: 'Some understanding', color: 'from-orange-500 to-yellow-400' },
  { value: 4, label: 'Competent', description: 'Good working knowledge', color: 'from-yellow-500 to-green-400' },
  { value: 5, label: 'Proficient', description: 'Strong understanding', color: 'from-green-500 to-emerald-400' },
  { value: 6, label: 'Expert', description: 'Deep expertise', color: 'from-emerald-500 to-cyan-400' },
  { value: 7, label: 'Master', description: 'Complete mastery', color: 'from-cyan-400 to-violet-500' }
];

export default function FamiliarityStep({ data, onNext, onPrevious, onDataUpdate }: FamiliarityStepProps) {
  const [familiarity, setFamiliarity] = useState<Record<string, number>>(data.familiarity);
  const [currentSubject, setCurrentSubject] = useState(0);

  // Get subjects from interests
  const subjects = data.interests.length > 0 ? data.interests : ['mathematics', 'science', 'technology'];

  const handleFamiliarityChange = (subject: string, value: number) => {
    setFamiliarity(prev => ({
      ...prev,
      [subject]: value
    }));
  };

  const handleNext = () => {
    if (currentSubject < subjects.length - 1) {
      setCurrentSubject(currentSubject + 1);
    } else {
      onDataUpdate({ familiarity });
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentSubject > 0) {
      setCurrentSubject(currentSubject - 1);
    } else {
      onPrevious();
    }
  };

  const currentSubjectName = subjects[currentSubject];
  const currentFamiliarity = familiarity[currentSubjectName] || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-light text-white">
          How familiar are you with each subject?
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Rate your current knowledge level for each of your selected interests. 
          This helps us build your personalized learning path.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-md mx-auto">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Subject {currentSubject + 1} of {subjects.length}</span>
          <span>{Math.round(((currentSubject + 1) / subjects.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-violet-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentSubject + 1) / subjects.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Subject */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-light text-white capitalize">
                {currentSubjectName.replace('-', ' ')}
              </h3>
              <p className="text-gray-400">
                How would you rate your current knowledge level?
              </p>
            </div>

            {/* Familiarity Levels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {familiarityLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleFamiliarityChange(currentSubjectName, level.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    currentFamiliarity === level.value
                      ? 'border-cyan-400 bg-gradient-to-br from-cyan-400/20 to-violet-500/20'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${level.color} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{level.value}</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">{level.label}</div>
                      <div className="text-gray-400 text-sm">{level.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Current Selection Display */}
            <div className="pt-4">
              <div className="inline-flex items-center space-x-3 px-4 py-2 bg-gray-700 rounded-full">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${familiarityLevels.find(l => l.value === currentFamiliarity)?.color}`} />
                <span className="text-sm text-gray-300">
                  Selected: {familiarityLevels.find(l => l.value === currentFamiliarity)?.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Preview */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Your Knowledge Map Preview</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {subjects.map((subject, index) => (
              <div
                key={subject}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                  index === currentSubject
                    ? 'bg-gradient-to-r from-cyan-400 to-violet-500 text-white'
                    : index < currentSubject
                    ? 'bg-gray-600 text-gray-300'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {subject.replace('-', ' ')}
                {index < currentSubject && (
                  <span className="ml-1">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8">
        <button
          onClick={handlePrevious}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors duration-300"
        >
          ← Back
        </button>
        
        <button
          onClick={handleNext}
          className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium rounded-xl hover:from-cyan-500 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
        >
          {currentSubject < subjects.length - 1 ? 'Next Subject' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
}
