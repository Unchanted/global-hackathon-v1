'use client'

import { Memory } from '@/lib/supabase'
import { format } from 'date-fns'
import { Calendar, User, MessageCircle, Heart, BookOpen } from 'lucide-react'

interface MemoryCardProps {
  memory: Memory
  onClick: () => void
}

export default function MemoryCard({ memory, onClick }: MemoryCardProps) {
  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <BookOpen className="h-4 w-4" />
      case 'photo':
        return <MessageCircle className="h-4 w-4" />
      case 'voice_note':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Heart className="h-4 w-4" />
    }
  }

  const getMemoryTypeColor = (type: string) => {
    switch (type) {
      case 'story':
        return 'bg-blue-100 text-blue-800'
      case 'photo':
        return 'bg-green-100 text-green-800'
      case 'voice_note':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMemoryTypeColor(memory.memory_type)}`}>
          {getMemoryTypeIcon(memory.memory_type)}
          <span className="ml-1 capitalize">{memory.memory_type}</span>
        </span>
        <span className="text-xs text-gray-500">
          {format(new Date(memory.published_at || memory.created_at), 'MMM d')}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 leading-tight">
        {memory.title}
      </h3>

      {/* Content Preview */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {truncateContent(memory.content, 120)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center text-gray-600 text-sm">
          <User className="h-3 w-3 mr-1" />
          <span>{memory.grandparent?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs">
          <MessageCircle className="h-3 w-3 mr-1" />
          <span>{memory.source_conversation_ids.length}</span>
        </div>
      </div>
    </div>
  )
}
