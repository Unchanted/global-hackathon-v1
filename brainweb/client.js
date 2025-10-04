require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getIntent } = require('./intent.js');

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
        
        // Process message with conversation context
        const intentResponse = await getIntent(msg.body, userId);
        console.log('AI Response:', intentResponse);
        
        // Parse the JSON response and handle accordingly
        const intent = JSON.parse(intentResponse);
        
        if (intent.message) {
            console.log('Would send message:\n', intent.message);
            // await msg.reply(intent.message); // Commented out for dev purposes
            
            // Log memory type for future processing
            if (intent.memory_type) {
                console.log('Memory type:', intent.memory_type);
            }
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

client.initialize();
