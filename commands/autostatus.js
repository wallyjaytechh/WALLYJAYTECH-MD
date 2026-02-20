//══════════════════════════════════════════════════════════════════════════════//
//                          SIMPLE AUTO STATUS VIEWER                           //
//                              View Only - No Reactions                        //
//══════════════════════════════════════════════════════════════════════════════//

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../data/autostatus.json');

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
            
            // Optional: Uncomment to see logs
            // const publisherNumber = publisher.split('@')[0].split(':')[0];
            // console.log(`👁️ Viewed status from: ${publisherNumber}`);
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

// Simple on/off command
async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const cmd = args[0]?.toLowerCase();
        
        if (cmd === 'on') {
            config.enabled = true;
            saveConfig();
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto Status: ON*\n\nNow viewing statuses instantly!' 
            }, { quoted: message });
        } 
        else if (cmd === 'off') {
            config.enabled = false;
            saveConfig();
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto Status: OFF*' 
            }, { quoted: message });
        }
        else {
            const status = config.enabled ? 'ON ✅' : 'OFF ❌';
            await sock.sendMessage(chatId, { 
                text: `📱 *AUTO STATUS*\n\nStatus: ${status}\n\nCommands:\n• .autostatus on\n• .autostatus off` 
            }, { quoted: message });
        }
    } catch (error) {
        await sock.sendMessage(chatId, { text: '❌ Error processing command' }, { quoted: message });
    }
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand
};
