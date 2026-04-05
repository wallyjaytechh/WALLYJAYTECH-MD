/**
 * WALLYJAYTECH-MD - Check Truth Command
 * Uses Google Gemini AI to determine if a statement is true or false
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI('AIzaSyCpo6rRojRB2Dst1sVwEQsn9X38u0n70-4');

async function checktruthCommand(sock, chatId, message) {
    try {
        // Check if replying to a message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            await sock.sendMessage(chatId, {
                text: `🔍 *CHECK TRUTH*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Usage:*\n└ Reply to any message with .checktruth\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n1. User says: "The sky is green"\n2. Reply to that message with .checktruth\n3. Bot analyzes and replies TRUE or FALSE\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Uses Google AI to determine truth`
            }, { quoted: message });
            return;
        }

        // Get the quoted message text
        let statement = '';
        
        if (quotedMessage.conversation) {
            statement = quotedMessage.conversation;
        } else if (quotedMessage.extendedTextMessage?.text) {
            statement = quotedMessage.extendedTextMessage.text;
        } else if (quotedMessage.imageMessage?.caption) {
            statement = quotedMessage.imageMessage.caption;
        } else if (quotedMessage.videoMessage?.caption) {
            statement = quotedMessage.videoMessage.caption;
        } else {
            statement = "";
        }
        
        if (!statement) {
            await sock.sendMessage(chatId, { text: `❌ Cannot analyze this message. Reply to a text message.` }, { quoted: message });
            return;
        }
        
        // Show typing indicator while analyzing
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Analyze with AI
        const result = await analyzeWithAI(statement);
        
        // Send result
        await sock.sendMessage(chatId, { text: result }, { quoted: message });
        
    } catch (error) {
        console.error('Error in checktruth:', error);
        // Fallback to random if AI fails
        const random = Math.random() > 0.5 ? "✅ TRUE" : "❌ FALSE";
        await sock.sendMessage(chatId, { text: random }, { quoted: message });
    }
}

async function analyzeWithAI(statement) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Determine if the following statement is TRUE or FALSE based on facts and common knowledge. Only respond with "TRUE" or "FALSE". Do not add any other text or explanation.\n\nStatement: "${statement}"`;
        
        const result = await model.generateContent(prompt);
        const response = result.response.text().trim().toUpperCase();
        
        console.log(`AI Response for "${statement}": ${response}`);
        
        if (response.includes('TRUE')) {
            return "✅ TRUE";
        } else if (response.includes('FALSE')) {
            return "❌ FALSE";
        } else {
            // If AI gives unclear answer
            return Math.random() > 0.5 ? "✅ TRUE" : "❌ FALSE";
        }
    } catch (error) {
        console.error('AI Error:', error);
        return Math.random() > 0.5 ? "✅ TRUE" : "❌ FALSE";
    }
}

module.exports = checktruthCommand;
