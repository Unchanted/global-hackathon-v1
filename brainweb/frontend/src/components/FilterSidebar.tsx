'use client'

import { GrandparentProfile } from '@/lib/supabase'
import { User, Filter, X } from 'lucide-react'

interface FilterSidebarProps {
  showFilters: boolean
  grandparents: GrandparentProfile[]
  selectedGrandparent: string
  setSelectedGrandparent: (value: string) => void
  selectedType: string
  setSelectedType: (value: string) => void
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export default function FilterSidebar({
  showFilters,
  grandparents,
  selectedGrandparent,
  setSelectedGrandparent,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm
}: FilterSidebarProps) {
  const memoryTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'story', label: 'Stories' },
    { value: 'photo', label: 'Photos' },
    { value: 'voice_note', label: 'Voice Notes' },
    { value: 'general', label: 'General' }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => {/* Close filters */}}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-80 bg-white shadow-lg lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block
      `}>
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              <button
                onClick={() => {/* Close filters */}}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Content */}
          <div className="p-6 space-y-6">
            {/* Grandparent Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Grandparent
              </h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="grandparent"
                    value="all"
                    checked={selectedGrandparent === 'all'}
                    onChange={(e) => setSelectedGrandparent(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">All Grandparents</span>
                </label>
                {grandparents.map((grandparent) => (
                  <label key={grandparent.id} className="flex items-center">
                    <input
                      type="radio"
                      name="grandparent"
                      value={grandparent.id}
                      checked={selectedGrandparent === grandparent.id}
                      onChange={(e) => setSelectedGrandparent(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{grandparent.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Memory Type Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Memory Type</h3>
              <div className="space-y-2">
                {memoryTypes.map((type) => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  setSelectedGrandparent('all')
                  setSelectedType('all')
                  setSearchTerm('')
                }}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
