import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  staticFile,
} from 'remotion';

// Video composition components for Remotion
export const MemoryVideoComposition = ({ memories, script }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.8,
        }}
      />
      
      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '60px',
          color: 'white',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Title animation */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 40,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            transform: `scale(${spring({
              frame,
              fps,
              config: {
                damping: 200,
              },
            })})`,
          }}
        >
          {script.title || 'Precious Memories'}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 32,
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.4,
            opacity: interpolate(frame, [0, 30], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {script.subtitle || 'A collection of life stories and cherished moments'}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const MemorySlideComposition = ({ memory, scriptSection, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const slideInAnimation = spring({
    frame: frame - index * durationInFrames,
    fps,
    config: {
      damping: 200,
    },
  });

  const fadeInOpacity = interpolate(
    frame - index * durationInFrames,
    [0, 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <AbsoluteFill>
      {/* Background image */}
      {memory.backgroundImage && (
        <Img
          src={memory.backgroundImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7)',
          }}
        />
      )}

      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
          transform: `translateY(${(1 - slideInAnimation) * 100}px)`,
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
          {scriptSection.title || memory.title}
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
          {scriptSection.narration || memory.content}
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
          {memory.memory_type?.toUpperCase() || 'STORY'}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ConclusionComposition = ({ script }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeInOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#2c3e50',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        opacity: fadeInOpacity,
      }}
    >
      <h1
        style={{
          fontSize: 64,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 40,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        Thank You
      </h1>

      <p
        style={{
          fontSize: 32,
          textAlign: 'center',
          maxWidth: '60%',
          lineHeight: 1.5,
        }}
      >
        {script.conclusion || 'Thank you for sharing these precious memories with your family.'}
      </p>

      <div
        style={{
          position: 'absolute',
          bottom: 60,
          fontSize: 24,
          opacity: 0.8,
        }}
      >
        Created with ❤️ by Memory Keeper
      </div>
    </AbsoluteFill>
  );
};

// Remotion configuration
export const RemotionRoot = () => {
  return (
    <>
      {/* Register compositions */}
    </>
  );
};
