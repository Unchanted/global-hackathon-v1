-- Memory Keeper for Grandparents - Supabase Schema
-- This file contains all the database tables and relationships needed for the project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Grandparent Profiles Table
CREATE TABLE grandparent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    -- Additional fields for grandparent info
    birth_year INTEGER,
    location VARCHAR(255),
    preferred_language VARCHAR(10) DEFAULT 'en',
    family_notes TEXT
);

-- 2. Family Member Accounts Table
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    role VARCHAR(50) DEFAULT 'family_member', -- family_member, admin, editor
    -- Profile information
    phone VARCHAR(20),
    relationship_to_grandparent VARCHAR(100), -- son, daughter, grandchild, etc.
    notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": false}'
);

-- 3. Grandparent-Family Relationships Table
CREATE TABLE grandparent_family_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grandparent_id UUID REFERENCES grandparent_profiles(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- son, daughter, grandchild, spouse, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_primary_contact BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT true,
    can_publish BOOLEAN DEFAULT false,
    UNIQUE(grandparent_id, family_member_id)
);

-- 4. Bot Sessions Table
CREATE TABLE bot_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_phone_number VARCHAR(20) UNIQUE NOT NULL,
    session_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, error, maintenance
    qr_code_scanned BOOLEAN DEFAULT false,
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Session metadata
    session_data JSONB DEFAULT '{}',
    error_log TEXT,
    is_current_session BOOLEAN DEFAULT false
);

-- 5. Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grandparent_id UUID REFERENCES grandparent_profiles(id) ON DELETE CASCADE,
    bot_session_id UUID REFERENCES bot_sessions(id) ON DELETE SET NULL,
    whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- text, image, voice, video, document
    content TEXT,
    media_url VARCHAR(500), -- URL to media file in Supabase Storage
    media_filename VARCHAR(255),
    media_size INTEGER, -- file size in bytes
    media_duration INTEGER, -- for voice/video in seconds
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Message processing status
    is_processed BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    ai_analysis JSONB DEFAULT '{}',
    -- Message metadata
    raw_message_data JSONB DEFAULT '{}'
);

-- 6. Memories Table (AI-generated content)
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grandparent_id UUID REFERENCES grandparent_profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    memory_type VARCHAR(50) NOT NULL, -- story, photo_caption, voice_transcript, general
    status VARCHAR(50) DEFAULT 'draft', -- draft, review, published, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- AI generation metadata
    ai_model VARCHAR(100) DEFAULT 'gemini-2.5-flash',
    ai_prompt TEXT,
    ai_confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    -- Content organization
    tags TEXT[],
    category VARCHAR(100),
    estimated_reading_time INTEGER, -- in minutes
    -- Publication info
    published_at TIMESTAMP WITH TIME ZONE,
    published_by UUID REFERENCES family_members(id),
    -- Related conversations
    source_conversation_ids UUID[] DEFAULT '{}',
    related_media_ids UUID[] DEFAULT '{}'
);

-- 7. Media Files Table
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),
    file_path VARCHAR(500) NOT NULL, -- Path in Supabase Storage
    file_type VARCHAR(100) NOT NULL, -- image/jpeg, audio/mpeg, etc.
    file_size INTEGER NOT NULL,
    duration INTEGER, -- for audio/video files
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Media processing
    is_processed BOOLEAN DEFAULT false,
    thumbnail_url VARCHAR(500),
    transcription TEXT, -- for voice notes
    -- Metadata
    metadata JSONB DEFAULT '{}',
    alt_text TEXT,
    caption TEXT
);

-- 8. Memory Comments/Edits Table
CREATE TABLE memory_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    comment_type VARCHAR(50) DEFAULT 'comment', -- comment, edit, suggestion, approval
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Edit tracking
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES family_members(id)
);

-- 9. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL, -- new_memory, new_conversation, memory_published, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Related entities
    related_memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
    related_conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    -- Notification metadata
    metadata JSONB DEFAULT '{}'
);

-- 10. System Settings Table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_grandparent_profiles_whatsapp ON grandparent_profiles(whatsapp_number);
CREATE INDEX idx_conversations_grandparent ON conversations(grandparent_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX idx_conversations_message_type ON conversations(message_type);
CREATE INDEX idx_memories_grandparent ON memories(grandparent_id);
CREATE INDEX idx_memories_status ON memories(status);
CREATE INDEX idx_memories_created_at ON memories(created_at);
CREATE INDEX idx_media_files_conversation ON media_files(conversation_id);
CREATE INDEX idx_media_files_memory ON media_files(memory_id);
CREATE INDEX idx_bot_sessions_status ON bot_sessions(status);
CREATE INDEX idx_bot_sessions_current ON bot_sessions(is_current_session);
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_notifications_family_member ON notifications(family_member_id);
CREATE INDEX idx_notifications_unread ON notifications(family_member_id, is_read);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_grandparent_profiles_updated_at BEFORE UPDATE ON grandparent_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bot_sessions_updated_at BEFORE UPDATE ON bot_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memory_comments_updated_at BEFORE UPDATE ON memory_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('ai_model', '"gemini-2.5-flash"', 'Default AI model for memory generation'),
('max_conversation_history', '20', 'Maximum number of messages to keep in conversation history'),
('memory_auto_publish', 'false', 'Whether to auto-publish memories or require review'),
('notification_email_enabled', 'true', 'Enable email notifications'),
('whatsapp_bot_timeout', '300', 'Bot session timeout in seconds'),
('max_media_file_size', '10485760', 'Maximum media file size in bytes (10MB)'),
('supported_media_types', '["image/jpeg", "image/png", "audio/mpeg", "audio/wav", "video/mp4"]', 'Supported media file types');

-- Create RLS (Row Level Security) policies
ALTER TABLE grandparent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE grandparent_family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your authentication setup)
-- Family members can view their related grandparents' data
CREATE POLICY "Family members can view related grandparent data" ON grandparent_profiles
    FOR SELECT USING (
        id IN (
            SELECT grandparent_id FROM grandparent_family_relationships 
            WHERE family_member_id = auth.uid()
        )
    );

-- Family members can view conversations of their related grandparents
CREATE POLICY "Family members can view related conversations" ON conversations
    FOR SELECT USING (
        grandparent_id IN (
            SELECT grandparent_id FROM grandparent_family_relationships 
            WHERE family_member_id = auth.uid()
        )
    );

-- Family members can view memories of their related grandparents
CREATE POLICY "Family members can view related memories" ON memories
    FOR SELECT USING (
        grandparent_id IN (
            SELECT grandparent_id FROM grandparent_family_relationships 
            WHERE family_member_id = auth.uid()
        )
    );

-- Family members can edit memories if they have edit permissions
CREATE POLICY "Family members can edit memories" ON memories
    FOR UPDATE USING (
        grandparent_id IN (
            SELECT grandparent_id FROM grandparent_family_relationships 
            WHERE family_member_id = auth.uid() AND can_edit = true
        )
    );

-- Family members can view their own notifications
CREATE POLICY "Family members can view own notifications" ON notifications
    FOR SELECT USING (family_member_id = auth.uid());

-- Family members can update their own notifications
CREATE POLICY "Family members can update own notifications" ON notifications
    FOR UPDATE USING (family_member_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
