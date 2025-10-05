'use client'

import { useState, useEffect } from 'react'
import { supabase, Memory, GrandparentProfile } from '@/lib/supabase'
import { format } from 'date-fns'
import { Heart, MessageCircle, Calendar, User, BookOpen, Filter, Search } from 'lucide-react'
import MemoryCard from '@/components/MemoryCard'
import MemoryModal from '@/components/MemoryModal'
import FilterSidebar from '@/components/FilterSidebar'
import DemoMode from '@/components/DemoMode'

export default function MemoryBlog() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [grandparents, setGrandparents] = useState<GrandparentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrandparent, setSelectedGrandparent] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading precious memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Memory Keeper</h1>
                <p className="text-sm text-gray-600">Family memories and stories</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            showFilters={showFilters}
            grandparents={grandparents}
            selectedGrandparent={selectedGrandparent}
            setSelectedGrandparent={setSelectedGrandparent}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Memories</p>
                    <p className="text-2xl font-bold text-gray-900">{memories.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Grandparents</p>
                    <p className="text-2xl font-bold text-gray-900">{grandparents.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredMemories.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Memories Grid */}
            {filteredMemories.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No memories found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedGrandparent !== 'all' || selectedType !== 'all'
                    ? 'Try adjusting your filters to see more memories.'
                    : 'Memories will appear here once grandparents start sharing their stories.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Memory Modal */}
      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
        />
      )}

      {/* Demo Mode */}
      <DemoMode />
    </div>
  )
}