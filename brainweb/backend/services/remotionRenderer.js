const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs-extra');

class RemotionVideoRenderer {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp/remotion');
    this.outputDir = path.join(__dirname, '../temp/video-output');
  }

  /**
   * Render a memory video using Remotion
   * @param {Object} videoData - Video composition data
   * @param {Object} options - Render options
   * @returns {string} Path to rendered video file
   */
  async renderMemoryVideo(videoData, options = {}) {
    try {
      console.log('🎬 Starting Remotion video rendering...');

      // Ensure directories exist
      await fs.ensureDir(this.tempDir);
      await fs.ensureDir(this.outputDir);

      // Create Remotion project structure
      const projectPath = await this.createRemotionProject(videoData);

      // Bundle the Remotion project
      const bundleLocation = await bundle({
        entryPoint: path.join(projectPath, 'src/Root.js'),
        webpackOverride: (config) => config,
      });

      console.log('📦 Remotion project bundled');

      // Select composition
      const compositions = await selectComposition({
        serveUrl: bundleLocation,
        id: 'MemoryVideo',
        inputProps: videoData,
      });

      console.log('🎭 Selected composition:', compositions.id);

      // Render the video
      const outputPath = path.join(
        this.outputDir,
        `memory-video-${Date.now()}.mp4`
      );

      await renderMedia({
        composition: compositions,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: videoData,
        ...options,
      });

      console.log('✅ Video rendered successfully:', outputPath);
      return outputPath;

    } catch (error) {
      console.error('❌ Remotion rendering failed:', error);
      throw error;
    }
  }

  /**
   * Create a temporary Remotion project structure
   */
  async createRemotionProject(videoData) {
    const projectPath = path.join(this.tempDir, 'remotion-project');
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'src'));

    // Create package.json
    const packageJson = {
      name: 'memory-video-project',
      version: '1.0.0',
      dependencies: {
        '@remotion/bundler': '^4.0.0',
        '@remotion/renderer': '^4.0.0',
        '@remotion/lambda': '^4.0.0',
        react: '^18.0.0',
        'react-dom': '^18.0.0',
      },
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create Root.js
    const rootJs = `
import React from 'react';
import { registerRoot } from 'remotion';
import { MemoryVideoComposition } from './MemoryVideoComposition';

registerRoot(() => {
  return React.createElement(MemoryVideoComposition);
});
`;

    await fs.writeFile(path.join(projectPath, 'src/Root.js'), rootJs);

    // Create MemoryVideoComposition.jsx
    const compositionJsx = `
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
} from 'remotion';

export const MemoryVideoComposition = ({ memories = [], script = {} }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Calculate which slide to show based on frame
  const slideDuration = 120; // 4 seconds per slide at 30fps
  const currentSlideIndex = Math.floor(frame / slideDuration);
  const currentMemory = memories[currentSlideIndex] || memories[0];

  const slideInAnimation = spring({
    frame: frame % slideDuration,
    fps,
    config: {
      damping: 200,
    },
  });

  const fadeInOpacity = interpolate(
    frame % slideDuration,
    [0, 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill>
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '80px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
          transform: \`translateY(\${(1 - slideInAnimation) * 100}px)\`,
          opacity: fadeInOpacity,
        }}
      >
        {/* Memory title */}
        <h2
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 30,
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
          }}
        >
          {currentMemory?.title || 'Precious Memory'}
        </h2>

        {/* Memory content */}
        <div
          style={{
            fontSize: 28,
            textAlign: 'center',
            maxWidth: '70%',
            lineHeight: 1.6,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '40px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {currentMemory?.content || 'A beautiful memory to cherish forever.'}
        </div>

        {/* Memory type indicator */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: 18,
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
          }}
        >
          {currentMemory?.memory_type?.toUpperCase() || 'STORY'}
        </div>
      </div>
    </AbsoluteFill>
  );
};
`;

    await fs.writeFile(
      path.join(projectPath, 'src/MemoryVideoComposition.jsx'),
      compositionJsx
    );

    return projectPath;
  }

  /**
   * Clean up temporary files
   */
  async cleanup() {
    try {
      await fs.remove(this.tempDir);
      console.log('🧹 Cleaned up Remotion temp files');
    } catch (error) {
      console.error('⚠️ Failed to clean up Remotion temp files:', error);
    }
  }

  /**
   * Check if Remotion is properly configured
   */
  isConfigured() {
    try {
      // Check if required packages are available
      require('@remotion/bundler');
      require('@remotion/renderer');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = RemotionVideoRenderer;
