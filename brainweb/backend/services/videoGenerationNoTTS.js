const { GoogleGenerativeAI } = require('@google/generative-ai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const { SupabaseService } = require('./supabase-client.js');
const RemotionVideoRenderer = require('./remotionRenderer.js');

// Configure FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

class VideoGenerationService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.supabase = new SupabaseService();
    this.remotionRenderer = new RemotionVideoRenderer();
    this.tempDir = path.join(__dirname, '../temp/video-generation');
  }

  /**
   * Generate a complete memory video from stored memories
   * @param {string} grandparentId - ID of the grandparent
   * @param {Array} memoryIds - Array of memory IDs to include in video
   * @param {Object} options - Video generation options
   * @returns {Object} Video generation result
   */
  async generateMemoryVideo(grandparentId, memoryIds, options = {}) {
    try {
      console.log('🎬 Starting memory video generation...');
      console.log('📊 Grandparent ID:', grandparentId);
      console.log('📚 Memory IDs:', memoryIds);

      // Ensure temp directory exists
      await fs.ensureDir(this.tempDir);

      // 1. Fetch memories and media from Supabase
      const memories = await this.fetchMemoriesWithMedia(memoryIds);
      console.log('📖 Fetched memories:', memories.length);

      // 2. Generate narration script using Gemini
      const script = await this.generateNarrationScript(memories, options);
      console.log('📝 Generated script:', script.sections.length, 'sections');

      // 3. Create video slides with images and text (no voiceover for now)
      const slides = await this.createVideoSlides(script.sections, memories, options);
      console.log('🖼️ Created slides:', slides.length);

      // 4. Render video using Remotion (without audio)
      const videoFile = await this.renderVideoWithRemotion(slides, null, memories, script, options);
      console.log('🎥 Rendered video:', videoFile);

      // 5. Upload to Supabase Storage
      const videoUrl = await this.uploadVideoToStorage(videoFile, grandparentId);
      console.log('☁️ Uploaded to storage:', videoUrl);

      // 6. Clean up temporary files
      await this.cleanupTempFiles();

      return {
        success: true,
        videoUrl: videoUrl,
        duration: script.estimatedDuration,
        slidesCount: slides.length,
        memoriesIncluded: memories.length,
        hasAudio: false // No audio for now
      };

    } catch (error) {
      console.error('❌ Video generation failed:', error);
      await this.cleanupTempFiles();
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fetch memories with associated media from Supabase
   */
  async fetchMemoriesWithMedia(memoryIds) {
    const { data: memories, error } = await this.supabase.client
      .from('memories')
      .select(`
        *,
        conversations (
          id,
          content,
          media_url,
          media_type,
          media_analysis
        )
      `)
      .in('id', memoryIds)
      .eq('status', 'published');

    if (error) {
      throw new Error(`Failed to fetch memories: ${error.message}`);
    }

    return memories || [];
  }

  /**
   * Generate narration script using Gemini API
   */
  async generateNarrationScript(memories, options) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are creating a narration script for a memory video about a grandparent's life stories. 

MEMORIES TO INCLUDE:
${memories.map((memory, index) => `
Memory ${index + 1}: ${memory.title}
Content: ${memory.content}
Type: ${memory.memory_type}
`).join('\n')}

VIDEO REQUIREMENTS:
- Duration: ${options.duration || '2-3 minutes'}
- Tone: Warm, nostalgic, family-friendly
- Style: Personal storytelling, like a family documentary
- Include: Introduction, main stories, conclusion
- NO AUDIO: This video will be text-only with visual elements

Please create a structured narration script with:
1. Introduction (welcome the family)
2. Main story sections (one per memory)
3. Conclusion (thank you message)

For each section, provide:
- Narration text (natural, conversational)
- Visual suggestions (what images/text to show)
- Timing estimates
- Emotional tone

Respond in JSON format:
{
  "introduction": "text",
  "sections": [
    {
      "title": "section title",
      "narration": "narration text",
      "visualSuggestions": "what to show",
      "duration": "estimated seconds",
      "tone": "emotional tone"
    }
  ],
  "conclusion": "text",
  "fullScript": "complete script text",
  "estimatedDuration": "total duration in seconds"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const scriptText = response.text();

    // Parse JSON response
    try {
      const script = JSON.parse(scriptText);
      return script;
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        introduction: "Welcome to this special collection of memories.",
        sections: memories.map((memory, index) => ({
          title: memory.title,
          narration: memory.content.substring(0, 200) + "...",
          visualSuggestions: "Show photos and text overlays",
          duration: 30,
          tone: "warm"
        })),
        conclusion: "Thank you for sharing these precious memories.",
        fullScript: scriptText,
        estimatedDuration: memories.length * 30
      };
    }
  }

  /**
   * Create video slides with images and text overlays
   */
  async createVideoSlides(scriptSections, memories, options) {
    const slides = [];

    for (let i = 0; i < scriptSections.length; i++) {
      const section = scriptSections[i];
      const memory = memories[i] || memories[0]; // Fallback to first memory

      const slide = {
        id: i,
        title: section.title,
        narration: section.narration,
        duration: parseInt(section.duration) || 30,
        backgroundImage: await this.prepareBackgroundImage(memory),
        textOverlay: await this.createTextOverlay(section.title, section.narration),
        visualSuggestions: section.visualSuggestions
      };

      slides.push(slide);
    }

    return slides;
  }

  /**
   * Prepare background image for slide
   */
  async prepareBackgroundImage(memory) {
    // Try to find a photo from conversations
    const conversations = memory.conversations || [];
    const photoConversation = conversations.find(conv => conv.media_type === 'image');

    if (photoConversation && photoConversation.media_url) {
      // Download and process the image
      const imagePath = path.join(this.tempDir, `slide_${memory.id}.jpg`);
      // TODO: Download image from Supabase Storage
      return imagePath;
    }

    // Use default background or generate one
    return await this.createDefaultBackground();
  }

  /**
   * Create default background image
   */
  async createDefaultBackground() {
    const defaultPath = path.join(this.tempDir, 'default_bg.jpg');
    
    // Create a simple gradient background
    await sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 3,
        background: { r: 135, g: 206, b: 235 } // Sky blue
      }
    })
    .jpeg()
    .toFile(defaultPath);

    return defaultPath;
  }

  /**
   * Create text overlay for slide
   */
  async createTextOverlay(title, narration) {
    // For now, return text data - actual text rendering will be done in video assembly
    return {
      title: title,
      subtitle: narration.substring(0, 100) + (narration.length > 100 ? '...' : ''),
      fontSize: 48,
      fontColor: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.7)'
    };
  }

  /**
   * Render video using Remotion for high-quality output
   */
  async renderVideoWithRemotion(slides, audioFile, memories, script, options) {
    try {
      // Prepare video data for Remotion
      const videoData = {
        memories: memories,
        script: script,
        slides: slides,
        audioFile: audioFile,
        options: options,
        hasAudio: false // No audio for now
      };

      // Render using Remotion
      const videoPath = await this.remotionRenderer.renderMemoryVideo(videoData, {
        codec: 'h264',
        crf: 18, // High quality
        fps: 30,
        width: 1920,
        height: 1080,
      });

      return videoPath;

    } catch (error) {
      console.error('❌ Remotion rendering failed, falling back to FFmpeg:', error);
      // Fallback to FFmpeg if Remotion fails
      return await this.assembleVideoWithFFmpeg(slides, audioFile, options);
    }
  }

  /**
   * Fallback video assembly using FFmpeg
   */
  async assembleVideoWithFFmpeg(slides, audioFile, options) {
    const outputPath = path.join(this.tempDir, 'memory_video.mp4');
    
    return new Promise((resolve, reject) => {
      let ffmpegCommand = ffmpeg();

      // Create video from slides (no audio for now)
      ffmpegCommand
        .inputOptions(['-loop', '1', '-t', '10']) // 10 seconds per slide
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt', 'yuv420p',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('✅ FFmpeg video assembly completed');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg video assembly failed:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Upload video to Supabase Storage
   */
  async uploadVideoToStorage(videoPath, grandparentId) {
    const fileName = `memory-video-${grandparentId}-${Date.now()}.mp4`;
    const fileBuffer = await fs.readFile(videoPath);

    const { data, error } = await this.supabase.client.storage
      .from('memory-videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600'
      });

    if (error) {
      throw new Error(`Failed to upload video: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.client.storage
      .from('memory-videos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles() {
    try {
      await fs.remove(this.tempDir);
      await this.remotionRenderer.cleanup();
      console.log('🧹 Cleaned up temporary files');
    } catch (error) {
      console.error('⚠️ Failed to clean up temp files:', error);
    }
  }

  /**
   * Check if video generation is properly configured
   */
  isConfigured() {
    return !!(
      process.env.GEMINI_API_KEY &&
      this.supabase.checkDatabase() &&
      this.remotionRenderer.isConfigured()
    );
  }
}

module.exports = VideoGenerationService;
