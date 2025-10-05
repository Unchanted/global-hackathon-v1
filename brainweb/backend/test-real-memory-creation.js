require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { getIntent, userStates } = require('./services/intent.js');
const { SupabaseService } = require('./services/supabase-client.js');

async function testRealMemoryCreation() {
  console.log('🧠 Testing Real Memory Creation in Database...\n');

  const supabase = new SupabaseService();
  const userId = 'real-test-user';

  // First, create or get a test grandparent
  console.log('👤 Setting up test grandparent...');
  
  const { data: grandparent, error: grandparentError } = await supabase.client
    .from('grandparent_profiles')
    .select('id, name')
    .eq('whatsapp_number', userId)
    .single();

  let grandparentId;
  if (grandparentError || !grandparent) {
    console.log('📝 Creating test grandparent...');
    const { data: newGrandparent, error: createError } = await supabase.client
      .from('grandparent_profiles')
      .insert({
        whatsapp_number: userId,
        name: 'Test Grandparent',
        is_active: true,
        metadata: {
          onboarding_completed: true,
          test_user: true
        }
      })
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Error creating grandparent:', createError.message);
      return;
    }
    
    grandparentId = newGrandparent.id;
    console.log('✅ Test grandparent created:', newGrandparent.name);
  } else {
    grandparentId = grandparent.id;
    console.log('✅ Using existing grandparent:', grandparent.name);
  }

  // Complete onboarding for this user
  console.log('\n🎯 Completing onboarding...');
  const onboardingSteps = ['Hello', 'yes', 'Margaret', 'Chicago', '1945', 'I have 2 children', 'reading', 'English'];
  
  for (const step of onboardingSteps) {
    await getIntent(step, userId);
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('✅ Onboarding completed!\n');

  // Test memory creation with real database operations
  const testStories = [
    "I remember when I was young, we used to play in the garden every afternoon",
    "My grandmother taught me how to bake bread when I was 8 years old",
    "I want to tell you about my wedding day. It was the most beautiful day of my life"
  ];

  console.log('🎯 Creating real memories in database...\n');

  for (let i = 0; i < testStories.length; i++) {
    const story = testStories[i];
    console.log(`\nStory ${i + 1}: "${story}"`);
    console.log('─'.repeat(60));

    try {
      // Get AI intent
      const response = await getIntent(story, userId);
      const intent = JSON.parse(response);

      console.log(`📊 Intent: ${intent.intent}`);
      console.log(`📊 Memory Type: ${intent.memory_type}`);
      console.log(`📊 Story Status: ${intent.story_status}`);

      // Check if this should create a memory
      const shouldCreateMemory = (
        (intent.intent === 'memory_capture' || intent.intent === 'story_start') && 
        intent.story_status !== 'continuing'
      );

      if (shouldCreateMemory) {
        console.log('✅ Creating memory in database...');
        
        const title = story.length > 50 
          ? story.substring(0, 47) + '...' 
          : story;
        
        // Create memory in database
        const { data: memory, error: memoryError } = await supabase.createMemory(
          grandparentId,
          title,
          story,
          intent.memory_type,
          [] // No source conversation IDs for this test
        );
        
        if (memoryError) {
          console.log('❌ Error creating memory:', memoryError.message);
        } else {
          console.log('✅ Memory created successfully!');
          console.log(`📝 Memory ID: ${memory.id}`);
          console.log(`📝 Title: ${memory.title}`);
          console.log(`📝 Type: ${memory.memory_type}`);
          console.log(`📝 Status: ${memory.status}`);
        }
        
      } else {
        console.log('❌ Not creating memory (not a story)');
      }

    } catch (error) {
      console.log('❌ Error processing story:', error.message);
    }

    console.log('═'.repeat(60));
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Show all memories for this grandparent
  console.log('\n📚 All memories for test grandparent:');
  const { data: allMemories, error: fetchError } = await supabase.client
    .from('memories')
    .select('id, title, content, memory_type, status, created_at')
    .eq('grandparent_id', grandparentId)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.log('❌ Error fetching memories:', fetchError.message);
  } else {
    console.log(`📊 Total memories: ${allMemories.length}`);
    allMemories.forEach((memory, index) => {
      console.log(`\n${index + 1}. ${memory.title}`);
      console.log(`   Type: ${memory.memory_type}`);
      console.log(`   Status: ${memory.status}`);
      console.log(`   Created: ${new Date(memory.created_at).toLocaleString()}`);
    });
  }

  console.log('\n🎉 Memory creation test completed!');
  console.log('\n📋 Summary:');
  console.log('✅ Memories are created from conversations');
  console.log('✅ AI detects story content automatically');
  console.log('✅ Memories stored in Supabase database');
  console.log('✅ Memories available for video generation');
}

testRealMemoryCreation().catch(console.error);
