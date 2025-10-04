const { GoogleGenerativeAI } = require('@google/generative-ai');

// Store conversation context for each user
const userConversations = new Map();

async function getIntent(userMessage, userId) {
  console.log('Received message from', userId, ':', userMessage);
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Get or create conversation history for this user
    if (!userConversations.has(userId)) {
      userConversations.set(userId, []);
    }
    const conversationHistory = userConversations.get(userId);

    // Add the new message to conversation history
    conversationHistory.push({ role: 'user', content: userMessage });

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 1) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.slice(-6).forEach(msg => { // Keep last 6 messages for context
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
    }

    const prompt = `You are a warm, patient, and encouraging AI assistant helping grandparents share their life memories and stories through WhatsApp conversations.

Your role is to:
- Be warm, patient, and encouraging
- Ask gentle follow-up questions to help them share more details
- Show genuine interest in their stories
- Help them remember specific details (names, dates, places, feelings)
- Be conversational and natural, not robotic
- Guide them to share meaningful memories that their family would treasure

${conversationContext}

The grandparent just said: "${userMessage}"

Respond in a warm, conversational way that encourages them to share more about their memory or story. Keep it brief but engaging. Ask follow-up questions that help them remember more details.

Examples of good responses:
- "That sounds wonderful! What was your favorite part about that time?"
- "I'd love to hear more about that! What was happening in your life then?"
- "That's such a beautiful memory! How did that make you feel?"
- "Tell me more about that person - what were they like?"

Respond with a JSON object in this format:
{
  "intent": "memory_capture|follow_up|greeting|other",
  "message": "your warm, encouraging response here",
  "memory_type": "story|photo|voice_note|general"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();
    
    console.log('AI Response:', aiResponse);
    
    // Clean the AI response (remove markdown code blocks if present)
    let cleanedResponse = aiResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse and add AI response to conversation history
    try {
      const parsedResponse = JSON.parse(cleanedResponse);
      conversationHistory.push({ role: 'assistant', content: parsedResponse.message });
      
      // Keep conversation history manageable (last 20 messages)
      if (conversationHistory.length > 20) {
        conversationHistory.splice(0, conversationHistory.length - 20);
      }
      
      return cleanedResponse;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', aiResponse);
      console.error('Cleaned response:', cleanedResponse);
      return JSON.stringify({
        intent: "follow_up",
        message: "That's interesting! Tell me more about that.",
        memory_type: "general"
      });
    }
    
  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Fallback responses if AI fails
    if (userMessage.toLowerCase().includes('hi') || userMessage.toLowerCase().includes('hello')) {
      return JSON.stringify({
        intent: "greeting",
        message: "Hello! I'm here to help you share your wonderful memories and stories. What would you like to tell me about today?",
        memory_type: "general"
      });
    }
    
    return JSON.stringify({
      intent: "follow_up",
      message: "I'm sorry, I'm having trouble processing that right now. Could you tell me more about what you were sharing?",
      memory_type: "general"
    });
  }
}

module.exports = { getIntent };
