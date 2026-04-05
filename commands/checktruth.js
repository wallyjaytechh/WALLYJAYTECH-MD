/**
 * WALLYJAYTECH-MD - Check Truth Command
 * Reply to a message with .checktruth - Bot replies TRUE or FALSE
 */

async function checktruthCommand(sock, chatId, message) {
    try {
        // Check if replying to a message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            await sock.sendMessage(chatId, {
                text: `❌ *Reply to a message with .checktruth*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Example:*\n1. User says: "I am a doctor"\n2. Reply to that message with .checktruth\n3. Bot replies: ✅ TRUE or ❌ FALSE`
            }, { quoted: message });
            return;
        }

        // Get the quoted message text
        let statement = '';
        
        if (quotedMessage.conversation) {
            statement = quotedMessage.conversation;
        } else if (quotedMessage.extendedTextMessage?.text) {
            statement = quotedMessage.extendedTextMessage.text;
        } else {
            statement = "";
        }
        
        if (!statement) {
            await sock.sendMessage(chatId, { text: `❌ Cannot analyze this message` }, { quoted: message });
            return;
        }
        
        // Analyze and get result
        const result = analyzeTruth(statement);
        
        // Send simple reply
        await sock.sendMessage(chatId, { text: result }, { quoted: message });
        
    } catch (error) {
        console.error('Error in checktruth:', error);
        await sock.sendMessage(chatId, { text: '❌ Error' }, { quoted: message });
    }
}

// Simple truth analysis
function analyzeTruth(statement) {
    const text = statement.toLowerCase();
    
    // Definitely TRUE statements
    const truePatterns = [
        /sky is blue/, /water is wet/, /earth is round/, /sun rises in east/,
        /grass is green/, /fire is hot/, /ice is cold/, /birds can fly/,
        /fish live in water/, /humans need oxygen/, /2 \+ 2 = 4/, /i love you/,
        /i am happy/, /i am fine/, /yes/, /true/, /correct/, /i am telling truth/,
        /you are beautiful/, /you are great/, /bot is smart/, /i like you/
    ];
    
    // Definitely FALSE statements
    const falsePatterns = [
        /sky is green/, /water is dry/, /earth is flat/, /sun rises in west/,
        /grass is purple/, /fire is cold/, /ice is hot/, /birds can't fly/,
        /fish live on land/, /humans don't need oxygen/, /2 \+ 2 = 5/,
        /i hate you/, /i am sad/, /no/, /false/, /wrong/, /i am lying/,
        /i am a millionaire/, /i am batman/, /i am superman/
    ];
    
    // Check patterns first
    for (const pattern of truePatterns) {
        if (pattern.test(text)) return "✅ TRUE";
    }
    
    for (const pattern of falsePatterns) {
        if (pattern.test(text)) return "❌ FALSE";
    }
    
    // Check if it's a question
    if (text.includes('?') || text.match(/^(what|why|how|who|where|when)/)) {
        return "❓ QUESTION";
    }
    
    // Random for unknown statements (60% true, 40% false - makes game fun)
    const random = Math.random();
    if (random > 0.4) {
        return "✅ TRUE";
    } else {
        return "❌ FALSE";
    }
}

module.exports = checktruthCommand;
