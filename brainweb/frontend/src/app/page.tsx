'use client'

import { useState, useEffect } from 'react'
import { supabase, Memory, GrandparentProfile } from '@/lib/supabase'
import { format } from 'date-fns'
import { Heart, MessageCircle, Calendar, User, BookOpen, Filter, Search } from 'lucide-react'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'
import DemoMode from '@/components/DemoMode'
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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SidebarTrigger />
              <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-gray-900">Memory Keeper</h1>
                <p className="text-xs text-gray-500">Family memories and stories</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Getting Started</h1>
            <p className="text-lg text-gray-600">👋 Welcome to Memory Keeper!</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Memories</p>
                  <p className="text-2xl font-semibold text-gray-900">{memories.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grandparents</p>
                  <p className="text-2xl font-semibold text-gray-900">{grandparents.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredMemories.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Memories Grid */}
          {filteredMemories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 notion-text-tertiary" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">No memories found</h3>
              <p className="notion-text-secondary">
                {searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all'
                  ? 'Try adjusting your filters to see more memories.'
                  : 'Memories will appear here once grandparents start sharing their stories.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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