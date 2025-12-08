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
        const isStatus = chatId === 'status@broadcast';
        
        if (!isStatus) {
            await sock.sendMessage(chatId, { 
                text: '❌ This only works on statuses.\nGo to Status tab → Reply to a status with `.save`' 
            }, { quoted: message });
            return;
        }
        
        // Get status owner (person who posted the status)
        const statusOwner = chatId; // status@broadcast
        // Actually, we need to get who posted this specific status
        // For now, we'll use the message sender
        const statusAuthor = message.key.participant || 'unknown';
        
        const option = args[0]?.toLowerCase();
        const prefs = loadPrefs();
        
        // Set preference
        if (option === 'public' || option === 'private') {
            prefs[userId] = option;
            savePrefs(prefs);
            
            await sock.sendMessage(chatId, { 
                text: `✅ Set to: *${option}*\n\nNow use \`.save\` on any status` 
            });
            return;
        }
        
        // Check if preference is set
        const userPref = prefs[userId];
        if (!userPref) {
            await sock.sendMessage(chatId, { 
                text: `⚙️ *Choose save mode:*\n\n` +
                      `• \`.save public\` - Send status to owner's DM\n` +
                      `• \`.save private\` - Send to your DM\n\n` +
                      `Set once, then use \`.save\` on any status` 
            });
            return;
        }
        
        // Forward the status
        if (userPref === 'public') {
            // Send to status owner's DM
            // Extract actual user from status (this is tricky)
            // For now, we'll send to the participant
            if (statusAuthor && statusAuthor !== 'unknown') {
                await sock.sendMessage(statusAuthor, {
                    forward: message,
                    mentions: [statusAuthor]
                });
                await sock.sendMessage(chatId, { 
                    text: '✅ Status sent to owner\'s DM' 
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: '❌ Could not identify status owner' 
                });
            }
        } else { // private
            // Send to user's own DM
            const userJid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
            await sock.sendMessage(userJid, {
                forward: message
            });
            await sock.sendMessage(chatId, { 
                text: '✅ Status saved to your DM' 
            });
        }
        
    } catch (error) {
        console.error('Save error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error' 
        });
    }
}

module.exports = { saveStatusCommand };
