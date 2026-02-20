//══════════════════════════════════════════════════════════════════════════════//
//                          ULTRA FAST AUTO STATUS VIEWER                       //
//                          Only .autostatus on/off                             //
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
let config = { enabled: false };

// Load config
try {
    if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
} catch (e) {}

// Save config
function saveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config));
}

// Track viewed statuses to avoid double-viewing
const viewed = new Set();

// Clear cache every hour
setInterval(() => {
    viewed.clear();
}, 60 * 60 * 1000);

// ULTRA FAST - Views status instantly
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
            if (viewed.has(msg.key.id)) continue;
            
            viewed.add(msg.key.id);
            
            // INSTANT VIEW
            const receipt = {
                remoteJid: 'status@broadcast',
                id: msg.key.id,
                participant: msg.key.participant || msg.key.remoteJid
            };
            
            sock.readMessages([receipt]).catch(() => {});
        }
    } catch (e) {}
}

// Handle bulk status updates
async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        if (!config.enabled || !sock || !statusMessages) return;
        
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (viewed.has(msg.key.id)) continue;
            
            viewed.add(msg.key.id);
            
            const receipt = {
                remoteJid: 'status@broadcast',
                id: msg.key.id,
                participant: msg.key.participant || msg.key.remoteJid
            };
            
            sock.readMessages([receipt]).catch(() => {});
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
            await sock.sendMessage(chatId, { text: '✅ *Auto Status: ON*\n\nNow viewing statuses instantly!' }, { quoted: message });
        } 
        else if (cmd === 'off') {
            config.enabled = false;
            saveConfig();
            await sock.sendMessage(chatId, { text: '❌ *Auto Status: OFF*' }, { quoted: message });
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
