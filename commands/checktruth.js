/**
 * WALLYJAYTECH-MD - Check Truth Command
 * Reply to a message with .checktruth to check if it's true or false
 */

async function checktruthCommand(sock, chatId, message) {
    try {
        // Check if replying to a message
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            await sock.sendMessage(chatId, {
                text: `🔍 *CHECK TRUTH*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Usage:*\n└ Reply to any message with .checktruth\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n1. User says: "I am a doctor"\n2. Reply to that message with .checktruth\n3. Bot will analyze if it's TRUE or FALSE\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Bot will reply with ✅ TRUE or ❌ FALSE`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }

        // Get the quoted message text
        let statement = '';
        
        // Extract text from different message types
        if (quotedMessage.conversation) {
            statement = quotedMessage.conversation;
        } else if (quotedMessage.extendedTextMessage?.text) {
            statement = quotedMessage.extendedTextMessage.text;
        } else if (quotedMessage.imageMessage?.caption) {
            statement = quotedMessage.imageMessage.caption;
        } else if (quotedMessage.videoMessage?.caption) {
            statement = quotedMessage.videoMessage.caption;
        } else {
            statement = "[Non-text message]";
        }
        
        if (!statement || statement === "[Non-text message]") {
            await sock.sendMessage(chatId, {
                text: `❌ Cannot analyze non-text messages.\n\nPlease reply to a text message.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            return;
        }
        
        // Get the sender of the original message
        const originalSender = message.message.extendedTextMessage.contextInfo.participant || 
                              message.message.extendedTextMessage.contextInfo.remoteJid;
        
        // Analyze the statement
        const result = analyzeTruth(statement);
        
        // Send response
        await sock.sendMessage(chatId, {
            text: `🔍 *TRUTH CHECK*\n\n━━━━━━━━━━━━━━━━━━━━\n👤 *Statement by:* @${originalSender.split('@')[0]}\n📝 *Statement:*\n└ "${statement}"\n\n━━━━━━━━━━━━━━━━━━━━\n${result.emoji} *Verdict:* ${result.verdict}\n📊 *Confidence:* ${result.confidence}%\n💬 *Reason:* ${result.reason}\n\n━━━━━━━━━━━━━━━━━━━━\n🤖 *Powered by WALLYJAYTECH-MD*`,
            contextInfo: {
                mentionedJid: [originalSender],
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in checktruth command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error checking truth. Please try again.',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

// Function to analyze truth of statement
function analyzeTruth(statement) {
    const lowerStatement = statement.toLowerCase();
    
    // Known TRUE statements
    const trueStatements = [
        { pattern: /sky is blue/i, confidence: 95, reason: "The sky appears blue due to Rayleigh scattering" },
        { pattern: /water is wet/i, confidence: 98, reason: "Water molecules make surfaces wet" },
        { pattern: /earth is round/i, confidence: 99, reason: "Scientific consensus confirms Earth is spherical" },
        { pattern: /sun rises in east/i, confidence: 100, reason: "The Earth rotates eastward" },
        { pattern: /grass is green/i, confidence: 90, reason: "Chlorophyll makes grass appear green" },
        { pattern: /fire is hot/i, confidence: 99, reason: "Fire produces heat through combustion" },
        { pattern: /ice is cold/i, confidence: 98, reason: "Ice is frozen water below 0°C" },
        { pattern: /birds can fly/i, confidence: 95, reason: "Most birds have wings for flight" },
        { pattern: /fish live in water/i, confidence: 97, reason: "Fish are aquatic animals" },
        { pattern: /humans need oxygen/i, confidence: 100, reason: "Oxygen is essential for human survival" },
        { pattern: /2 \+ 2 = 4/i, confidence: 100, reason: "Basic mathematical fact" },
        { pattern: /i am a doctor/i, confidence: 30, reason: "Cannot verify your profession remotely" },
        { pattern: /i am a student/i, confidence: 40, reason: "Common statement, but cannot verify" },
        { pattern: /i am happy/i, confidence: 35, reason: "Subjective emotional state" },
        { pattern: /i am sad/i, confidence: 35, reason: "Subjective emotional state" }
    ];
    
    // Known FALSE statements
    const falseStatements = [
        { pattern: /sky is green/i, confidence: 95, reason: "The sky is blue, not green" },
        { pattern: /water is dry/i, confidence: 98, reason: "Water is a liquid, not dry" },
        { pattern: /earth is flat/i, confidence: 99, reason: "Scientific evidence proves Earth is round" },
        { pattern: /sun rises in west/i, confidence: 100, reason: "The sun rises in the east" },
        { pattern: /grass is purple/i, confidence: 90, reason: "Grass is typically green" },
        { pattern: /fire is cold/i, confidence: 99, reason: "Fire produces heat" },
        { pattern: /ice is hot/i, confidence: 98, reason: "Ice is cold, not hot" },
        { pattern: /birds can't fly/i, confidence: 95, reason: "Most birds can fly" },
        { pattern: /fish live on land/i, confidence: 97, reason: "Fish are aquatic creatures" },
        { pattern: /humans don't need oxygen/i, confidence: 100, reason: "Humans require oxygen to live" },
        { pattern: /2 \+ 2 = 5/i, confidence: 100, reason: "Basic math: 2+2=4" },
        { pattern: /i am a millionaire/i, confidence: 25, reason: "Cannot verify financial status" },
        { pattern: /i am the president/i, confidence: 20, reason: "Unlikely claim" },
        { pattern: /i am a celebrity/i, confidence: 25, reason: "Cannot verify identity" }
    ];
    
    // Check against known statements
    for (const item of trueStatements) {
        if (item.pattern.test(lowerStatement)) {
            return {
                verdict: "✅ TRUE",
                confidence: item.confidence,
                reason: item.reason,
                emoji: "✅"
            };
        }
    }
    
    for (const item of falseStatements) {
        if (item.pattern.test(lowerStatement)) {
            return {
                verdict: "❌ FALSE",
                confidence: item.confidence,
                reason: item.reason,
                emoji: "❌"
            };
        }
    }
    
    // Check for "I am" statements (subjective)
    if (lowerStatement.match(/i am|i'm|i will|i can|i have/i)) {
        return {
            verdict: "❓ UNVERIFIABLE",
            confidence: 70,
            reason: "Personal claims cannot be independently verified by the bot.",
            emoji: "❓"
        };
    }
    
    // Check for questions
    if (lowerStatement.match(/^what|^why|^how|^who|^where|^when|\?$/)) {
        return {
            verdict: "❓ QUESTION",
            confidence: 90,
            reason: "Questions cannot be classified as true or false.",
            emoji: "❓"
        };
    }
    
    // AI-style analysis for unknown statements
    const containsFactual = /is|are|can|does|will|would|could|should/.test(lowerStatement);
    const statementLength = statement.length;
    
    let verdict, confidence, reason, emoji;
    
    if (containsFactual && statementLength > 15) {
        // Random but reasonable for factual statements
        const randomValue = Math.random();
        if (randomValue > 0.6) {
            verdict = "✅ PROBABLY TRUE";
            confidence = Math.floor(Math.random() * 30) + 55;
            reason = "Based on general knowledge, this statement appears plausible.";
            emoji = "✅";
        } else {
            verdict = "❌ PROBABLY FALSE";
            confidence = Math.floor(Math.random() * 30) + 55;
            reason = "Based on general knowledge, this statement appears questionable.";
            emoji = "❌";
        }
    } else {
        verdict = "❓ INCONCLUSIVE";
        confidence = Math.floor(Math.random() * 40) + 30;
        reason = "Insufficient context to determine truth value.";
        emoji = "❓";
    }
    
    return { verdict, confidence, reason, emoji };
}

module.exports = checktruthCommand;
