'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Memory, Conversation, GrandparentProfile } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  MessageCircle, 
  Heart, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  Heart as HeartIcon
} from 'lucide-react'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export default function MemoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const memoryId = params.id as string
  
  const [memory, setMemory] = useState<Memory | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [currentPart, setCurrentPart] = useState(0)

  useEffect(() => {
    if (memoryId) {
      fetchMemory()
    }
  }, [memoryId])

  useEffect(() => {
    if (memory) {
      fetchConversations()
    }
  }, [memory])

  const fetchMemory = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          grandparent:grandparent_profiles(*)
        `)
        .eq('id', memoryId)
        .eq('status', 'published')
        .single()

      if (error) throw error
      setMemory(data)
    } catch (error) {
      console.error('Error fetching memory:', error)
      // Redirect to home if memory not found
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    if (!memory?.source_conversation_ids.length) return

    setConversationsLoading(true)
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
      setConversationsLoading(false)
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

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading memory...</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  if (!memory) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Memory not found</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6">
              The memory you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Memory Detail</h1>
                  <p className="text-xs text-gray-500">Viewing family memory</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <HeartIcon className="h-4 w-4 mr-2" />
                Like
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-6">
          {/* Memory Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMemoryTypeColor(memory.memory_type)}`}>
                  {getMemoryTypeIcon(memory.memory_type)}
                  <span className="ml-2 capitalize">{memory.memory_type}</span>
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(memory.published_at || memory.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>{memory.source_conversation_ids.length} parts</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Published</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{memory.title}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold text-white">
                {memory.grandparent?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span className="font-semibold">By {memory.grandparent?.name || 'Unknown'}</span>
                </div>
                <p className="text-sm text-gray-500">Family storyteller</p>
              </div>
            </div>

            {/* Full Memory Content */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                {memory.content}
              </p>
            </div>
          </div>

          {/* Story Parts */}
          {conversations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Story Parts ({conversations.length})
              </h3>
              
              {conversationsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading story parts...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Navigation */}
                  {conversations.length > 1 && (
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        onClick={prevPart}
                        disabled={currentPart === 0}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </Button>
                      <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                        Part {currentPart + 1} of {conversations.length}
                      </span>
                      <Button
                        onClick={nextPart}
                        disabled={currentPart === conversations.length - 1}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Current Part */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full">
                        Part {currentPart + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(conversations[currentPart]?.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed text-base">
                      {conversations[currentPart]?.content}
                    </p>
                  </div>

                  {/* All Parts Overview */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">All Parts:</h4>
                    <div className="grid gap-3">
                      {conversations.map((conversation, index) => (
                        <div
                          key={conversation.id}
                          onClick={() => setCurrentPart(index)}
                          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            index === currentPart
                              ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Part {index + 1}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(conversation.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {conversation.content.substring(0, 150)}...
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
      </div>
    </SidebarInset>
  )
}
