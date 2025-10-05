-- Fix RLS policies for Memory Keeper bot operations
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Family members can view related grandparent data" ON grandparent_profiles;
DROP POLICY IF EXISTS "Family members can view related conversations" ON conversations;
DROP POLICY IF EXISTS "Family members can view related memories" ON memories;
DROP POLICY IF EXISTS "Family members can edit memories" ON memories;
DROP POLICY IF EXISTS "Family members can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Family members can update own notifications" ON notifications;

-- Create bot-friendly policies that allow bot operations
-- Bot can create and read grandparent profiles
CREATE POLICY "Bot can manage grandparent profiles" ON grandparent_profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Bot can create and read conversations
CREATE POLICY "Bot can manage conversations" ON conversations
    FOR ALL USING (true) WITH CHECK (true);

-- Bot can create and read memories
CREATE POLICY "Bot can manage memories" ON memories
    FOR ALL USING (true) WITH CHECK (true);

-- Bot can manage media files
CREATE POLICY "Bot can manage media files" ON media_files
    FOR ALL USING (true) WITH CHECK (true);

-- Bot can manage bot sessions
CREATE POLICY "Bot can manage bot sessions" ON bot_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Bot can read system settings
CREATE POLICY "Bot can read system settings" ON system_settings
    FOR SELECT USING (true);

-- Bot can update system settings
CREATE POLICY "Bot can update system settings" ON system_settings
    FOR UPDATE USING (true);

-- Ensure proper permissions
GRANT ALL ON grandparent_profiles TO anon, authenticated;
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON memories TO anon, authenticated;
GRANT ALL ON media_files TO anon, authenticated;
GRANT ALL ON bot_sessions TO anon, authenticated;
GRANT ALL ON system_settings TO anon, authenticated;
GRANT ALL ON memory_comments TO anon, authenticated;
GRANT ALL ON notifications TO anon, authenticated;
GRANT ALL ON grandparent_family_relationships TO anon, authenticated;
GRANT ALL ON family_members TO anon, authenticated;