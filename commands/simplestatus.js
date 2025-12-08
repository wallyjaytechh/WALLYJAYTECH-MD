const fs = require('fs');
const path = require('path');

// File to store preferences
const PREFS_FILE = './data/save_prefs.json';

// Load preferences
function loadPrefs() {
    try {
        if (fs.existsSync(PREFS_FILE)) {
            return JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8'));
        }
    } catch (error) {}
    return {};
}

// Save preferences
function savePrefs(prefs) {
    try {
        fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2), 'utf8');
    } catch (error) {}
}

// Main command
async function saveStatusCommand(sock, chatId, message, args) {
    try {
        const userId = message.key.participant || message.key.remoteJid;
        
        // Get the option
        const option = args[0]?.toLowerCase();
        const prefs = loadPrefs();
        
        // Set preference
        if (option === 'public' || option === 'private') {
            prefs[userId] = option;
            savePrefs(prefs);
            
            await sock.sendMessage(chatId, { 
                text: `✅ Save mode set to: *${option}*\n\nNow reply to any status with \`.save\`` 
            }, { quoted: message });
            return;
        }
        
        // Check if user has set preference
        const userPref = prefs[userId];
        if (!userPref) {
            await sock.sendMessage(chatId, { 
                text: `⚙️ *Choose save mode first:*\n\n` +
                      `• \`.save public\` - Send status to status owner\n` +
                      `• \`.save private\` - Send status to your DM\n\n` +
                      `*Then reply to any status with \`.save\`` 
            }, { quoted: message });
            return;
        }
        
        // Check if we're in a status or replying to one
        const isStatusBroadcast = chatId === 'status@broadcast';
        const hasQuotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!isStatusBroadcast && !hasQuotedMessage) {
            await sock.sendMessage(chatId, { 
                text: `📌 *How to save statuses:*\n\n1. Set mode: \`.save public\` or \`.save private\`\n2. Go to Status tab\n3. Reply to any status with \`.save\`` 
            }, { quoted: message });
            return;
        }
        
        // Forward the message
        if (userPref === 'private') {
            // Send to user's own DM
            const userJid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
            await sock.sendMessage(userJid, {
                forward: message
            });
            
            if (isStatusBroadcast) {
                await sock.sendMessage(chatId, { 
                    text: '✅ Saved to your DM' 
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '✅ Saved to your DM' 
                }, { quoted: message });
            }
        } else { // public
            // Try to get status owner
            // If it's a status broadcast, we can't easily get owner
            // If replying in DM/chat, we can forward to quoted sender
            if (hasQuotedMessage) {
                const quotedJid = message.message.extendedTextMessage.contextInfo.participant;
                if (quotedJid) {
                    await sock.sendMessage(quotedJid, {
                        forward: message
                    });
                    await sock.sendMessage(chatId, { 
                        text: '✅ Sent to status owner' 
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { 
                        text: '❌ Could not identify status owner' 
                    }, { quoted: message });
                }
            } else {
                // In status broadcast, can't determine owner
                await sock.sendMessage(chatId, { 
                    text: '⚠️ Use \`.save private\` for status tab\nOr reply to status in chat for \`.save public\`' 
                });
            }
        }
        
    } catch (error) {
        console.error('Save error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error saving' 
        }, { quoted: message });
    }
}

module.exports = { saveStatusCommand };
