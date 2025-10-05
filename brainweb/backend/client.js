require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getIntent, getActiveStorySession, getCompletedStoryContent, getUserName, hasUserCompletedNameCollection, identifyGrandparentByName, extractGrandparentFromMessage } = require('./services/intent.js');
const { SupabaseService } = require('./services/supabase-client.js');
const VoiceTranscriptionService = require('./services/voiceTranscription.js');
const VideoGenerationService = require('./services/videoGenerationNoTTS.js');

// Initialize services
const supabase = new SupabaseService();
const voiceTranscription = new VoiceTranscriptionService();
const videoGeneration = new VideoGenerationService();

const client = new Client({
    puppeteer: {
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {
    try {
        // Skip messages from groups and status updates
        if (msg.from.includes('@g.us') || msg.from.includes('status@broadcast')) {
            return;
        }

        // Skip messages sent by the bot itself
        if (msg.fromMe) {
            return;
        }

        console.log('\n📨 New message received:');
        console.log(`From: ${msg.from}`);
        console.log(`Body: ${msg.body}`);
        console.log(`Type: ${msg.type}`);
        console.log(`Timestamp: ${msg.timestamp}`);

        // Get user ID (phone number)
        const userId = msg.from.split('@')[0];
        
        // Handle voice messages
        let messageContent = msg.body;
        let messageType = msg.type;
        let voiceTranscript = null;
        let voiceUrl = null;
        
        if (msg.type === 'ptt') { // Voice message
            console.log('🎤 Voice message detected!');
            
            if (!voiceTranscription.isConfigured()) {
                console.log('⚠️ Gemini API key not configured. Voice transcription disabled.');
                await msg.reply('I received your voice message, but I need to set up voice transcription to understand it. Please send a text message for now.');
                return;
            }
            
            try {
                // Get voice message media
                const media = await msg.downloadMedia();
                if (media) {
                    console.log('📁 Voice file downloaded, size:', media.data.length, 'bytes');
                    
                    // Transcribe the voice message
                    const transcriptionResult = await voiceTranscription.transcribeVoiceMessage(
                        Buffer.from(media.data, 'base64'),
                        `voice_${msg.timestamp}.ogg`
                    );
                    
                    if (transcriptionResult.success) {
                        voiceTranscript = transcriptionResult.transcript;
                        messageContent = voiceTranscript;
                        messageType = 'voice_note';
                        console.log('✅ Voice transcribed:', voiceTranscript);
                        
                        // Store voice URL if available
                        voiceUrl = media.filename || `voice_${msg.timestamp}.ogg`;
                    } else {
                        console.error('❌ Voice transcription failed:', transcriptionResult.error);
                        await msg.reply('I had trouble understanding your voice message. Could you please try sending it again or type your message instead?');
                        return;
                    }
                } else {
                    console.error('❌ Failed to download voice media');
                    await msg.reply('I couldn\'t download your voice message. Please try sending it again.');
                    return;
                }
            } catch (error) {
                console.error('❌ Error processing voice message:', error);
                await msg.reply('I had trouble processing your voice message. Please try typing your message instead.');
                return;
            }
        }
        
        // Try to identify grandparent by name first, then by phone number
        let grandparent = null;
        
        // Check if this message contains a known grandparent name
        const identifiedGrandparent = extractGrandparentFromMessage(messageContent);
        if (identifiedGrandparent) {
            console.log('👴 Identified grandparent by name:', identifiedGrandparent.name);
            // Try to find existing profile by WhatsApp number
            const existingProfile = await supabase.getGrandparentByWhatsApp(identifiedGrandparent.whatsapp_number);
            if (existingProfile.data) {
                grandparent = existingProfile;
                console.log('✅ Found existing profile for:', grandparent.data.name);
            }
        }
        
        // If not found by name, try by phone number
        if (!grandparent) {
            grandparent = await supabase.getGrandparentByWhatsApp(userId);
        }
        
        if (!grandparent.data) {
            console.log('👴 Creating new grandparent profile for:', userId);
            const { data: newGrandparent, error } = await supabase.createGrandparent(
                userId, 
                `Grandparent ${userId}`, // Default name, will be updated when name is collected
                { 
                    first_message: msg.timestamp,
                    whatsapp_id: msg.from,
                    created_via: 'whatsapp_bot',
                    name_collection_status: 'pending'
                }
            );
            if (error) {
                console.error('❌ Error creating grandparent profile:', error);
                return;
            }
            grandparent = { data: newGrandparent };
            console.log('✅ Created grandparent profile:', grandparent.data.id);
        } else {
            console.log('👴 Found existing grandparent:', grandparent.data.name);
        }

        // Save conversation to database
        console.log('💬 Saving conversation to database...');
        const conversationData = {
            id: msg.id._serialized,
            type: messageType,
            content: messageContent,
            timestamp: new Date(msg.timestamp * 1000).toISOString(),
            rawData: {
                from: msg.from,
                to: msg.to,
                hasMedia: msg.hasMedia,
                originalType: msg.type,
                voiceTranscript: voiceTranscript,
                voiceUrl: voiceUrl,
                mediaUrl: msg.hasMedia && msg.type !== 'ptt' ? await msg.downloadMedia() : null
            }
        };

        const { data: savedConversation, error: conversationError } = await supabase.saveConversation(
            grandparent.data.id, 
            conversationData
        );
        
        if (conversationError) {
            console.error('❌ Error saving conversation:', conversationError);
        } else {
            console.log('✅ Conversation saved:', savedConversation.id);
        }

        // Process message with AI
        const intentResponse = await getIntent(messageContent, userId);
        console.log('AI Response:', intentResponse);
        
        // Parse the JSON response and handle accordingly
        const intent = JSON.parse(intentResponse);
        
        // Handle name collection completion
        if (intent.intent === 'name_collection_complete' && intent.collected_name) {
            console.log('📝 Updating grandparent name to:', intent.collected_name);
            
            // Update the grandparent profile with the collected name
            const { error: updateError } = await supabase.client
                .from('grandparent_profiles')
                .update({ 
                    name: intent.collected_name,
                    metadata: {
                        ...grandparent.data.metadata,
                        name_collection_status: 'completed',
                        collected_name: intent.collected_name,
                        name_collected_at: new Date().toISOString()
                    }
                })
                .eq('id', grandparent.data.id);
            
            if (updateError) {
                console.error('❌ Error updating grandparent name:', updateError);
            } else {
                console.log('✅ Updated grandparent name to:', intent.collected_name);
                // Update local grandparent object
                grandparent.data.name = intent.collected_name;
            }
        }
        
        // Handle onboarding completion
        if (intent.intent === 'onboarding_complete' && intent.onboarding_data) {
            console.log('🎉 Onboarding completed for:', intent.onboarding_data.name);
            console.log('📊 Onboarding data:', intent.onboarding_data);
            
            // Update local grandparent object with onboarding data
            if (grandparent.data) {
                grandparent.data.name = intent.onboarding_data.name;
                grandparent.data.location = intent.onboarding_data.location;
                grandparent.data.birth_year = intent.onboarding_data.birth_year;
                grandparent.data.preferred_language = intent.onboarding_data.preferred_language;
            }
        }
        
        // Handle onboarding steps
        if (intent.intent === 'onboarding_step' || intent.intent === 'onboarding_start') {
            console.log('📝 Onboarding step:', intent.onboarding_step);
            console.log('📊 Current data:', intent.onboarding_data || {});
        }
        
        if (intent.message) {
            // Add voice message acknowledgment if this was a voice message
            let responseMessage = intent.message;
            if (voiceTranscript) {
                // Check if transcription seems too short or unclear
                if (voiceTranscript.length < 3) {
                    responseMessage = `🎤 *Voice Message Received*\n\n⚠️ *Transcription unclear* - I heard: _"${voiceTranscript}"_\n\nCould you please try speaking a bit more clearly or send a text message instead?\n\n${intent.message}`;
                } else {
                    responseMessage = `🎤 *Voice Message Successfully Transcribed*\n\n📝 *What I heard:*\n_"${voiceTranscript}"_\n\n✅ *Stored in your memory collection*\n\n${intent.message}`;
                }
            }
            
            console.log('Would send message:\n', responseMessage);
            
            await msg.reply(responseMessage);
            
            // Handle story completion and memory creation
            if (intent.story_status === 'complete') {
                console.log('📖 Story completed! Creating memory from multi-message story...');
                
                const completedStory = getCompletedStoryContent(userId);
                if (completedStory) {
                    // Combine all story messages into one coherent memory
                    const storyContent = completedStory.messages.join(' ');
                    const title = completedStory.theme || 
                        (storyContent.length > 50 ? storyContent.substring(0, 47) + '...' : storyContent);
                    
                    const { data: memory, error: memoryError } = await supabase.createMemory(
                        grandparent.data.id,
                        title,
                        storyContent,
                        'story',
                        [savedConversation ? savedConversation.id : msg.id._serialized]
                    );
                    
                    if (memoryError) {
                        console.error('❌ Error creating story memory:', memoryError);
                    } else {
                        console.log('✅ Multi-message story memory created:', memory.id);
                        console.log('📖 Story title:', memory.title);
                        console.log('📝 Story messages:', completedStory.messageCount);
                        console.log('📚 Story theme:', completedStory.theme);
                    }
                }
            } else if (intent.memory_type && (intent.intent === 'memory_capture' || intent.intent === 'story_start') && intent.story_status !== 'continuing') {
                // Create memory for single-message stories
                console.log('💾 Creating memory for single message story...');
                
                const title = msg.body.length > 50 
                    ? msg.body.substring(0, 47) + '...' 
                    : msg.body;
                
                const { data: memory, error: memoryError } = await supabase.createMemory(
                    grandparent.data.id,
                    title,
                    msg.body,
                    intent.memory_type,
                    [savedConversation ? savedConversation.id : msg.id._serialized]
                );
                
                if (memoryError) {
                    console.error('❌ Error creating memory:', memoryError);
                } else {
                    console.log('✅ Memory created:', memory.id);
                    console.log('📖 Memory title:', memory.title);
                    console.log('📝 Memory type:', memory.memory_type);
                }
            }
            
            // Handle video generation command
            if (msg.body.toLowerCase().includes('create video') || msg.body.toLowerCase().includes('make video')) {
                console.log('🎬 Video generation command received');
                
                // Check if video generation is configured
                if (!videoGeneration.isConfigured()) {
                    await msg.reply('🎬 Video generation is not currently available. Please try again later.');
                    return;
                }
                
                // Get recent memories for this grandparent
                const { data: memories, error: memoriesError } = await supabase.client
                    .from('memories')
                    .select('id, title, content, memory_type')
                    .eq('grandparent_id', grandparent.data.id)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(5); // Limit to 5 most recent memories
                
                if (memoriesError || !memories || memories.length === 0) {
                    await msg.reply('📚 I couldn\'t find any memories to create a video from. Please share some stories first!');
                    return;
                }
                
                await msg.reply('🎬 Creating your memory video! This may take a few minutes...');
                
                try {
                    // Generate video
                    const result = await videoGeneration.generateMemoryVideo(
                        grandparent.data.id,
                        memories.map(m => m.id),
                        {
                            duration: '2-3 minutes',
                            voice: 'en-US-Neural2-F',
                            language: 'en-US'
                        }
                    );
                    
                    if (result.success) {
                        await msg.reply(`🎉 Your memory video is ready!\n\n📹 *Video Details:*\n• Duration: ${Math.round(result.duration / 60)} minutes\n• Memories included: ${result.memoriesIncluded}\n• Slides: ${result.slidesCount}\n\n🔗 Watch your video: ${result.videoUrl}`);
                        
                        // Save video metadata to database
                        await supabase.client
                            .from('memory_videos')
                            .insert({
                                grandparent_id: grandparent.data.id,
                                video_url: result.videoUrl,
                                duration: result.duration,
                                slides_count: result.slidesCount,
                                memories_included: result.memoriesIncluded,
                                status: 'completed',
                                created_at: new Date().toISOString()
                            });
                    } else {
                        await msg.reply('❌ Sorry, there was an error creating your video. Please try again later.');
                    }
                } catch (error) {
                    console.error('❌ Video generation error:', error);
                    await msg.reply('❌ Sorry, there was an error creating your video. Please try again later.');
                }
                
                return;
            }
            
            // Log story session status
            const activeSession = getActiveStorySession(userId);
            if (activeSession && activeSession.isActive) {
                console.log(`📖 Active story: "${activeSession.theme}" (${activeSession.messageCount} messages)`);
            }
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

client.initialize();