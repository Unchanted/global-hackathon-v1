const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs-extra');
const path = require('path');

class VoiceTranscriptionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async transcribeVoiceMessage(voiceBuffer, filename = 'voice_message.ogg') {
    try {
      console.log('🎤 Starting voice transcription with Gemini...');
      
      // Create a temporary file for the voice message
      const tempDir = path.join(__dirname, '../temp');
      await fs.ensureDir(tempDir);
      
      const tempFilePath = path.join(tempDir, filename);
      await fs.writeFile(tempFilePath, voiceBuffer);
      
      console.log('📁 Voice file saved to:', tempFilePath);
      
      // Convert audio file to base64 for Gemini
      const audioData = await fs.readFile(tempFilePath);
      const base64Audio = audioData.toString('base64');
      
      // Use Gemini's multimodal capabilities for speech-to-text
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const prompt = `Please transcribe this audio file accurately. Return only the transcribed text without any additional commentary, formatting, or quotation marks. If the audio is unclear or contains background noise, do your best to transcribe what you can hear.`;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Audio,
            mimeType: 'audio/ogg'
          }
        }
      ]);
      
      const transcription = result.response.text();
      
      console.log('✅ Transcription completed:', transcription);
      
      // Clean up temporary file
      await fs.remove(tempFilePath);
      
      return {
        success: true,
        transcript: transcription.trim(),
        filename: filename
      };
      
    } catch (error) {
      console.error('❌ Voice transcription failed:', error);
      
      // Clean up temporary file if it exists
      try {
        const tempFilePath = path.join(__dirname, '../temp', filename);
        await fs.remove(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
      
      return {
        success: false,
        error: error.message,
        transcript: null
      };
    }
  }

  async transcribeFromUrl(voiceUrl) {
    try {
      console.log('🎤 Starting voice transcription from URL with Gemini...');
      
      // Download the voice file
      const response = await fetch(voiceUrl);
      if (!response.ok) {
        throw new Error(`Failed to download voice file: ${response.statusText}`);
      }
      
      const voiceBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(voiceBuffer);
      
      // Extract filename from URL or use default
      const urlParts = voiceUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'voice_message.ogg';
      
      return await this.transcribeVoiceMessage(buffer, filename);
      
    } catch (error) {
      console.error('❌ Voice transcription from URL failed:', error);
      return {
        success: false,
        error: error.message,
        transcript: null
      };
    }
  }

  // Helper method to check if Gemini API key is configured
  isConfigured() {
    return !!process.env.GEMINI_API_KEY;
  }
}

module.exports = VoiceTranscriptionService;
