'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingData } from '@/app/onboarding/page';

interface CompletionStepProps {
  data: OnboardingData;
  onNext: () => void;
  onPrevious: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function CompletionStep({ data }: CompletionStepProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setTimeout(() => setShowGraph(true), 1000);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    // Save onboarding data (in a real app, this would be sent to the backend)
    localStorage.setItem('brainweb-onboarding', JSON.stringify(data));
    localStorage.setItem('brainweb-user', JSON.stringify({ name: data.name, completedOnboarding: true }));
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className={`transition-all duration-1000 ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-400 to-violet-500 rounded-full flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-light text-white">
          Welcome to your Second Brain, {data.name}!
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Your personalized knowledge graph is ready. Let's explore your learning journey.
        </p>
      </div>

      {/* Brain Graph Preview */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700 min-h-[400px] relative overflow-hidden">
          {/* Graph Visualization */}
          <div className={`transition-all duration-2000 ${showGraph ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Central User Node */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-lg">You</span>
              </div>
            </div>

            {/* Interest Nodes */}
            {data.interests.slice(0, 6).map((interest, index) => {
              const angle = (index / data.interests.length) * 2 * Math.PI;
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div key={interest} className="absolute" style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {interest.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Connection Line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{
                    left: `calc(-${x}px)`,
                    top: `calc(-${y}px)`
                  }}>
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`calc(50% + ${x}px)`}
                      y2={`calc(50% + ${y}px)`}
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00E5FF" />
                        <stop offset="100%" stopColor="#9D4EDD" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              );
            })}

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${30 + (i * 8)}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '3s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Graph Info */}
          <div className={`absolute bottom-4 left-4 right-4 transition-all duration-1000 delay-1000 ${showGraph ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{data.interests.length}</div>
                  <div className="text-xs text-gray-400">Interests</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-violet-400">{data.educationLevel}</div>
                  <div className="text-xs text-gray-400">Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lime-400">∞</div>
                  <div className="text-xs text-gray-400">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Your Learning Profile</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Education Level:</span>
              <span className="text-white capitalize">{data.educationLevel.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Learning Style:</span>
              <span className="text-white">
                {Object.entries(data.learningStyle)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 2)
                  .map(([style]) => style.charAt(0).toUpperCase() + style.slice(1))
                  .join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Interests:</span>
              <span className="text-white">{data.interests.length} selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center pt-8">
        <button
          onClick={handleComplete}
          className="px-12 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-medium rounded-xl hover:from-cyan-500 hover:to-violet-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-400/25"
        >
          Enter Your Second Brain
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          You can always update your preferences in settings
        </p>
      </div>
    </div>
  );
}
