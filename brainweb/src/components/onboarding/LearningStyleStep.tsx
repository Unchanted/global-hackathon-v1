'use client';

import { useState } from 'react';
import { OnboardingData } from '@/app/onboarding/page';

interface LearningStyleStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const learningStyleQuestions = [
  {
    id: 'visual',
    label: 'Visual Learning',
    description: 'I learn best through diagrams, charts, and visual representations',
    icon: '👁️',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'textual',
    label: 'Textual Learning',
    description: 'I prefer reading detailed explanations and written content',
    icon: '📖',
    color: 'from-purple-500 to-violet-400'
  },
  {
    id: 'active',
    label: 'Active Learning',
    description: 'I learn by doing, experimenting, and hands-on practice',
    icon: '⚡',
    color: 'from-orange-500 to-red-400'
  },
  {
    id: 'reflective',
    label: 'Reflective Learning',
    description: 'I learn by thinking through concepts and making connections',
    icon: '🤔',
    color: 'from-emerald-500 to-teal-400'
  }
];

export default function LearningStyleStep({ data, onNext, onPrevious, onDataUpdate }: LearningStyleStepProps) {
  const [learningStyle, setLearningStyle] = useState(data.learningStyle);

  const handleStyleChange = (styleId: keyof typeof learningStyle, value: number) => {
    setLearningStyle(prev => ({
      ...prev,
      [styleId]: value
    }));
  };

  const handleNext = () => {
    onDataUpdate({ learningStyle });
    onNext();
  };

  const getSliderColor = (value: number) => {
    if (value <= 2) return 'from-gray-500 to-gray-400';
    if (value <= 4) return 'from-yellow-500 to-orange-400';
    if (value <= 6) return 'from-orange-500 to-red-400';
    return 'from-red-500 to-pink-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-light text-white">
          How do you learn best?
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Rate each learning style from 1 (not for me) to 7 (perfect for me). 
          This helps us personalize your learning experience.
        </p>
      </div>

      {/* Learning Style Questions */}
      <div className="space-y-6 max-w-3xl mx-auto">
        {learningStyleQuestions.map((style) => (
          <div key={style.id} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-3xl">{style.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white mb-2">
                  {style.label}
                </h3>
                <p className="text-sm text-gray-400">
                  {style.description}
                </p>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not for me</span>
                <span>Perfect for me</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={learningStyle[style.id as keyof typeof learningStyle]}
                  onChange={(e) => handleStyleChange(style.id as keyof typeof learningStyle, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, ${getSliderColor(learningStyle[style.id as keyof typeof learningStyle]).split(' ')[1]} 0%, ${getSliderColor(learningStyle[style.id as keyof typeof learningStyle]).split(' ')[3]} 100%)`
                  }}
                />
                
                {/* Custom Slider Thumb */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full shadow-lg cursor-pointer"
                  style={{
                    left: `calc(${((learningStyle[style.id as keyof typeof learningStyle] - 1) / 6) * 100}% - 12px)`
                  }}
                />
              </div>

              {/* Value Display */}
              <div className="flex justify-center">
                <div className="bg-gray-700 rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-white">
                    {learningStyle[style.id as keyof typeof learningStyle]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Style Summary */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Your Learning Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {learningStyleQuestions.map((style) => (
              <div key={style.id} className="flex items-center justify-between">
                <span className="text-gray-400">{style.label}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getSliderColor(learningStyle[style.id as keyof typeof learningStyle])} transition-all duration-300`}
                      style={{ width: `${(learningStyle[style.id as keyof typeof learningStyle] / 7) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-4 text-center">
                    {learningStyle[style.id as keyof typeof learningStyle]}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
          className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium rounded-xl hover:from-cyan-500 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
        >
          Continue
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(to right, #00E5FF, #9D4EDD);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 229, 255, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(to right, #00E5FF, #9D4EDD);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 229, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
