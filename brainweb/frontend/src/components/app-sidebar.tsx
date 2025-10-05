'use client'

import { useState, useEffect } from 'react'
import { GrandparentProfile } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useFilters } from '@/components/filter-context'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { 
  BookOpen, 
  User, 
  Filter, 
  Search, 
  Heart, 
  Calendar,
  MessageCircle
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export function AppSidebar() {
  const { searchTerm, setSearchTerm, selectedGrandparent, setSelectedGrandparent, selectedType, setSelectedType } = useFilters()
  const [grandparents, setGrandparents] = useState<GrandparentProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGrandparents()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  const memoryTypes = [
    { value: 'all', label: 'All Types', icon: BookOpen },
    { value: 'story', label: 'Stories', icon: BookOpen },
    { value: 'photo', label: 'Photos', icon: MessageCircle },
    { value: 'voice_note', label: 'Voice Notes', icon: MessageCircle },
    { value: 'general', label: 'General', icon: Heart }
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-br from-blue-50 to-indigo-50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-3 px-3 py-4 group">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-gray-900 text-base">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Memory
                    </span>
                    <span className="text-gray-800 ml-1">Keeper</span>
                  </span>
                  <span className="truncate text-xs text-gray-600 font-medium">Family story collection</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Enhanced Search */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <Search className="h-4 w-4 mr-2 text-blue-600" />
              <span>Search</span>
            </div>
            {searchTerm && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
                />
                {searchTerm && (
                  <div className="absolute right-2 top-2.5">
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {searchTerm.length}
                    </span>
                  </div>
                )}
              </div>
              {searchTerm && (
                <div className="mt-2 px-2">
                  <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <div className="flex items-center">
                      <span className="text-blue-600 mr-1">🔍</span>
                      <span>Searching for: <span className="font-medium text-blue-800">"{searchTerm}"</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Enhanced Grandparents Filter */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-green-600" />
              <span>Family Network</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-1">
                {grandparents.slice(0, 3).map((gp, index) => (
                  <div key={gp.id} className="w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                    {gp.name.charAt(0)}
                  </div>
                ))}
                {grandparents.length > 3 && (
                  <div className="w-5 h-5 bg-green-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-green-700">
                    +{grandparents.length - 3}
                  </div>
                )}
              </div>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setSelectedGrandparent('all')}
                  isActive={selectedGrandparent === 'all'}
                  className="hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-2">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-medium">All Grandparents</span>
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {grandparents.length}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {grandparents.map((grandparent) => (
                <SidebarMenuItem key={grandparent.id}>
                  <SidebarMenuButton 
                    onClick={() => setSelectedGrandparent(grandparent.id)}
                    isActive={selectedGrandparent === grandparent.id}
                    className="hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-2 text-white text-xs font-bold">
                      {grandparent.name.charAt(0)}
                    </div>
                    <span className="font-medium">{grandparent.name}</span>
                    {selectedGrandparent === grandparent.id && (
                      <span className="ml-auto text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Enhanced Memory Types Filter */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
              <span>Story Types</span>
            </div>
            {selectedType !== 'all' && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                Filtered
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {memoryTypes.map((type) => (
                <SidebarMenuItem key={type.value}>
                  <SidebarMenuButton 
                    onClick={() => setSelectedType(type.value)}
                    isActive={selectedType === type.value}
                    className="hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
                      type.value === 'story' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                      type.value === 'photo' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                      type.value === 'voice_note' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                      'bg-gradient-to-br from-gray-400 to-gray-600'
                    }`}>
                      <type.icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">{type.label}</span>
                    {selectedType === type.value && (
                      <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
