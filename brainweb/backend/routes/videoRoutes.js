const express = require('express');
const VideoGenerationService = require('./services/videoGeneration.js');
const { SupabaseService } = require('./services/supabase-client.js');

const router = express.Router();
const videoService = new VideoGenerationService();
const supabase = new SupabaseService();

/**
 * POST /api/video/generate
 * Generate a memory video for a grandparent
 */
router.post('/generate', async (req, res) => {
  try {
    const { grandparentId, memoryIds, options = {} } = req.body;

    // Validate input
    if (!grandparentId || !memoryIds || !Array.isArray(memoryIds)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: grandparentId and memoryIds'
      });
    }

    // Check if video generation is configured
    if (!videoService.isConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Video generation service is not properly configured'
      });
    }

    console.log('🎬 Video generation request received');
    console.log('📊 Grandparent ID:', grandparentId);
    console.log('📚 Memory IDs:', memoryIds);

    // Generate the video
    const result = await videoService.generateMemoryVideo(
      grandparentId,
      memoryIds,
      options
    );

    if (result.success) {
      // Save video metadata to database
      const { data: videoRecord, error: dbError } = await supabase.client
        .from('memory_videos')
        .insert({
          grandparent_id: grandparentId,
          video_url: result.videoUrl,
          duration: result.duration,
          slides_count: result.slidesCount,
          memories_included: result.memoriesIncluded,
          status: 'completed',
          created_at: new Date().toISOString()
        })
        .select();

      if (dbError) {
        console.error('❌ Failed to save video metadata:', dbError);
      }

      res.json({
        success: true,
        videoUrl: result.videoUrl,
        duration: result.duration,
        slidesCount: result.slidesCount,
        memoriesIncluded: result.memoriesIncluded,
        videoId: videoRecord?.[0]?.id
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Video generation API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during video generation'
    });
  }
});

/**
 * GET /api/video/:grandparentId
 * Get all videos for a specific grandparent
 */
router.get('/:grandparentId', async (req, res) => {
  try {
    const { grandparentId } = req.params;

    const { data: videos, error } = await supabase.client
      .from('memory_videos')
      .select('*')
      .eq('grandparent_id', grandparentId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch videos'
      });
    }

    res.json({
      success: true,
      videos: videos || []
    });

  } catch (error) {
    console.error('❌ Fetch videos API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/video/status/:videoId
 * Get the status of a specific video generation
 */
router.get('/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const { data: video, error } = await supabase.client
      .from('memory_videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      video: video
    });

  } catch (error) {
    console.error('❌ Video status API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/video/:videoId
 * Delete a video and its metadata
 */
router.delete('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    // Get video record first
    const { data: video, error: fetchError } = await supabase.client
      .from('memory_videos')
      .select('video_url')
      .eq('id', videoId)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    // Delete from storage
    if (video.video_url) {
      const fileName = video.video_url.split('/').pop();
      await supabase.client.storage
        .from('memory-videos')
        .remove([fileName]);
    }

    // Delete from database
    const { error: deleteError } = await supabase.client
      .from('memory_videos')
      .delete()
      .eq('id', videoId);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete video record'
      });
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete video API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
