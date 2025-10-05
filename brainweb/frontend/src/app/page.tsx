'use client'

import { useState, useEffect } from 'react'
import { supabase, Memory, GrandparentProfile } from '@/lib/supabase'
import { format } from 'date-fns'
import { Heart, MessageCircle, Calendar, User, BookOpen, Filter, Search } from 'lucide-react'
import MemoryCard from '@/components/MemoryCard'
// import DemoMode from '@/components/DemoMode'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useFilters } from '@/components/filter-context'

export default function MemoryBlog() {
  const { searchTerm, selectedGrandparent, selectedType } = useFilters()
  const [memories, setMemories] = useState<Memory[]>([])
  const [grandparents, setGrandparents] = useState<GrandparentProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemories()
    fetchGrandparents()
  }, [])

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          grandparent:grandparent_profiles(*)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (error) throw error
      setMemories(data || [])
    } catch (error) {
      console.error('Error fetching memories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGrandparents = async () => {
    try {
      const { data, error } = await supabase
        .from('grandparent_profiles')
        .select('*')
        .order('name')

      if (error) throw error
      setGrandparents(data || [])
    } catch (error) {
      console.error('Error fetching grandparents:', error)
    }
  }

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrandparent = selectedGrandparent === 'all' || memory.grandparent_id === selectedGrandparent
    const matchesType = selectedType === 'all' || memory.memory_type === selectedType
    
    return matchesSearch && matchesGrandparent && matchesType
  })

  if (loading) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading precious memories...</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Simplified Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SidebarTrigger />
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Memory Keeper</h1>
                  <p className="text-xs text-gray-500">Family memories and stories</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            {/* Stats Overview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Memory Dashboard</h2>
                  <p className="text-sm text-gray-600 mt-1">Overview and statistics</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    <span>Filters active</span>
                  </div>
                </div>
              </div>

              {/* Gamified Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-700">Memory Collection</span>
                        <div className="text-xs text-blue-600">Keep building your story!</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-800">{memories.length}</span>
                      <div className="text-xs text-blue-600">memories</div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((memories.length / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-blue-600 mt-2">
                    <span>Progress</span>
                    <span>{Math.min(memories.length, 50)}/50</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-700">Family Network</span>
                        <div className="text-xs text-green-600">Connected storytellers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-800">{grandparents.length}</span>
                      <div className="text-xs text-green-600">grandparents</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {grandparents.slice(0, 3).map((gp, index) => (
                        <div key={gp.id} className="w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                          {gp.name.charAt(0)}
                        </div>
                      ))}
                      {grandparents.length > 3 && (
                        <div className="w-6 h-6 bg-green-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-green-700">
                          +{grandparents.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-green-600">
                      {grandparents.length >= 5 ? '🌟 Complete!' : `${5 - grandparents.length} more to go`}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-purple-700">Published Stories</span>
                        <div className="text-xs text-purple-600">Ready to share!</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-purple-800">{filteredMemories.length}</span>
                      <div className="text-xs text-purple-600">published</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < Math.floor((filteredMemories.length / memories.length) * 5)
                              ? 'bg-purple-500'
                              : 'bg-purple-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-purple-600">
                      {filteredMemories.length === memories.length ? '🎉 All published!' : `${memories.length - filteredMemories.length} drafts`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Active Filters
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Search: {searchTerm}
                      </span>
                    )}
                    {selectedGrandparent !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Grandparent: {grandparents.find(g => g.id === selectedGrandparent)?.name || 'Unknown'}
                      </span>
                    )}
                    {selectedType !== 'all' && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        Type: {selectedType}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Memories Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {filteredMemories.length === 0 ? (
                      'No Memories Found'
                    ) : (
                      `${filteredMemories.length} Memories`
                    )}
                  </h3>
                  {filteredMemories.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all'
                        ? 'Filtered results'
                        : 'All published memories'}
                    </p>
                  )}
                </div>
                
                {/* Streak Counter */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔥</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-700">7 Day Streak</div>
                      <div className="text-xs text-red-600">Keep it going!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Memories Grid */}
              {filteredMemories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No memories found</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
                    {searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all'
                      ? 'Try adjusting your filters to see more memories.'
                      : 'Start collecting family stories to unlock achievements!'}
                  </p>
                  {!searchTerm && selectedGrandparent === 'all' && selectedType === 'all' && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-lg">🎯</span>
                        <span className="font-semibold text-blue-800">Your First Goal</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Add your first memory to unlock the "First Stories" achievement!
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMemories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Mode */}
      {/* <DemoMode /> */}
    </SidebarInset>
  )
}