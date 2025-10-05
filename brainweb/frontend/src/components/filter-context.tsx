'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedGrandparent: string
  setSelectedGrandparent: (id: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrandparent, setSelectedGrandparent] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  return (
    <FilterContext.Provider value={{
      searchTerm,
      setSearchTerm,
      selectedGrandparent,
      setSelectedGrandparent,
      selectedType,
      setSelectedType
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider')
  }
  return context
}
