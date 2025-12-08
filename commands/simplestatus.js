const fs = require('fs');
const path = require('path');

// File to store preferences
const PREFS_FILE = './data/save_prefs.json';

// ✅ AUTO-CREATE DATA DIRECTORY
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
}

// Load preferences - AUTO-CREATE FILE IF MISSING
function loadPrefs() {
    try {
        if (fs.existsSync(PREFS_FILE)) {
            const data = fs.readFileSync(PREFS_FILE, 'utf8');
            return JSON.parse(data);
        } else {
            // ✅ CREATE EMPTY FILE IF NOT EXISTS
            fs.writeFileSync(PREFS_FILE, JSON.stringify({}), 'utf8');
            return {};
        }
    } catch (error) {
        console.error('Error loading prefs:', error);
        // ✅ RETURN EMPTY OBJECT ON ERROR
        return {};
    }
}

// Save preferences
function savePrefs(prefs) {
    try {
        fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving prefs:', error);
        return false;
    }
}

// Main command
async function saveStatusCommand(sock, chatId, message, args) {
    try {
        const userId = message.key.participant || message.key.remoteJid;
        const userJid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
        
        // Get the option
        const option = args[0]?.toLowerCase();
        
        // ✅ ALWAYS LOAD FRESH PREFERENCES
        const prefs = loadPrefs();
        
        // Set preference mode
        if (option === 'public' || option === 'private') {
            prefs[userId] = option;
            const saved = savePrefs(prefs);
            
            if (!saved) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Failed to save preference' 
                }, { quoted: message });
                return;
            }
            
            await sock.sendMessage(chatId, { 
                text: `✅ *Save mode set to: ${option.toUpperCase()}*\n\nNow reply to any status with just \`.save\`` 
            }, { quoted: message });
            return;
        }
        
        // Check if user has set preference
        const userPref = prefs[userId];
        
        if (!userPref) {
            await sock.sendMessage(chatId, { 
                text: `⚙️ *CHOOSE SAVE MODE FIRST*\n\nReply with:\n\`.save public\` - Send to status owner\n\`.save private\` - Send to your DM\n\nThen use \`.save\` on any status` 
            }, { quoted: message });
            return;
        }
        
        // Check if we're in status broadcast
        const isStatusBroadcast = chatId === 'status@broadcast';
        
        if (!isStatusBroadcast) {
            await sock.sendMessage(chatId, { 
                text: `📌 *Go to Status tab*\n\n1. Open WhatsApp Status\n2. Reply to any status with:\n\`.save\`` 
            }, { quoted: message });
            return;
        }
        
        // WE ARE IN STATUS - Forward it
        if (userPref === 'private') {
            // Send to user's own DM
            await sock.sendMessage(userJid, {
                forward: message
            });
            
            await sock.sendMessage(chatId, { 
                text: '✅ *Saved to your DM*' 
            });
        } else { // public
            // For public mode, send to bot owner
            const settings = require('../settings');
            const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
            
            await sock.sendMessage(ownerJid, {
                forward: message,
                text: `📤 Status from ${userId.split('@')[0]}`
            });
            
            await sock.sendMessage(chatId, { 
                text: '✅ *Sent to status owner*' 
            });
        }
        
    } catch (error) {
        console.error('Save error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error saving' 
        }, { quoted: message });
    }
}

module.exports = { saveStatusCommand };
