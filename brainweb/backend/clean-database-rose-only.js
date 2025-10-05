require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { SupabaseService } = require('./services/supabase-client.js');

async function cleanDatabaseRoseOnly() {
  console.log('🧹 Cleaning Database - Keeping Only Rose Thompson...\n');

  const supabase = new SupabaseService();

  try {
    // First, find Rose Thompson
    console.log('🔍 Finding Rose Thompson...');
    const { data: roseThompson, error: roseError } = await supabase.client
      .from('grandparent_profiles')
      .select('id, name, whatsapp_number')
      .or('name.ilike.%rose%thompson%,name.ilike.%thompson%rose%')
      .single();

    if (roseError || !roseThompson) {
      console.log('❌ Rose Thompson not found in database');
      console.log('📋 Available grandparents:');
      
      const { data: allGrandparents } = await supabase.client
        .from('grandparent_profiles')
        .select('id, name, whatsapp_number');
      
      if (allGrandparents) {
        allGrandparents.forEach(gp => {
          console.log(`  - ${gp.name} (${gp.whatsapp_number})`);
        });
      }
      return;
    }

    console.log('✅ Found Rose Thompson:', roseThompson.name);
    console.log('📱 WhatsApp:', roseThompson.whatsapp_number);
    console.log('🆔 ID:', roseThompson.id);

    // Get counts before deletion
    console.log('\n📊 Current database counts:');
    
    const { count: grandparentCount } = await supabase.client
      .from('grandparent_profiles')
      .select('*', { count: 'exact', head: true });
    console.log(`👥 Grandparents: ${grandparentCount}`);

    const { count: memoryCount } = await supabase.client
      .from('memories')
      .select('*', { count: 'exact', head: true });
    console.log(`📚 Memories: ${memoryCount}`);

    const { count: conversationCount } = await supabase.client
      .from('conversations')
      .select('*', { count: 'exact', head: true });
    console.log(`💬 Conversations: ${conversationCount}`);

    const { count: videoCount } = await supabase.client
      .from('memory_videos')
      .select('*', { count: 'exact', head: true });
    console.log(`🎬 Videos: ${videoCount}`);

    // Delete everything except Rose Thompson
    console.log('\n🗑️ Deleting data (keeping Rose Thompson only)...');

    // Delete videos not belonging to Rose Thompson
    console.log('🎬 Deleting videos...');
    const { error: videoDeleteError } = await supabase.client
      .from('memory_videos')
      .delete()
      .neq('grandparent_id', roseThompson.id);
    
    if (videoDeleteError) {
      console.log('⚠️ Video deletion error:', videoDeleteError.message);
    } else {
      console.log('✅ Videos deleted');
    }

    // Delete memories not belonging to Rose Thompson
    console.log('📚 Deleting memories...');
    const { error: memoryDeleteError } = await supabase.client
      .from('memories')
      .delete()
      .neq('grandparent_id', roseThompson.id);
    
    if (memoryDeleteError) {
      console.log('⚠️ Memory deletion error:', memoryDeleteError.message);
    } else {
      console.log('✅ Memories deleted');
    }

    // Delete conversations not belonging to Rose Thompson
    console.log('💬 Deleting conversations...');
    const { error: conversationDeleteError } = await supabase.client
      .from('conversations')
      .delete()
      .neq('grandparent_id', roseThompson.id);
    
    if (conversationDeleteError) {
      console.log('⚠️ Conversation deletion error:', conversationDeleteError.message);
    } else {
      console.log('✅ Conversations deleted');
    }

    // Delete other grandparents (keep Rose Thompson)
    console.log('👥 Deleting other grandparents...');
    const { error: grandparentDeleteError } = await supabase.client
      .from('grandparent_profiles')
      .delete()
      .neq('id', roseThompson.id);
    
    if (grandparentDeleteError) {
      console.log('⚠️ Grandparent deletion error:', grandparentDeleteError.message);
    } else {
      console.log('✅ Other grandparents deleted');
    }

    // Get final counts
    console.log('\n📊 Final database counts:');
    
    const { count: finalGrandparentCount } = await supabase.client
      .from('grandparent_profiles')
      .select('*', { count: 'exact', head: true });
    console.log(`👥 Grandparents: ${finalGrandparentCount}`);

    const { count: finalMemoryCount } = await supabase.client
      .from('memories')
      .select('*', { count: 'exact', head: true });
    console.log(`📚 Memories: ${finalMemoryCount}`);

    const { count: finalConversationCount } = await supabase.client
      .from('conversations')
      .select('*', { count: 'exact', head: true });
    console.log(`💬 Conversations: ${finalConversationCount}`);

    const { count: finalVideoCount } = await supabase.client
      .from('memory_videos')
      .select('*', { count: 'exact', head: true });
    console.log(`🎬 Videos: ${finalVideoCount}`);

    // Show Rose Thompson's remaining data
    console.log('\n👤 Rose Thompson\'s remaining data:');
    
    const { data: roseMemories } = await supabase.client
      .from('memories')
      .select('id, title, memory_type, status, created_at')
      .eq('grandparent_id', roseThompson.id)
      .order('created_at', { ascending: false });

    if (roseMemories && roseMemories.length > 0) {
      console.log(`📚 Memories (${roseMemories.length}):`);
      roseMemories.forEach((memory, index) => {
        console.log(`  ${index + 1}. ${memory.title}`);
        console.log(`     Type: ${memory.memory_type}, Status: ${memory.status}`);
      });
    } else {
      console.log('📚 No memories found');
    }

    const { data: roseVideos } = await supabase.client
      .from('memory_videos')
      .select('id, title, duration, status, created_at')
      .eq('grandparent_id', roseThompson.id)
      .order('created_at', { ascending: false });

    if (roseVideos && roseVideos.length > 0) {
      console.log(`🎬 Videos (${roseVideos.length}):`);
      roseVideos.forEach((video, index) => {
        console.log(`  ${index + 1}. ${video.title || 'Untitled'}`);
        console.log(`     Duration: ${video.duration}s, Status: ${video.status}`);
      });
    } else {
      console.log('🎬 No videos found');
    }

    console.log('\n🎉 Database cleanup completed!');
    console.log('✅ Only Rose Thompson\'s data remains');
    console.log('✅ All other data has been removed');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanDatabaseRoseOnly().catch(console.error);
