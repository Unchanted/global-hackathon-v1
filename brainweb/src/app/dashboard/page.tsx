'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading the user's brain graph
  setTimeout(() => setIsLoading(false), 2000);

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
          </div>
          
          <h1 className="text-4xl text-cognitive-title mt-cognitive-lg">
            Brain<span className="text-burnished-bronze">Web</span>
          </h1>
          <p className="text-text-secondary text-cognitive-body mt-cognitive-sm">Building your Second Brain...</p>
          
          <div className="w-80 h-3 bg-soft-carbon rounded-full overflow-hidden mx-auto mt-cognitive-lg">
            <div className="h-full progress-bronze animate-cognitive-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-slate graph-background">
      {/* Enhanced Header */}
      <header className="border-b border-soft-carbon glass-effect">
        <div className="max-w-7xl mx-auto padding-cognitive">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-burnished-bronze to-accent-gold rounded-full flex items-center justify-center shadow-cognitive-halo">
                <div className="w-6 h-6 bg-charcoal-slate rounded-full" />
              </div>
              <h1 className="text-2xl text-cognitive-title">
                Brain<span className="text-burnished-bronze">Web</span>
              </h1>
            </div>
            
            <nav className="flex space-x-8">
              <a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-cognitive-label text-lg">Dashboard</a>
              <a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-cognitive-label text-lg">Notebooks</a>
              <a href="#" className="text-text-secondary hover:text-text-primary transition-colors text-cognitive-label text-lg">Settings</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="max-w-7xl mx-auto padding-cognitive py-cognitive-xl">
        <div className="spacing-cognitive">
          {/* Welcome Section */}
          <div className="text-center spacing-cognitive">
            <h2 className="text-4xl text-cognitive-title">
              Welcome to your Second Brain
            </h2>
            <p className="text-text-secondary max-w-3xl mx-auto text-cognitive-body text-lg">
              Your personalized knowledge graph is ready. Start creating notebooks and building connections between concepts.
            </p>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-cognitive-lg">
            <div className="card-cognitive padding-cognitive cognitive-hover">
              <div className="text-center spacing-cognitive">
                <div className="w-16 h-16 bg-gradient-to-br from-burnished-bronze to-accent-gold rounded-full flex items-center justify-center mx-auto shadow-cognitive-elevated">
                  <span className="text-charcoal-slate text-2xl">📚</span>
                </div>
                <h3 className="text-xl text-cognitive-label text-text-primary">Create Notebook</h3>
                <p className="text-text-secondary text-cognitive-body">Start a new learning journey</p>
                <button className="w-full btn-primary motion-cognitive mt-cognitive-sm">
                  Get Started
                </button>
              </div>
            </div>

            <div className="card-cognitive padding-cognitive cognitive-hover">
              <div className="text-center spacing-cognitive">
                <div className="w-16 h-16 bg-gradient-to-br from-verdant-teal to-accent-green rounded-full flex items-center justify-center mx-auto shadow-cognitive-glow">
                  <span className="text-charcoal-slate text-2xl">🧠</span>
                </div>
                <h3 className="text-xl text-cognitive-label text-text-primary">Explore Graph</h3>
                <p className="text-text-secondary text-cognitive-body">Navigate your knowledge network</p>
                <button className="w-full btn-accent motion-cognitive mt-cognitive-sm">
                  Explore
                </button>
              </div>
            </div>

            <div className="card-cognitive padding-cognitive cognitive-hover">
              <div className="text-center spacing-cognitive">
                <div className="w-16 h-16 bg-gradient-to-br from-arctic-sand to-accent-blue rounded-full flex items-center justify-center mx-auto shadow-cognitive-subtle">
                  <span className="text-charcoal-slate text-2xl">⚡</span>
                </div>
                <h3 className="text-xl text-cognitive-label text-text-primary">Quick Study</h3>
                <p className="text-text-secondary text-cognitive-body">Jump into focused learning</p>
                <button className="w-full btn-primary motion-cognitive mt-cognitive-sm">
                  Study Now
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div className="card-cognitive padding-cognitive">
            <h3 className="text-xl text-cognitive-label text-text-primary mb-cognitive-md">Recent Activity</h3>
            <div className="spacing-cognitive">
              <div className="flex items-center space-x-4 padding-cognitive bg-surface-elevated/50 rounded-cognitive border border-soft-carbon/50">
                <div className="w-3 h-3 bg-burnished-bronze rounded-full animate-cognitive-pulse shadow-cognitive-halo" />
                <span className="text-text-secondary text-cognitive-body">Your Second Brain is ready to grow</span>
              </div>
              <div className="flex items-center space-x-4 padding-cognitive bg-surface-elevated/50 rounded-cognitive border border-soft-carbon/50">
                <div className="w-3 h-3 bg-verdant-teal rounded-full animate-cognitive-pulse shadow-cognitive-glow" />
                <span className="text-text-secondary text-cognitive-body">Create your first notebook to get started</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
