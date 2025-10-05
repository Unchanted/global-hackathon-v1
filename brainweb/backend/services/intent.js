const { GoogleGenerativeAI } = require('@google/generative-ai');
const { SupabaseService } = require('./supabase-client.js');
const OnboardingService = require('./onboarding.js');

// Initialize Supabase for user data
const supabase = new SupabaseService();
const onboardingService = new OnboardingService();

// Store conversation context for each user
const userConversations = new Map();

// Store active story sessions for each user
const userStorySessions = new Map();

// Store user states (for name collection, etc.)
const userStates = new Map();

// Function to load user data from backend
async function loadUserData(userId) {
  try {
    if (!supabase.isEnabled) {
      return null;
    }
    
    const { data: grandparent, error } = await supabase.getGrandparentByWhatsApp(userId);
    if (error || !grandparent) {
      return null;
    }
    
    return {
      name: grandparent.name,
      metadata: grandparent.metadata,
      location: grandparent.location,
      birthYear: grandparent.birth_year,
      preferredLanguage: grandparent.preferred_language,
      familyNotes: grandparent.family_notes,
      memoriesCount: 0, // Could be loaded separately
      lastActive: grandparent.updated_at
    };
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
}

// Helper function to extract name from message
function extractNameFromMessage(message) {
  let name = message.trim();

  // Extract name from common patterns (including greetings)
  if (name.toLowerCase().includes('my name is')) {
    name = name.replace(/my name is/gi, '').trim();
  } else if (name.toLowerCase().includes('i am')) {
    name = name.replace(/i am/gi, '').trim();
  } else if (name.toLowerCase().includes('i\'m')) {
    name = name.replace(/i\'m/gi, '').trim();
  } else if (name.toLowerCase().includes('this is')) {
    name = name.replace(/this is/gi, '').trim();
  } else if (name.toLowerCase().includes('hi, i am')) {
    name = name.replace(/hi, i am/gi, '').trim();
  } else if (name.toLowerCase().includes('hello, i am')) {
    name = name.replace(/hello, i am/gi, '').trim();
  } else if (name.toLowerCase().includes('hi i am')) {
    name = name.replace(/hi i am/gi, '').trim();
  } else if (name.toLowerCase().includes('hello i am')) {
    name = name.replace(/hello i am/gi, '').trim();
  } else if (name.toLowerCase().includes('hi my name is')) {
    name = name.replace(/hi my name is/gi, '').trim();
  } else if (name.toLowerCase().includes('hello my name is')) {
    name = name.replace(/hello my name is/gi, '').trim();
  }

  // Remove common greetings from the beginning
  name = name.replace(/^(hi|hello|hey|good morning|good afternoon|good evening)[,\s]*/gi, '').trim();

  // Basic validation - check if it looks like a name
  // Allow letters, spaces, apostrophes, hyphens, and periods
  if (name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s.'-]+$/.test(name)) {
    return name;
  }
  return null;
}

// Function to handle name collection for new users
function handleNameCollection(userMessage, userId, userState) {
  console.log(`📝 Handling name collection for user ${userId}`);
  
  // If no user state exists, this is the very first message
  if (!userState) {
    // Check if the first message already contains a name
    const extractedName = extractNameFromMessage(userMessage);
    
    if (extractedName) {
      // Name was provided in the first message
      userStates.set(userId, {
        nameCollected: true,
        nameCollectionStep: 'completed',
        collectedName: extractedName,
        attempts: 0
      });

      return JSON.stringify({
        intent: "name_collection_complete",
        message: `Hello ${extractedName}! It's wonderful to meet you! 🌟\n\nI'm your Memory Keeper, and I'd love to help you share your precious memories and life stories with your family. Your stories are treasures that deserve to be preserved and shared.\n\nWhat would you like to tell me about today? Maybe a memory from your childhood, or a story about your family? I'm all ears! 😊`,
        memory_type: "general",
        story_status: "none",
        story_theme: "",
        user_state: "name_collected",
        collected_name: extractedName
      });
    } else {
      // No name detected, ask for it
      userStates.set(userId, {
        nameCollected: false,
        nameCollectionStep: 'asking',
        attempts: 0
      });

      return JSON.stringify({
        intent: "name_collection",
        message: "Hello! I'm so happy you're here! 😊 I'm your Memory Keeper, and I'd love to help you share your wonderful life stories and memories with your family.\n\nTo get started, could you please tell me your name? This will help me personalize our conversations and make your memories even more special.",
        memory_type: "general",
        story_status: "none",
        story_theme: "",
        user_state: "collecting_name"
      });
    }
  }
  
      // If we're collecting the name, process the response
      if (userState.nameCollectionStep === 'asking') {
        // Try to extract name from the message
        const extractedName = extractNameFromMessage(userMessage);
        
        if (extractedName) {
          // Name looks good, collect it
          userState.nameCollected = true;
          userState.nameCollectionStep = 'completed';
          userState.collectedName = extractedName;
          userStates.set(userId, userState);

          return JSON.stringify({
            intent: "name_collection_complete",
            message: `Hello ${extractedName}! It's wonderful to meet you! 🌟\n\nI'm here to help you share your precious memories and life stories with your family. Your stories are treasures that deserve to be preserved and shared.\n\nWhat would you like to tell me about today? Maybe a memory from your childhood, or a story about your family? I'm all ears! 😊`,
            memory_type: "general",
            story_status: "none",
            story_theme: "",
            user_state: "name_collected",
            collected_name: extractedName
          });
        } else {
          // Name extraction failed, ask again
          userState.attempts++;

          if (userState.attempts >= 3) {
            // After 3 attempts, use a default name
            userState.nameCollected = true;
            userState.nameCollectionStep = 'completed';
            userState.collectedName = 'Grandparent';
            userStates.set(userId, userState);

            return JSON.stringify({
              intent: "name_collection_complete",
              message: "That's okay! I'll call you Grandparent for now. You can always tell me your name later if you'd like.\n\nNow, I'd love to hear about your life! What's a memory or story you'd like to share with your family?",
              memory_type: "general",
              story_status: "none",
              story_theme: "",
              user_state: "name_collected",
              collected_name: "Grandparent"
            });
          }

          return JSON.stringify({
            intent: "name_collection",
            message: "I'd love to know your name! Could you please share your first name? It helps me make our conversations more personal. 😊",
            memory_type: "general",
            story_status: "none",
            story_theme: "",
            user_state: "collecting_name"
          });
        }
      }
  
  // Fallback
  return JSON.stringify({
    intent: "greeting",
    message: "Hello! I'm your Memory Keeper. What would you like to share with me today?",
    memory_type: "general",
    story_status: "none",
    story_theme: ""
  });
}

async function getIntent(userMessage, userId) {
  console.log('Received message from', userId, ':', userMessage);
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Check if this is a new user or in onboarding
    const userState = userStates.get(userId);
    const isNewUser = !userState || !userState.nameCollected;
    const isInOnboarding = onboardingService.isUserInOnboarding(userId);

    // Handle onboarding for new users
    if (isNewUser && !isInOnboarding) {
      // Start onboarding process
      const firstStep = onboardingService.startOnboarding(userId);
      return JSON.stringify({
        intent: "onboarding_start",
        message: firstStep.question,
        memory_type: "general",
        story_status: "none",
        story_theme: "",
        user_state: "onboarding",
        onboarding_step: firstStep.step
      });
    }

    // Handle ongoing onboarding
    if (isInOnboarding) {
      const onboardingResult = onboardingService.processOnboardingStep(userId, userMessage);
      
      if (onboardingResult.completed) {
        // Save onboarding data to database
        await onboardingService.saveOnboardingData(userId, onboardingResult.data);
        
        // Mark user as having completed onboarding
        userStates.set(userId, {
          nameCollected: true,
          nameCollectionStep: 'completed',
          collectedName: onboardingResult.data.name,
          onboardingCompleted: true
        });

        return JSON.stringify({
          intent: "onboarding_complete",
          message: onboardingResult.question,
          memory_type: "general",
          story_status: "none",
          story_theme: "",
          user_state: "onboarding_complete",
          onboarding_data: onboardingResult.data
        });
      } else {
        return JSON.stringify({
          intent: "onboarding_step",
          message: onboardingResult.question,
          memory_type: "general",
          story_status: "none",
          story_theme: "",
          user_state: "onboarding",
          onboarding_step: onboardingResult.step,
          onboarding_data: onboardingResult.data
        });
      }
    }

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

    // Load user data for personalization
    const userData = await loadUserData(userId);
    const userName = getUserName(userId);
    
    // Build user context for AI
    let userContext = '';
    if (userData) {
      userContext = `\n\nUSER PROFILE:\n`;
      userContext += `Name: ${userData.name}\n`;
      if (userData.location) userContext += `Location: ${userData.location}\n`;
      if (userData.birthYear) userContext += `Birth Year: ${userData.birthYear}\n`;
      if (userData.metadata?.interests) userContext += `Interests: ${userData.metadata.interests.join(', ')}\n`;
      if (userData.metadata?.family_info) {
        userContext += `Family: ${userData.metadata.family_info.children || 0} children, ${userData.metadata.family_info.grandchildren || 0} grandchildren\n`;
      }
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
- Vary your responses - don't repeat the same questions
- Reference their personal information when relevant (location, interests, family)
- Be more human-like and less formulaic

STORY DETECTION RULES:
- If the message contains story elements (past events, people, places, experiences), it's likely a story
- If there's an active story session, continue encouraging them to complete it
- If a story seems complete (has beginning, middle, end), mark it as ready for memory creation
- Look for story indicators: "I remember", "when I was", "back then", "my teacher", "we used to", etc.

${conversationContext}${userContext}

The grandparent's name is ${userName}.

The grandparent just said: "${userMessage}"

${isContinuingStory ? 'This is part of an ongoing story. ' : ''}Respond in a warm, conversational way that encourages them to share more about their memory or story. Use their name (${userName}) naturally in your response to make it more personal. Keep it brief but engaging. Ask follow-up questions that help them remember more details. Vary your language and don't repeat previous questions.

Examples of varied responses:
- "That sounds wonderful, ${userName}! What was your favorite part about that time?"
- "I'd love to hear more about that, ${userName}! What was happening in your life then?"
- "That's such a beautiful memory, ${userName}! How did that make you feel?"
- "Tell me more about that person, ${userName} - what were they like?"
- "What happened next in that story, ${userName}?"
- "That reminds me of something you mentioned before, ${userName}. Can you tell me more about..."
- "I'm curious about the details, ${userName}. What was it like when..."

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

// Function to get user's collected name
function getUserName(userId) {
  const userState = userStates.get(userId);
  return userState?.collectedName || 'Grandparent';
}

// Function to check if user has completed name collection
function hasUserCompletedNameCollection(userId) {
  const userState = userStates.get(userId);
  return userState?.nameCollected || false;
}

// Function to identify grandparent by name
function identifyGrandparentByName(name) {
  // Known grandparents database (in a real app, this would come from Supabase)
  const knownGrandparents = {
    'rose': {
      whatsapp_number: '1234567890',
      name: 'Rose Thompson',
      id: 'rose_thompson_id'
    },
    'rose thompson': {
      whatsapp_number: '1234567890',
      name: 'Rose Thompson',
      id: 'rose_thompson_id'
    },
    'grandma rose': {
      whatsapp_number: '1234567890',
      name: 'Rose Thompson',
      id: 'rose_thompson_id'
    }
  };

  const normalizedName = name.toLowerCase().trim();
  return knownGrandparents[normalizedName] || null;
}

// Function to get grandparent by name from message
function extractGrandparentFromMessage(message) {
  // Look for patterns that indicate a grandparent name
  const patterns = [
    /(?:i am|i'm|my name is|this is)\s+([a-zA-Z\s]+)/gi,
    /(?:grandma|grandpa|grandmother|grandfather)\s+([a-zA-Z\s]+)/gi,
    /^([a-zA-Z\s]+)$/gi // Direct name input
  ];

  for (const pattern of patterns) {
    const matches = [...message.matchAll(pattern)];
    for (const match of matches) {
      const name = match[1] || match[0];
      const grandparent = identifyGrandparentByName(name);
      if (grandparent) {
        return grandparent;
      }
    }
  }

  return null;
}

module.exports = { 
  getIntent, 
  getActiveStorySession, 
  getCompletedStoryContent, 
  getUserName, 
  hasUserCompletedNameCollection,
  identifyGrandparentByName,
  extractGrandparentFromMessage,
  userStates // Export for testing
};
