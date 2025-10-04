'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const userData = localStorage.getItem('brainweb-user');
    
    if (userData) {
      const user = JSON.parse(userData);
      if (user.completedOnboarding) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } else {
      router.push('/onboarding');
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-slate text-text-primary flex items-center justify-center graph-background">
        <div className="text-center spacing-cognitive">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-burnished-bronze to-accent-gold rounded-full flex items-center justify-center animate-cognitive-glow shadow-cognitive-elevated">
              <div className="w-20 h-20 bg-charcoal-slate rounded-full flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-burnished-bronze to-accent-gold rounded-full animate-cognitive-pulse" />
              </div>
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto bg-burnished-bronze/20 rounded-full animate-cognitive-float" />
          </div>
          
          <h1 className="text-5xl text-cognitive-title mt-cognitive-lg">
            Brain<span className="text-burnished-bronze">Web</span>
          </h1>
          <p className="text-text-secondary text-cognitive-body mt-cognitive-sm">Loading your Second Brain...</p>
          
          <div className="w-80 h-2 bg-soft-carbon rounded-full overflow-hidden mx-auto mt-cognitive-lg">
            <div className="h-full progress-bronze animate-cognitive-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}