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
      className="bg-white border border-gray-200 rounded-md p-6 cursor-pointer hover:shadow-sm transition-shadow group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMemoryTypeColor(memory.memory_type)}`}>
            {getMemoryTypeIcon(memory.memory_type)}
            <span className="ml-1 capitalize">{memory.memory_type}</span>
          </span>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          {format(new Date(memory.published_at || memory.created_at), 'MMM d, yyyy')}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
        {memory.title}
      </h3>

      {/* Content Preview */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {truncateContent(memory.content, 150)}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-gray-500 text-sm">
          <User className="h-4 w-4 mr-1" />
          <span>{memory.grandparent?.name || 'Unknown Grandparent'}</span>
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <MessageCircle className="h-4 w-4 mr-1" />
          <span>{memory.source_conversation_ids.length} parts</span>
        </div>
      </div>
    </div>
  )
}
