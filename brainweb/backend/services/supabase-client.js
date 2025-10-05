const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables if not already loaded
if (!process.env.SUPABASE_URL) {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Database features will be disabled.');
  console.warn('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file');
}

// Create Supabase clients (only if environment variables are available)
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  if (supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
}

// Database helper functions
class SupabaseService {
  constructor() {
    this.client = supabase;
    this.admin = supabaseAdmin;
    this.isEnabled = !!(supabaseUrl && supabaseAnonKey);
  }

  // Helper method to check if database is available
  checkDatabase() {
    if (!this.isEnabled) {
      console.warn('⚠️ Database operations skipped - Supabase not configured');
      return false;
    }
    return true;
  }

  // Grandparent Profiles
  async createGrandparent(whatsappNumber, name, metadata = {}) {
    if (!this.checkDatabase()) {
      return { data: null, error: { message: 'Database not configured' } };
    }
    
    const { data, error } = await this.client
      .from('grandparent_profiles')
      .insert({
        whatsapp_number: whatsappNumber,
        name: name,
        metadata: metadata
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getGrandparentByWhatsApp(whatsappNumber) {
    if (!this.checkDatabase()) {
      return { data: null, error: { message: 'Database not configured' } };
    }
    
    const { data, error } = await this.client
      .from('grandparent_profiles')
      .select('*')
      .eq('whatsapp_number', whatsappNumber)
      .single();
    
    return { data, error };
  }

  // Conversations
  async saveConversation(grandparentId, messageData) {
    if (!this.checkDatabase()) {
      return { data: null, error: { message: 'Database not configured' } };
    }
    
    const { data, error } = await this.client
      .from('conversations')
      .insert({
        grandparent_id: grandparentId,
        whatsapp_message_id: messageData.id,
        message_type: messageData.type,
        content: messageData.content,
        media_url: messageData.mediaUrl,
        media_filename: messageData.mediaFilename,
        media_size: messageData.mediaSize,
        media_duration: messageData.mediaDuration,
        timestamp: messageData.timestamp,
        raw_message_data: messageData.rawData
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getConversationsByGrandparent(grandparentId, limit = 50) {
    const { data, error } = await this.client
      .from('conversations')
      .select('*')
      .eq('grandparent_id', grandparentId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }

  // Memories
  async createMemory(grandparentId, title, content, memoryType = 'story', sourceConversationIds = []) {
    if (!this.checkDatabase()) {
      return { data: null, error: { message: 'Database not configured' } };
    }
    
    const { data, error } = await this.client
      .from('memories')
      .insert({
        grandparent_id: grandparentId,
        title: title,
        content: content,
        memory_type: memoryType,
        source_conversation_ids: sourceConversationIds,
        status: 'draft'
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getMemoriesByGrandparent(grandparentId, status = null) {
    let query = this.client
      .from('memories')
      .select('*')
      .eq('grandparent_id', grandparentId)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  async updateMemoryStatus(memoryId, status, publishedBy = null) {
    const updateData = { status };
    if (publishedBy) {
      updateData.published_by = publishedBy;
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await this.client
      .from('memories')
      .update(updateData)
      .eq('id', memoryId)
      .select()
      .single();
    
    return { data, error };
  }

  // Media Files
  async saveMediaFile(conversationId, filename, filePath, fileType, fileSize, metadata = {}) {
    const { data, error } = await this.client
      .from('media_files')
      .insert({
        conversation_id: conversationId,
        filename: filename,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        metadata: metadata
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getMediaFilesByConversation(conversationId) {
    const { data, error } = await this.client
      .from('media_files')
      .select('*')
      .eq('conversation_id', conversationId);
    
    return { data, error };
  }

  // Bot Sessions
  async createBotSession(phoneNumber, sessionName = null) {
    const { data, error } = await this.client
      .from('bot_sessions')
      .insert({
        bot_phone_number: phoneNumber,
        session_name: sessionName,
        status: 'active',
        is_current_session: true
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getCurrentBotSession() {
    const { data, error } = await this.client
      .from('bot_sessions')
      .select('*')
      .eq('is_current_session', true)
      .eq('status', 'active')
      .single();
    
    return { data, error };
  }

  async updateBotSessionStatus(sessionId, status, qrScanned = null) {
    const updateData = { status };
    if (qrScanned !== null) {
      updateData.qr_code_scanned = qrScanned;
    }

    const { data, error } = await this.client
      .from('bot_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();
    
    return { data, error };
  }

  // Family Members
  async createFamilyMember(email, name, passwordHash) {
    const { data, error } = await this.client
      .from('family_members')
      .insert({
        email: email,
        name: name,
        password_hash: passwordHash
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getFamilyMemberByEmail(email) {
    const { data, error } = await this.client
      .from('family_members')
      .select('*')
      .eq('email', email)
      .single();
    
    return { data, error };
  }

  // Notifications
  async createNotification(familyMemberId, type, title, message, relatedMemoryId = null) {
    const { data, error } = await this.client
      .from('notifications')
      .insert({
        family_member_id: familyMemberId,
        notification_type: type,
        title: title,
        message: message,
        related_memory_id: relatedMemoryId
      })
      .select()
      .single();
    
    return { data, error };
  }

  async getNotificationsByFamilyMember(familyMemberId, unreadOnly = false) {
    let query = this.client
      .from('notifications')
      .select('*')
      .eq('family_member_id', familyMemberId)
      .order('created_at', { ascending: false });
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  // Storage helpers
  async uploadMediaFile(bucketName, filePath, file, options = {}) {
    const { data, error } = await this.client.storage
      .from(bucketName)
      .upload(filePath, file, options);
    
    return { data, error };
  }

  async getPublicUrl(bucketName, filePath) {
    const { data } = this.client.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data;
  }

  // System Settings
  async getSystemSetting(key) {
    const { data, error } = await this.client
      .from('system_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single();
    
    return { data, error };
  }

  async updateSystemSetting(key, value) {
    const { data, error } = await this.client
      .from('system_settings')
      .update({ setting_value: value })
      .eq('setting_key', key)
      .select()
      .single();
    
    return { data, error };
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  SupabaseService
};
