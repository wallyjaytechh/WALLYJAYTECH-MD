const fs = require('fs');
const path = require('path');

// Storage files
const SAVE_PREF_FILE = './data/save_preferences.json';
const SAVED_STATUS_FILE = './data/saved_statuses.json';

// Ensure data directory
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
}

// Load preferences
function loadPreferences() {
    try {
        if (fs.existsSync(SAVE_PREF_FILE)) {
            return JSON.parse(fs.readFileSync(SAVE_PREF_FILE, 'utf8'));
        }
    } catch (error) {}
    return {};
}

// Save preferences
function savePreferences(prefs) {
    try {
        fs.writeFileSync(SAVE_PREF_FILE, JSON.stringify(prefs, null, 2), 'utf8');
    } catch (error) {}
}

// Load saved statuses
function loadSavedStatuses() {
    try {
        if (fs.existsSync(SAVED_STATUS_FILE)) {
            return JSON.parse(fs.readFileSync(SAVED_STATUS_FILE, 'utf8'));
        }
    } catch (error) {}
    return {};
}

// Save statuses
function saveStatuses(data) {
    try {
        fs.writeFileSync(SAVED_STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {}
}

// Get user ID
function getUserId(message) {
    return message.key.participant || message.key.remoteJid;
}

// Main save command
async function simpleSaveCommand(sock, chatId, message, args) {
    try {
        const userId = getUserId(message);
        const isStatus = chatId === 'status@broadcast';
        
        // Get user preference
        const prefs = loadPreferences();
        const userPref = prefs[userId] || 'ask'; // 'public' or 'private' or 'ask'
        
        const option = args[0]?.toLowerCase();
        
        // Set preference
        if (option === 'public' || option === 'private') {
            prefs[userId] = option;
            savePreferences(prefs);
            
            await sock.sendMessage(chatId, { 
                text: `✅ Save preference set to: *${option}*\n\nNow use \`.save\` on any status to save it.` 
            }, { quoted: message });
            return;
        }
        
        // If no preference set yet
        if (userPref === 'ask') {
            await sock.sendMessage(chatId, { 
                text: `💾 *SAVE SETTINGS*\n\nChoose where to save statuses:\n\n` +
                      `• \`.save public\` - Save to your DM\n` +
                      `• \`.save private\` - Save to bot storage\n\n` +
                      `*Once set, just use \`.save\` on any status!*` 
            }, { quoted: message });
            return;
        }
        
        // Actually save a status
        if (!isStatus) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command only works on status updates.\n\nGo to Status tab and reply to a status with `.save`' 
            }, { quoted: message });
            return;
        }
        
        // Save the status
        const statuses = loadSavedStatuses();
        if (!statuses[userId]) {
            statuses[userId] = [];
        }
        
        const statusId = Date.now();
        const statusData = {
            id: statusId,
            timestamp: new Date().toISOString(),
            savedTo: userPref,
            statusJid: chatId,
            messageId: message.key.id
        };
        
        // Add text if available
        if (message.message?.conversation) {
            statusData.text = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            statusData.text = message.message.extendedTextMessage.text;
        }
        
        statuses[userId].push(statusData);
        
        // Keep only last 100
        if (statuses[userId].length > 100) {
            statuses[userId] = statuses[userId].slice(-100);
        }
        
        saveStatuses(statuses);
        
        // Send confirmation based on preference
        if (userPref === 'public') {
            // Send to user's DM
            const userJid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
            await sock.sendMessage(userJid, { 
                text: `✅ Status saved to your DM!\n\n🆔 ${statusId}\n📅 ${new Date().toLocaleString()}` 
            });
            
            await sock.sendMessage(chatId, { 
                text: '✅ Status saved to your DM!' 
            });
        } else {
            // Private save - just confirm in status
            await sock.sendMessage(chatId, { 
                text: '💾 Status saved privately to bot storage.' 
            });
        }
        
    } catch (error) {
        console.error('Save error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error saving status.' 
        }, { quoted: message });
    }
}

// View saved statuses
async function viewSavesCommand(sock, chatId, message) {
    try {
        const userId = getUserId(message);
        const statuses = loadSavedStatuses();
        const userStatuses = statuses[userId] || [];
        
        if (userStatuses.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '📭 No saved statuses found.\n\nSet save preference first:\n`.save public` or `.save private`' 
            }, { quoted: message });
            return;
        }
        
        let response = `📚 *YOUR SAVED STATUSES*\n\n`;
        response += `Total: ${userStatuses.length}\n\n`;
        
        // Show last 10
        const recent = userStatuses.slice(-10).reverse();
        
        recent.forEach((status, index) => {
            const date = new Date(status.timestamp).toLocaleDateString();
            response += `${index + 1}. 🆔 ${status.id}\n`;
            response += `   📅 ${date}\n`;
            response += `   📍 ${status.savedTo}\n`;
            if (status.text) {
                const preview = status.text.length > 30 ? status.text.substring(0, 30) + '...' : status.text;
                response += `   📝 "${preview}"\n`;
            }
            response += `   ──────────────\n`;
        });
        
        response += `\n*View:* \`.viewsave [id]\``;
        
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
        
    } catch (error) {
        console.error('View error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error loading saves.' }, { quoted: message });
    }
}

// Export
module.exports = {
    simpleSaveCommand,
    viewSavesCommand
};
