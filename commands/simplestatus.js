const fs = require('fs');
const path = require('path');

// File to store preferences
const PREFS_FILE = './data/save_prefs.json';

// Auto-create data directory
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data', { recursive: true });
}

// Load preferences
function loadPrefs() {
    try {
        if (fs.existsSync(PREFS_FILE)) {
            const data = fs.readFileSync(PREFS_FILE, 'utf8');
            return JSON.parse(data);
        } else {
            fs.writeFileSync(PREFS_FILE, JSON.stringify({}), 'utf8');
            return {};
        }
    } catch (error) {
        return {};
    }
}

// Save preferences
function savePrefs(prefs) {
    try {
        fs.writeFileSync(PREFS_FILE, JSON.stringify(prefs, null, 2), 'utf8');
        return true;
    } catch (error) {
        return false;
    }
}

// Main command - SIMPLIFIED
async function saveStatusCommand(sock, chatId, message, args) {
    try {
        const userId = message.key.participant || message.key.remoteJid;
        const option = args[0]?.toLowerCase();
        const prefs = loadPrefs();
        
        console.log('DEBUG: Chat ID:', chatId); // Check if status@broadcast
        console.log('DEBUG: Message type:', Object.keys(message.message || {})[0]);
        
        // SET PREFERENCE
        if (option === 'public' || option === 'private') {
            prefs[userId] = option;
            savePrefs(prefs);
            
            await sock.sendMessage(chatId, { 
                text: `✅ Mode: ${option.toUpperCase()}\n\nNow reply to any status with .save` 
            }, { quoted: message });
            return;
        }
        
        // GET USER PREFERENCE
        const userPref = prefs[userId];
        if (!userPref) {
            await sock.sendMessage(chatId, { 
                text: `⚙️ Choose:\n.save public (to owner)\n.save private (to your DM)` 
            }, { quoted: message });
            return;
        }
        
        // 🚨 **KEY FIX HERE** - Handle status broadcast differently
        if (chatId === 'status@broadcast') {
            // WE ARE IN STATUS TAB - Forward immediately
            const userJid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
            
            if (userPref === 'private') {
                // Send to user's DM
                await sock.sendMessage(userJid, { forward: message });
                await sock.sendMessage(chatId, { text: '✅ Saved to your DM' });
            } else {
                // Send to bot owner (public mode)
                const settings = require('../settings');
                const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
                await sock.sendMessage(ownerJid, { forward: message });
                await sock.sendMessage(chatId, { text: '✅ Sent to owner' });
            }
            return;
        }
        
        // If we reach here, we're NOT in status tab
        // Check if replying to a status in chat
        const isQuotingStatus = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (isQuotingStatus) {
            // User is replying to a forwarded status in chat
            const userJid = userId.includes('@') ? userId : `${userId}@s.whatsapp.net`;
            
            if (userPref === 'private') {
                await sock.sendMessage(userJid, { 
                    text: '📌 Status saved from chat\n(Go to Status tab for better saving)' 
                });
                await sock.sendMessage(chatId, { 
                    text: '✅ Saved from chat' 
                }, { quoted: message });
            } else {
                const settings = require('../settings');
                const ownerJid = `${settings.ownerNumber}@s.whatsapp.net`;
                await sock.sendMessage(ownerJid, { 
                    text: '📤 Status from chat' 
                });
                await sock.sendMessage(chatId, { 
                    text: '✅ Sent from chat' 
                }, { quoted: message });
            }
            return;
        }
        
        // If none of the above, show help
        await sock.sendMessage(chatId, { 
            text: `📌 TWO WAYS TO SAVE:\n\n1. STATUS TAB:\n   • Open WhatsApp Status\n   • Reply to any status with .save\n\n2. IN CHAT:\n   • Reply to a forwarded status with .save` 
        }, { quoted: message });
        
    } catch (error) {
        console.error('Save error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error' 
        }, { quoted: message });
    }
}

module.exports = { saveStatusCommand };
