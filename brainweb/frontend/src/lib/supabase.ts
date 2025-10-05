import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface GrandparentProfile {
  id: string
  whatsapp_number: string
  name: string
  metadata: any
  created_at: string
  updated_at: string
}

export interface Memory {
  id: string
  grandparent_id: string
  title: string
  content: string
  memory_type: 'story' | 'photo' | 'voice_note' | 'general'
  status: 'draft' | 'published' | 'archived'
  source_conversation_ids: string[]
  published_by?: string
  published_at?: string
  created_at: string
  updated_at: string
  grandparent?: GrandparentProfile
}

export interface Conversation {
  id: string
  grandparent_id: string
  whatsapp_message_id: string
  message_type: string
  content: string
  media_url?: string
  media_filename?: string
  media_size?: number
  media_duration?: number
  timestamp: string
  raw_message_data: any
  created_at: string
  grandparent?: GrandparentProfile
}

export interface MediaFile {
  id: string
  conversation_id: string
  filename: string
  file_path: string
  file_type: string
  file_size: number
  metadata: any
  created_at: string
  conversation?: Conversation
}
