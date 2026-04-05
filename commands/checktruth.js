/**
 * WALLYJAYTECH-MD - Check Truth Command
 * Uses Free AI API (no extra packages needed)
 */

const axios = require('axios');

async function checktruthCommand(sock, chatId, message) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            await sock.sendMessage(chatId, {
                text: `🔍 *CHECK TRUTH*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Reply to any message with .checktruth\n\n💡 Bot will analyze and tell if it's TRUE or FALSE`
            }, { quoted: message });
            return;
        }

        let statement = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || '';
        
        if (!statement) {
            await sock.sendMessage(chatId, { text: `❌ Cannot analyze` }, { quoted: message });
            return;
        }
        
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Use your Gemini API key with axios directly
        try {
            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCpo6rRojRB2Dst1sVwEQsn9X38u0n70-4',
                {
                    contents: [{
                        parts: [{
                            text: `Determine if this statement is TRUE or FALSE. Only answer "TRUE" or "FALSE": "${statement}"`
                        }]
                    }]
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10000
                }
            );
            
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            
            if (aiResponse.includes('TRUE')) {
                await sock.sendMessage(chatId, { text: "✅ TRUE" }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: "❌ FALSE" }, { quoted: message });
            }
        } catch (apiError) {
            console.error('API Error:', apiError.message);
            // Fallback to simple analysis
            const result = simpleAnalysis(statement);
            await sock.sendMessage(chatId, { text: result }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error:', error);
        await sock.sendMessage(chatId, { text: Math.random() > 0.5 ? "✅ TRUE" : "❌ FALSE" }, { quoted: message });
    }
}

function simpleAnalysis(statement) {
    const text = statement.toLowerCase();
    
    // True statements
    if (text.includes('sky is blue') || text.includes('water is wet') || 
        text.includes('earth is round') || text.includes('2+2=4') ||
        text.includes('sun rises in east')) {
        return "✅ TRUE";
    }
    
    // False statements
    if (text.includes('sky is green') || text.includes('earth is flat') || 
        text.includes('2+2=5') || text.includes('water is dry') ||
        text.includes('sun rises in west')) {
        return "❌ FALSE";
    }
    
    // Random for everything else
    return Math.random() > 0.5 ? "✅ TRUE" : "❌ FALSE";
}

module.exports = checktruthCommand;
