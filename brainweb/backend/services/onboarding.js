const { SupabaseService } = require('./supabase-client.js');

class OnboardingService {
  constructor() {
    this.supabase = new SupabaseService();
    this.onboardingSteps = new Map();
  }

  // Define onboarding steps
  getOnboardingSteps() {
    return [
      {
        step: 'name',
        question: "Hello! I'm so happy you're here! 😊 I'm your Memory Keeper, and I'd love to help you share your wonderful life stories and memories with your family.\n\nTo get started, could you please tell me your name? This will help me personalize our conversations and make your memories even more special.",
        field: 'name',
        validation: (value) => value && value.length >= 2 && value.length <= 50
      },
      {
        step: 'location',
        question: "Thank you, {name}! It's wonderful to meet you! 🌟\n\nNow, could you tell me where you're from? This helps me understand the places that are special to you. You can share your city, state, or country - whatever feels comfortable to share.",
        field: 'location',
        validation: (value) => value && value.length >= 2
      },
      {
        step: 'birth_year',
        question: "That's lovely, {name}! I can already picture the beautiful places you've called home.\n\nIf you're comfortable sharing, what year were you born? This helps me understand the era of your memories and stories. (You can just give me the decade if you prefer, like 'the 1940s')",
        field: 'birth_year',
        validation: (value) => {
          const year = parseInt(value);
          return year && year >= 1900 && year <= 2020;
        }
      },
      {
        step: 'family',
        question: "Thank you for sharing that, {name}! I love learning about the times you've lived through.\n\nNow, tell me about your family! How many children and grandchildren do you have? This helps me understand who will treasure your stories. (For example: 'I have 3 children and 5 grandchildren')",
        field: 'family_info',
        validation: (value) => value && value.length >= 5
      },
      {
        step: 'interests',
        question: "How wonderful, {name}! Your family is so lucky to have you sharing these precious memories.\n\nWhat are some things you enjoy or have enjoyed doing? This could be hobbies, activities, or anything that brings you joy. (For example: 'I love gardening, cooking, and reading')",
        field: 'interests',
        validation: (value) => value && value.length >= 3
      },
      {
        step: 'language',
        question: "Those sound like wonderful interests, {name}! I can already imagine the stories you'll have about these activities.\n\nWhat language would you prefer for our conversations? I can chat with you in English, or if you're more comfortable in another language, just let me know!",
        field: 'preferred_language',
        validation: (value) => value && value.length >= 2,
        default: 'en'
      },
      {
        step: 'complete',
        question: "Perfect, {name}! Thank you so much for sharing all of this with me. I feel like I'm getting to know you already! 🌟\n\nYour profile is now complete, and I'm ready to help you share your precious memories and life stories with your family. Your stories are treasures that deserve to be preserved and shared.\n\nWhat would you like to tell me about today? Maybe a memory from your childhood, or a story about your family? I'm all ears! 😊",
        field: null,
        validation: () => true
      }
    ];
  }

  // Start onboarding for a new user
  startOnboarding(userId) {
    const steps = this.getOnboardingSteps();
    this.onboardingSteps.set(userId, {
      currentStep: 0,
      data: {},
      steps: steps
    });
    return steps[0];
  }

  // Process onboarding response
  processOnboardingStep(userId, userMessage) {
    const onboarding = this.onboardingSteps.get(userId);
    if (!onboarding) {
      return null;
    }

    const currentStep = onboarding.steps[onboarding.currentStep];
    const field = currentStep.field;

    // Extract and clean the response based on the field
    let processedValue = this.extractFieldValue(userMessage, field);
    
    // Validate the response
    if (field && !currentStep.validation(processedValue)) {
      return {
        step: currentStep.step,
        question: `I'd love to get that information from you, {name}! Could you please try again? ${currentStep.question.split('\n\n')[1] || ''}`,
        isValid: false,
        completed: false
      };
    }

    // Store the data
    if (field) {
      onboarding.data[field] = processedValue;
    }

    // Move to next step
    onboarding.currentStep++;

    // Check if onboarding is complete
    if (onboarding.currentStep >= onboarding.steps.length) {
      this.onboardingSteps.delete(userId);
      return {
        step: 'complete',
        question: null,
        isValid: true,
        completed: true,
        data: onboarding.data
      };
    }

    // Get next step
    const nextStep = onboarding.steps[onboarding.currentStep];
    return {
      step: nextStep.step,
      question: this.formatQuestion(nextStep.question, onboarding.data),
      isValid: true,
      completed: false,
      data: onboarding.data
    };
  }

  // Extract and clean field values from natural language responses
  extractFieldValue(message, field) {
    const cleanMessage = message.trim();
    
    switch (field) {
      case 'name':
        // Extract name from various patterns
        if (cleanMessage.toLowerCase().includes('my name is')) {
          return cleanMessage.replace(/my name is/gi, '').trim();
        } else if (cleanMessage.toLowerCase().includes('i am')) {
          return cleanMessage.replace(/i am/gi, '').trim();
        } else if (cleanMessage.toLowerCase().includes('i\'m')) {
          return cleanMessage.replace(/i\'m/gi, '').trim();
        } else if (cleanMessage.toLowerCase().includes('this is')) {
          return cleanMessage.replace(/this is/gi, '').trim();
        }
        // Remove common greetings
        return cleanMessage.replace(/^(hi|hello|hey|good morning|good afternoon|good evening)[,\s]*/gi, '').trim();
        
      case 'location':
        // Extract location from various patterns
        if (cleanMessage.toLowerCase().includes('i am from')) {
          return cleanMessage.replace(/i am from/gi, '').trim();
        } else if (cleanMessage.toLowerCase().includes('i\'m from')) {
          return cleanMessage.replace(/i\'m from/gi, '').trim();
        } else if (cleanMessage.toLowerCase().includes('from')) {
          const parts = cleanMessage.split(/from/i);
          if (parts.length > 1) {
            return parts[1].trim();
          }
        }
        return cleanMessage;
        
      case 'birth_year':
        // Extract year from various patterns
        const yearMatch = cleanMessage.match(/\b(19\d{2}|20\d{2})\b/);
        if (yearMatch) {
          return yearMatch[1];
        }
        // Check for decade patterns
        const decadeMatch = cleanMessage.match(/\b(the\s+)?(19\d{0}0s|20\d{0}0s)\b/i);
        if (decadeMatch) {
          const decade = decadeMatch[2].replace('s', '');
          return decade;
        }
        return cleanMessage;
        
      case 'family_info':
        // Extract family information
        return cleanMessage;
        
      case 'interests':
        // Extract interests
        return cleanMessage;
        
      case 'preferred_language':
        // Extract language preference
        if (cleanMessage.toLowerCase().includes('english')) {
          return 'en';
        } else if (cleanMessage.toLowerCase().includes('spanish')) {
          return 'es';
        } else if (cleanMessage.toLowerCase().includes('french')) {
          return 'fr';
        }
        return cleanMessage.toLowerCase().includes('fine') || cleanMessage.toLowerCase().includes('ok') ? 'en' : cleanMessage;
        
      default:
        return cleanMessage;
    }
  }

  // Format question with user data
  formatQuestion(question, data) {
    let formatted = question;
    if (data.name) {
      formatted = formatted.replace(/{name}/g, data.name);
    }
    return formatted;
  }

  // Check if user is in onboarding
  isUserInOnboarding(userId) {
    return this.onboardingSteps.has(userId);
  }

  // Get current onboarding step
  getCurrentStep(userId) {
    const onboarding = this.onboardingSteps.get(userId);
    if (!onboarding) return null;
    return onboarding.steps[onboarding.currentStep];
  }

  // Save onboarding data to database
  async saveOnboardingData(userId, onboardingData) {
    try {
      if (!this.supabase.isEnabled) {
        console.error('Supabase not enabled');
        return false;
      }

      // Parse family info
      let familyInfo = {};
      if (onboardingData.family_info) {
        const familyText = onboardingData.family_info.toLowerCase();
        const childrenMatch = familyText.match(/(\d+)\s*children?/);
        const grandchildrenMatch = familyText.match(/(\d+)\s*grandchildren?/);
        
        familyInfo = {
          children: childrenMatch ? parseInt(childrenMatch[1]) : 0,
          grandchildren: grandchildrenMatch ? parseInt(grandchildrenMatch[1]) : 0,
          description: onboardingData.family_info
        };
      }

      // Parse interests
      let interests = [];
      if (onboardingData.interests) {
        interests = onboardingData.interests.split(',').map(i => i.trim()).filter(i => i.length > 0);
      }

      // Parse birth year
      let birthYear = null;
      if (onboardingData.birth_year) {
        const yearMatch = onboardingData.birth_year.match(/\d{4}/);
        if (yearMatch) {
          birthYear = parseInt(yearMatch[0]);
        }
      }

      // Update grandparent profile
      const { error } = await this.supabase.client
        .from('grandparent_profiles')
        .update({
          name: onboardingData.name,
          location: onboardingData.location,
          birth_year: birthYear,
          preferred_language: onboardingData.preferred_language || 'en',
          family_notes: familyInfo.description,
          metadata: {
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
            family_info: familyInfo,
            interests: interests,
            onboarding_data: onboardingData
          }
        })
        .eq('whatsapp_number', userId);

      if (error) {
        console.error('Error saving onboarding data:', error);
        return false;
      }

      console.log('✅ Onboarding data saved successfully for user:', userId);
      return true;

    } catch (error) {
      console.error('Error in saveOnboardingData:', error);
      return false;
    }
  }
}

module.exports = OnboardingService;
