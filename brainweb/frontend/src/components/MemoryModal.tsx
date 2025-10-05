'use client'

import { useState, useEffect } from 'react'
import { Memory, Conversation } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { X, Calendar, User, MessageCircle, Heart, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

interface MemoryModalProps {
  memory: Memory
  onClose: () => void
}

export default function MemoryModal({ memory, onClose }: MemoryModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPart, setCurrentPart] = useState(0)

  useEffect(() => {
    fetchConversations()
  }, [memory])

  const fetchConversations = async () => {
    if (!memory.source_conversation_ids.length) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          grandparent:grandparent_profiles(*)
        `)
        .in('id', memory.source_conversation_ids)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setConversations(data || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMemoryTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <BookOpen className="h-5 w-5" />
      case 'photo':
        return <MessageCircle className="h-5 w-5" />
      case 'voice_note':
        return <MessageCircle className="h-5 w-5" />
      default:
        return <Heart className="h-5 w-5" />
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

  const nextPart = () => {
    if (currentPart < conversations.length - 1) {
      setCurrentPart(currentPart + 1)
    }
  }

  const prevPart = () => {
    if (currentPart > 0) {
      setCurrentPart(currentPart - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMemoryTypeColor(memory.memory_type)}`}>
              {getMemoryTypeIcon(memory.memory_type)}
              <span className="ml-1 capitalize">{memory.memory_type}</span>
            </span>
            <span className="text-sm text-gray-500">
              {format(new Date(memory.published_at || memory.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Memory Title and Author */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">{memory.title}</h1>
            <div className="flex items-center text-gray-600 text-sm">
              <User className="h-3 w-3 mr-1" />
              <span>By {memory.grandparent?.name || 'Unknown'}</span>
            </div>
          </div>

          {/* Full Memory Content */}
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                {memory.content}
              </p>
            </div>
          </div>

          {/* Story Parts */}
          {conversations.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Story Parts ({conversations.length})
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading story parts...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Navigation */}
                  {conversations.length > 1 && (
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={prevPart}
                        disabled={currentPart === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>
                      <span className="text-sm text-gray-600">
                        Part {currentPart + 1} of {conversations.length}
                      </span>
                      <button
                        onClick={nextPart}
                        disabled={currentPart === conversations.length - 1}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Current Part */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        Part {currentPart + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(conversations[currentPart]?.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-800">
                      {conversations[currentPart]?.content}
                    </p>
                  </div>

                  {/* All Parts Overview */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">All Parts:</h4>
                    <div className="space-y-2">
                      {conversations.map((conversation, index) => (
                        <div
                          key={conversation.id}
                          onClick={() => setCurrentPart(index)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            index === currentPart
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              Part {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(conversation.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {conversation.content.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600 text-sm">
              <MessageCircle className="h-3 w-3 mr-1" />
              <span>{memory.source_conversation_ids.length} parts</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
