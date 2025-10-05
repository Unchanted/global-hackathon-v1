const { SupabaseService } = require('./services/supabase-client.js');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testDatabaseFlow() {
  console.log('🧪 Testing complete database flow...\n');
  
  // Debug: Check environment variables
  console.log('🔍 Environment variables check:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('');

  const supabase = new SupabaseService();

  if (!supabase.isEnabled) {
    console.error('❌ Supabase not configured. Please check your .env file.');
    return;
  }

  try {
    // Test 1: Create a test grandparent (with unique phone number)
    console.log('1️⃣ Testing grandparent creation...');
    const testPhone = `test${Date.now()}`; // Unique phone number based on timestamp
    const { data: grandparent, error: grandparentError } = await supabase.createGrandparent(
      testPhone,
      'Test Grandparent',
      { test: true, created_at: new Date().toISOString() }
    );

    if (grandparentError) {
      console.error('❌ Grandparent creation failed:', grandparentError);
      return;
    }
    console.log('✅ Grandparent created:', grandparent.id);

    // Test 2: Save a conversation
    console.log('\n2️⃣ Testing conversation saving...');
    const conversationData = {
      id: `test_msg_${Date.now()}`, // Unique conversation ID
      type: 'chat',
      content: 'Hello, I want to tell you about my childhood memories',
      timestamp: new Date().toISOString(),
      rawData: {
        from: `${testPhone}@c.us`,
        to: 'bot@c.us',
        hasMedia: false
      }
    };

    const { data: conversation, error: conversationError } = await supabase.saveConversation(
      grandparent.id,
      conversationData
    );

    if (conversationError) {
      console.error('❌ Conversation saving failed:', conversationError);
      return;
    }
    console.log('✅ Conversation saved:', conversation.id);

    // Test 3: Create a memory
    console.log('\n3️⃣ Testing memory creation...');
    const { data: memory, error: memoryError } = await supabase.createMemory(
      grandparent.id,
      'My Childhood Memories',
      'I remember playing in the garden with my siblings...',
      'story',
      [conversation.id]
    );

    if (memoryError) {
      console.error('❌ Memory creation failed:', memoryError);
      return;
    }
    console.log('✅ Memory created:', memory.id);

    // Test 4: Retrieve data
    console.log('\n4️⃣ Testing data retrieval...');
    const { data: memories } = await supabase.getMemoriesByGrandparent(grandparent.id);
    console.log('✅ Retrieved memories:', memories.length);

    const { data: conversations } = await supabase.getConversationsByGrandparent(grandparent.id);
    console.log('✅ Retrieved conversations:', conversations.length);

    console.log('\n🎉 Complete database flow test successful!');
    console.log('\n📊 Summary:');
    console.log(`- Grandparent: ${grandparent.name} (${grandparent.whatsapp_number})`);
    console.log(`- Conversations: ${conversations.length}`);
    console.log(`- Memories: ${memories.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseFlow();
