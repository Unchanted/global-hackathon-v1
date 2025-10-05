'use client'

import { useState, useEffect } from 'react'
import { supabase, Memory, GrandparentProfile } from '@/lib/supabase'
import { format } from 'date-fns'
import { Heart, MessageCircle, Calendar, User, BookOpen, Filter, Search } from 'lucide-react'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'
// import DemoMode from '@/components/DemoMode'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useFilters } from '@/components/filter-context'

export default function MemoryBlog() {
  const { searchTerm, selectedGrandparent, selectedType } = useFilters()
  const [memories, setMemories] = useState<Memory[]>([])
  const [grandparents, setGrandparents] = useState<GrandparentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

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

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">Total Memories</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">{memories.length}</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-600">Grandparents</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">{grandparents.length}</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-600">Published</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">{filteredMemories.length}</span>
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
              </div>

              {/* Memories Grid */}
              {filteredMemories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No memories found</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    {searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all'
                      ? 'Try adjusting your filters to see more memories.'
                      : 'Memories will appear here once grandparents start sharing their stories.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMemories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      onClick={() => setSelectedMemory(memory)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memory Modal */}
      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
        />
      )}

      {/* Demo Mode */}
      {/* <DemoMode /> */}
    </SidebarInset>
  )
}