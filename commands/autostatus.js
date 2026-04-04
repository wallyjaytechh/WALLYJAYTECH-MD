//══════════════════════════════════════════════════════════════════════════════//
//                          SIMPLE AUTO STATUS VIEWER                           //
//                              View Only - No Reactions                        //
//══════════════════════════════════════════════════════════════════════════════//

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../data/autostatus.json');

// Channel info for professional branding
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420618370733@newsletter',
            newsletterName: 'WALLYJAYTECH-MD BOTS',
            serverMessageId: -1
        }
    }
};

// Ensure directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Default config
let config = { 
    enabled: false
};

// Load config
try {
    if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
} catch (e) {}

// Save config
function saveConfig() {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (e) {}
}

// Track viewed statuses
const viewed = new Set();

// Clear cache every hour
setInterval(() => {
    viewed.clear();
}, 60 * 60 * 1000);

// Helper function to extract publisher
function getStatusPublisher(msg) {
    if (!msg || !msg.key) return null;
    return msg.key.participant || msg.participant || msg.key.remoteJid || null;
}

// Helper to check if status is from bot
function isOwnStatus(sock, publisher) {
    if (!sock || !sock.user || !publisher) return false;
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    return publisher === botJid;
}

// SIMPLE - Views status instantly
async function handleStatusUpdate(sock, chatUpdate) {
    try {
        if (!config.enabled || !sock) return;
        
        let messages = [];
        if (chatUpdate.messages) {
            messages = chatUpdate.messages;
        } else {
            messages = [chatUpdate];
        }
        
        for (const msg of messages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            
            const statusId = msg.key.id;
            if (viewed.has(statusId)) continue;
            
            const publisher = getStatusPublisher(msg);
            if (!publisher) continue;
            
            // Skip bot's own statuses
            if (isOwnStatus(sock, publisher)) continue;
            
            viewed.add(statusId);
            
            // JUST VIEW THE STATUS - no reaction
            const receipt = {
                remoteJid: 'status@broadcast',
                id: statusId,
                participant: publisher
            };
            
            await sock.readMessages([receipt]).catch(() => {});
        }
    } catch (e) {}
}

// Handle bulk status updates
async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        if (!config.enabled || !sock || !statusMessages) return;
        
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            
            const statusId = msg.key.id;
            if (viewed.has(statusId)) continue;
            
            const publisher = getStatusPublisher(msg);
            if (!publisher) continue;
            
            // Skip bot's own statuses
            if (isOwnStatus(sock, publisher)) continue;
            
            viewed.add(statusId);
            
            // View status
            const receipt = {
                remoteJid: 'status@broadcast',
                id: statusId,
                participant: publisher
            };
            
            await sock.readMessages([receipt]).catch(() => {});
        }
    } catch (e) {}
}

// Professional on/off command
async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || (senderId.includes('2348144317152') || senderId === '2348144317152@s.whatsapp.net');
        
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...channelInfo
            });
            return;
        }
        
        const cmd = args[0]?.toLowerCase();
        
        if (cmd === 'on' || cmd === 'enable') {
            config.enabled = true;
            saveConfig();
            
            const responseText = `✅ *AUTO-STATUS ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Bot will now automatically view all status updates instantly.\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Note:* Statuses are viewed without reactions.`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
        } 
        else if (cmd === 'off' || cmd === 'disable') {
            config.enabled = false;
            saveConfig();
            
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-STATUS DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer view statuses automatically.',
                ...channelInfo
            });
        }
        else {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            
            await sock.sendMessage(chatId, { 
                text: `👁️ *AUTO-STATUS SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autostatus on - Enable auto-view\n` +
                      `└ .autostatus off - Disable auto-view\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Note:* Statuses are viewed without reactions.`,
                ...channelInfo
            });
        }
    } catch (error) {
        console.error('❌ Error in autoStatusCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error processing command!',
            ...channelInfo
        });
    }
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand
};
