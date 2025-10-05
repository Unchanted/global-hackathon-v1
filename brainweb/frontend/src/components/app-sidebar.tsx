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
  MessageCircle,
  Settings
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
      <SidebarHeader className="border-b border-sidebar-border bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <BookOpen className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-gray-900">Memory Keeper</span>
                  <span className="truncate text-xs text-gray-600">Family memories</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-gray-700">
            Search
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search memories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Grandparents Filter */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-gray-700">
            Grandparents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setSelectedGrandparent('all')}
                  isActive={selectedGrandparent === 'all'}
                >
                  <User className="h-4 w-4" />
                  <span>All Grandparents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {grandparents.map((grandparent) => (
                <SidebarMenuItem key={grandparent.id}>
                  <SidebarMenuButton 
                    onClick={() => setSelectedGrandparent(grandparent.id)}
                    isActive={selectedGrandparent === grandparent.id}
                  >
                    <User className="h-4 w-4" />
                    <span>{grandparent.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Memory Types Filter */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-medium text-gray-700">
            Memory Types
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {memoryTypes.map((type) => (
                <SidebarMenuItem key={type.value}>
                  <SidebarMenuButton 
                    onClick={() => setSelectedType(type.value)}
                    isActive={selectedType === type.value}
                  >
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 px-2 py-2">
                <Settings className="size-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
