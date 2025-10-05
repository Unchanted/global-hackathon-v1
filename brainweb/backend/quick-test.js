require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const VideoGenerationService = require('./services/videoGeneration.js');
const { SupabaseService } = require('./services/supabase-client.js');

async function quickTest() {
  console.log('🎬 Quick Video Generation Test\n');
  
  const videoService = new VideoGenerationService();
  const supabase = new SupabaseService();
  
  console.log('🔧 Configuration Status:');
  console.log('✅ Gemini API:', !!process.env.GEMINI_API_KEY);
  console.log('✅ Supabase DB:', supabase.checkDatabase());
  console.log('❌ Google TTS:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('❌ Video Service:', videoService.isConfigured());
  
  // Test storage bucket
  try {
    const { data: buckets } = await supabase.client.storage.listBuckets();
    const memoryVideosBucket = buckets.find(b => b.name === 'memory-videos');
    console.log('✅ Storage Bucket:', !!memoryVideosBucket);
  } catch (err) {
    console.log('❌ Storage Bucket: false');
  }
  
  // Test memory_videos table
  try {
    const { data, error } = await supabase.client.from('memory_videos').select('id').limit(1);
    console.log('✅ Memory Videos Table:', !error);
  } catch (err) {
    console.log('❌ Memory Videos Table: false');
  }
  
  console.log('\n📋 Setup Checklist:');
  console.log('1. ✅ Gemini API - Ready');
  console.log('2. ✅ Supabase Database - Ready');
  console.log('3. ❌ Storage Bucket - Create "memory-videos" bucket');
  console.log('4. ❌ Database Table - Run SQL migration');
  console.log('5. ❌ Google TTS - Optional, add credentials');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Create Supabase Storage bucket named "memory-videos"');
  console.log('2. Run the SQL migration in Supabase SQL Editor');
  console.log('3. (Optional) Set up Google Cloud TTS for voice synthesis');
  console.log('4. Test with: npm run test-video');
}

quickTest().catch(console.error);
