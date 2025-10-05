'use client'

import { useState, useEffect } from 'react'
import { supabase, Memory, GrandparentProfile } from '@/lib/supabase'
import { format } from 'date-fns'
import { Heart, MessageCircle, Calendar, User, BookOpen, Filter, Search } from 'lucide-react'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'
import DemoMode from '@/components/DemoMode'
import { SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useFilters } from '@/components/filter-context'

export default function MemoryBlog() {
  const { searchTerm, selectedGrandparent, selectedType } = useFilters()
  const { state: sidebarState } = useSidebar()
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
      <div className="h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              {sidebarState === 'collapsed' && (
                <div className="flex items-center space-x-4 animate-in fade-in-0 slide-in-from-left-2 duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Memory
                      </span>
                      <span className="text-gray-800 ml-2">Keeper</span>
                    </h1>
                    <p className="text-sm text-gray-600 font-medium">Family memories and stories</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area with Resizable Layout */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Stats and Overview */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <div className="h-full overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50">
                {/* Page Title */}
                <div className="mb-8">
                  {sidebarState === 'expanded' && (
                    <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
                      <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Memory
                        </span>
                        <span className="text-gray-800 ml-2">Dashboard</span>
                      </h1>
                      <p className="text-base text-gray-600 font-medium flex items-center">
                        <span className="text-lg mr-2">👋</span>
                        Welcome to <span className="font-semibold text-blue-600 ml-1">Memory Keeper</span>!
                      </p>
                    </div>
                  )}
                  {sidebarState === 'collapsed' && (
                    <div className="mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
                      <p className="text-sm text-gray-600">Overview and statistics</p>
                    </div>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="space-y-5">
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Memories</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{memories.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Grandparents</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{grandparents.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 shadow-sm">
                        <Heart className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Published</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{filteredMemories.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Summary */}
                <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-blue-600" />
                    Active Filters
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Search:</span>
                      <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                        {searchTerm || 'None'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Grandparent:</span>
                      <span className="text-sm font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded-md">
                        {selectedGrandparent === 'all' ? 'All' : grandparents.find(g => g.id === selectedGrandparent)?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-sm font-semibold text-gray-900 bg-green-50 px-2 py-1 rounded-md capitalize">
                        {selectedType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Memories Grid */}
            <ResizablePanel defaultSize={70} minSize={60}>
              <div className="h-full overflow-y-auto p-6 bg-white">
                {/* Memories Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    {filteredMemories.length === 0 ? (
                      <span className="text-gray-500">No Memories Found</span>
                    ) : (
                      <>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {filteredMemories.length}
                        </span>
                        <span className="text-gray-800 ml-2">Memories</span>
                      </>
                    )}
                  </h2>
                  {filteredMemories.length > 0 && (
                    <p className="text-base text-gray-600 font-medium">
                      {searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all'
                        ? '📋 Filtered results'
                        : '📚 All published memories'}
                    </p>
                  )}
                </div>

                {/* Memories Grid */}
                {filteredMemories.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <BookOpen className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No memories found</h3>
                    <p className="text-base text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                      {searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all'
                        ? 'Try adjusting your filters to see more memories.'
                        : 'Memories will appear here once grandparents start sharing their stories.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
            </ResizablePanel>
          </ResizablePanelGroup>
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
      <DemoMode />
    </SidebarInset>
  )
}