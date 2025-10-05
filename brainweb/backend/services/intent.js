const { GoogleGenerativeAI } = require('@google/generative-ai');

// Store conversation context for each user
const userConversations = new Map();

// Store active story sessions for each user
const userStorySessions = new Map();

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

    // Check if there's an active story session
    const storySession = userStorySessions.get(userId);
    const isContinuingStory = storySession && storySession.isActive;

    // Add the new message to conversation history
    conversationHistory.push({ role: 'user', content: userMessage });

    // Build conversation context with story awareness
    let conversationContext = '';
    if (conversationHistory.length > 1) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.slice(-8).forEach(msg => { // Keep last 8 messages for better context
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
    }

    // Add story session context if active
    if (isContinuingStory) {
      conversationContext += `\n\nACTIVE STORY SESSION:\n`;
      conversationContext += `Story started: ${storySession.startedAt}\n`;
      conversationContext += `Story messages: ${storySession.messageCount}\n`;
      conversationContext += `Story theme: ${storySession.theme}\n`;
    }

    const prompt = `You are a warm, patient, and encouraging AI assistant helping grandparents share their life memories and stories through WhatsApp conversations.

Your role is to:
- Be warm, patient, and encouraging
- Ask gentle follow-up questions to help them share more details
- Show genuine interest in their stories
- Help them remember specific details (names, dates, places, feelings)
- Be conversational and natural, not robotic
- Guide them to share meaningful memories that their family would treasure
- Detect when someone is telling a multi-part story across multiple messages

STORY DETECTION RULES:
- If the message contains story elements (past events, people, places, experiences), it's likely a story
- If there's an active story session, continue encouraging them to complete it
- If a story seems complete (has beginning, middle, end), mark it as ready for memory creation
- Look for story indicators: "I remember", "when I was", "back then", "my teacher", "we used to", etc.

${conversationContext}

The grandparent just said: "${userMessage}"

${isContinuingStory ? 'This is part of an ongoing story. ' : ''}Respond in a warm, conversational way that encourages them to share more about their memory or story. Keep it brief but engaging. Ask follow-up questions that help them remember more details.

Examples of good responses:
- "That sounds wonderful! What was your favorite part about that time?"
- "I'd love to hear more about that! What was happening in your life then?"
- "That's such a beautiful memory! How did that make you feel?"
- "Tell me more about that person - what were they like?"
- "What happened next in that story?"

Respond with a JSON object in this format:
{
  "intent": "memory_capture|follow_up|greeting|story_start|story_continue|story_complete|other",
  "message": "your warm, encouraging response here",
  "memory_type": "story|photo|voice_note|general",
  "story_status": "starting|continuing|complete|none",
  "story_theme": "brief description of what the story is about"
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
          
          // Manage story sessions based on AI response
          manageStorySession(userId, parsedResponse, userMessage);
          
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

// Function to manage story sessions
function manageStorySession(userId, aiResponse, userMessage) {
  const storyStatus = aiResponse.story_status || 'none';
  const storyTheme = aiResponse.story_theme || '';
  
  if (storyStatus === 'starting') {
    // Start a new story session
    userStorySessions.set(userId, {
      isActive: true,
      startedAt: new Date().toISOString(),
      messageCount: 1,
      theme: storyTheme,
      messages: [userMessage],
      lastActivity: Date.now()
    });
    console.log(`📖 Started new story session for ${userId}: ${storyTheme}`);
    
  } else if (storyStatus === 'continuing') {
    // Continue existing story session
    const session = userStorySessions.get(userId);
    if (session) {
      session.messageCount++;
      session.messages.push(userMessage);
      session.lastActivity = Date.now();
      if (storyTheme) session.theme = storyTheme;
      console.log(`📖 Continuing story session for ${userId}: ${session.messageCount} messages`);
    }
    
  } else if (storyStatus === 'complete') {
    // Complete the story session
    const session = userStorySessions.get(userId);
    if (session) {
      session.isActive = false;
      session.completedAt = new Date().toISOString();
      session.messages.push(userMessage);
      console.log(`📖 Completed story session for ${userId}: ${session.messageCount} messages total`);
    }
    
  } else if (storyStatus === 'none') {
    // No story activity - check if we should timeout existing session
    const session = userStorySessions.get(userId);
    if (session && session.isActive) {
      const timeSinceLastActivity = Date.now() - session.lastActivity;
      // Timeout after 10 minutes of inactivity
      if (timeSinceLastActivity > 10 * 60 * 1000) {
        session.isActive = false;
        session.timedOut = true;
        console.log(`📖 Story session timed out for ${userId}`);
      }
    }
  }
}

// Function to get active story session
function getActiveStorySession(userId) {
  return userStorySessions.get(userId);
}

// Function to get completed story content
function getCompletedStoryContent(userId) {
  const session = userStorySessions.get(userId);
  if (session && !session.isActive && session.messages) {
    return {
      theme: session.theme,
      messages: session.messages,
      messageCount: session.messageCount,
      startedAt: session.startedAt,
      completedAt: session.completedAt
    };
  }
  return null;
}

module.exports = { getIntent, getActiveStorySession, getCompletedStoryContent };
