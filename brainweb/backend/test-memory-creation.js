require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { getIntent } = require('./services/intent.js');
const { SupabaseService } = require('./services/supabase-client.js');

async function testMemoryCreation() {
  console.log('🧠 Testing Memory Creation from Conversations...\n');

  const supabase = new SupabaseService();
  const userId = 'test-user-123';

  // Test different types of conversations that should create memories
  const testConversations = [
    {
      message: "I remember when I was young, we used to play in the garden every afternoon",
      expected: "Should create a memory (story_start)"
    },
    {
      message: "My grandmother taught me how to bake bread when I was 8 years old",
      expected: "Should create a memory (story_start)"
    },
    {
      message: "Hello, how are you?",
      expected: "Should NOT create a memory (greeting)"
    },
    {
      message: "What's the weather like today?",
      expected: "Should NOT create a memory (question)"
    },
    {
      message: "I want to tell you about my wedding day. It was the most beautiful day of my life",
      expected: "Should create a memory (story_start)"
    },
    {
      message: "When I was a child, we lived in a small house by the river",
      expected: "Should create a memory (story_start)"
    }
  ];

  console.log('🎯 Testing conversation-to-memory conversion...\n');

  for (let i = 0; i < testConversations.length; i++) {
    const test = testConversations[i];
    console.log(`\nTest ${i + 1}: ${test.expected}`);
    console.log(`Message: "${test.message}"`);
    console.log('─'.repeat(60));

    try {
      const response = await getIntent(test.message, userId);
      const intent = JSON.parse(response);

      console.log(`🤖 AI Response: ${intent.message}`);
      console.log(`📊 Intent: ${intent.intent}`);
      console.log(`📊 Memory Type: ${intent.memory_type}`);
      console.log(`📊 Story Status: ${intent.story_status}`);

      // Check if this should create a memory
      const shouldCreateMemory = (
        (intent.intent === 'memory_capture' || intent.intent === 'story_start') && 
        intent.story_status !== 'continuing'
      );

      if (shouldCreateMemory) {
        console.log('✅ SHOULD CREATE MEMORY');
        
        // Simulate memory creation
        const title = test.message.length > 50 
          ? test.message.substring(0, 47) + '...' 
          : test.message;
        
        console.log(`📝 Memory Title: "${title}"`);
        console.log(`📝 Memory Content: "${test.message}"`);
        console.log(`📝 Memory Type: ${intent.memory_type}`);
        
      } else {
        console.log('❌ Should NOT create memory');
      }

    } catch (error) {
      console.log('❌ Error processing message:', error.message);
    }

    console.log('═'.repeat(60));
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Memory creation test completed!');
  console.log('\n📋 How Memory Creation Works:');
  console.log('1. User sends message via WhatsApp');
  console.log('2. Gemini AI analyzes the message');
  console.log('3. AI determines intent (story_start, memory_capture, etc.)');
  console.log('4. If intent indicates a story/memory, memory is created');
  console.log('5. Memory stored in Supabase with title, content, and type');
  console.log('6. Memory can be used for video generation later');
}

testMemoryCreation().catch(console.error);
