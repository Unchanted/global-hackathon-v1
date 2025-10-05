const { getIntent, getUserName, hasUserCompletedNameCollection } = require('./services/intent.js');

async function testNameCollection() {
  console.log('🧪 Testing Name Collection Flow...\n');

  const testUserId = '1234567890';

  // Test 1: First message (should ask for name)
  console.log('1️⃣ Testing first message...');
  const firstResponse = await getIntent('Hello', testUserId);
  const firstIntent = JSON.parse(firstResponse);
  console.log('Response:', firstIntent.message);
  console.log('Intent:', firstIntent.intent);
  console.log('Name collected:', hasUserCompletedNameCollection(testUserId));
  console.log('');

  // Test 2: Provide a name
  console.log('2️⃣ Testing name provision...');
  const nameResponse = await getIntent('My name is Rose', testUserId);
  const nameIntent = JSON.parse(nameResponse);
  console.log('Response:', nameIntent.message);
  console.log('Intent:', nameIntent.intent);
  console.log('Name collected:', hasUserCompletedNameCollection(testUserId));
  console.log('Collected name:', getUserName(testUserId));
  console.log('');

  // Test 3: Continue conversation with personalized response
  console.log('3️⃣ Testing personalized conversation...');
  const storyResponse = await getIntent('I remember my childhood home', testUserId);
  const storyIntent = JSON.parse(storyResponse);
  console.log('Response:', storyIntent.message);
  console.log('Intent:', storyIntent.intent);
  console.log('');

  console.log('✅ Name collection test completed!');
}

// Run the test
testNameCollection().catch(console.error);
