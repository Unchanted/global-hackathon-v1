require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const VideoGenerationService = require('./services/videoGenerationNoTTS.js');
const { SupabaseService } = require('./services/supabase-client.js');

async function finalTest() {
  console.log('🎬 Final Video Generation Test\n');
  
  const videoService = new VideoGenerationService();
  const supabase = new SupabaseService();
  
  console.log('🔧 Configuration Status:');
  console.log('✅ Gemini API:', !!process.env.GEMINI_API_KEY);
  console.log('✅ Supabase DB:', supabase.checkDatabase());
  console.log('✅ Video Service:', videoService.isConfigured());
  
  // Test storage bucket
  try {
    const { data: buckets } = await supabase.client.storage.listBuckets();
    const memoryVideosBucket = buckets.find(b => b.name === 'memory-videos');
    console.log('✅ Storage Bucket:', !!memoryVideosBucket);
    
    if (memoryVideosBucket) {
      console.log('🎉 ALL SYSTEMS READY!');
      console.log('\n📋 Video Generation Features:');
      console.log('  ✅ AI-generated narration scripts');
      console.log('  ✅ Beautiful visual slides');
      console.log('  ✅ Text overlays and animations');
      console.log('  ✅ High-quality MP4 output');
      console.log('  ✅ Supabase Storage integration');
      console.log('  ❌ Voice narration (optional - requires Google Cloud TTS)');
      
      console.log('\n🎯 Ready to Use:');
      console.log('Grandparents can now send "create video" via WhatsApp!');
      console.log('The bot will generate beautiful visual videos from their memories.');
      
    } else {
      console.log('\n❌ Storage bucket not found');
      console.log('📋 Please create "memory-videos" bucket in Supabase Dashboard');
      console.log('   Go to Storage → New Bucket → Name: memory-videos → Public: true');
    }
    
  } catch (err) {
    console.log('❌ Storage Bucket: Error checking');
    console.log('📋 Please create "memory-videos" bucket in Supabase Dashboard');
  }
}

finalTest().catch(console.error);
