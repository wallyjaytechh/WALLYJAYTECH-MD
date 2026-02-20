//══════════════════════════════════════════════════════════════════════════════//
//                          ULTRA FAST AUTO STATUS VIEWER                       //
//                    WITH AUTO-REACTION (Green Heart at Bottom)                //
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
    enabled: false,
    reactEnabled: false,  // Auto-reaction on/off
    reactionEmoji: '❤️'    // Default green heart
};

// Load config
try {
    if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
} catch (e) {}

// Save config
function saveConfig() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Track viewed statuses to avoid double-viewing
const viewed = new Set();

// Clear cache every hour
setInterval(() => {
    viewed.clear();
}, 60 * 60 * 1000);

// ULTRA FAST - Views status instantly and reacts if enabled
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
            
            // 1. VIEW THE STATUS (mark as seen)
            const receipt = {
                remoteJid: 'status@broadcast',
                id: msg.key.id,
                participant: msg.key.participant || msg.key.remoteJid
            };
            
            await sock.readMessages([receipt]).catch(() => {});
            
            // 2. REACT TO THE STATUS if enabled (green heart at bottom right)
            if (config.reactEnabled) {
                const statusKey = {
                    remoteJid: 'status@broadcast',
                    id: msg.key.id,
                    participant: msg.key.participant || msg.key.remoteJid,
                    fromMe: false
                };
                
                // Send reaction to the status
                await sock.sendMessage('status@broadcast', {
                    react: {
                        text: config.reactionEmoji,
                        key: statusKey
                    }
                }).catch(() => {});
                
                console.log(`❤️ Auto-reacted to status from: ${(msg.key.participant || msg.key.remoteJid).split('@')[0]}`);
            }
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
            
            // View status
            const receipt = {
                remoteJid: 'status@broadcast',
                id: msg.key.id,
                participant: msg.key.participant || msg.key.remoteJid
            };
            
            await sock.readMessages([receipt]).catch(() => {});
            
            // React if enabled
            if (config.reactEnabled) {
                const statusKey = {
                    remoteJid: 'status@broadcast',
                    id: msg.key.id,
                    participant: msg.key.participant || msg.key.remoteJid,
                    fromMe: false
                };
                
                await sock.sendMessage('status@broadcast', {
                    react: {
                        text: config.reactionEmoji,
                        key: statusKey
                    }
                }).catch(() => {});
            }
        }
    } catch (e) {}
}

// Simple on/off command with reaction control
async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const cmd = args[0]?.toLowerCase();
        
        // Main on/off
        if (cmd === 'on') {
            config.enabled = true;
            saveConfig();
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto Status: ON*\n\nNow viewing statuses instantly!\nUse .autostatus react on to also react with ❤️' 
            }, { quoted: message });
        } 
        else if (cmd === 'off') {
            config.enabled = false;
            saveConfig();
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto Status: OFF*' 
            }, { quoted: message });
        }
        // Reaction control
        else if (cmd === 'react') {
            const reactCmd = args[1]?.toLowerCase();
            
            if (reactCmd === 'on') {
                config.reactEnabled = true;
                saveConfig();
                await sock.sendMessage(chatId, { 
                    text: `✅ *Auto-Reaction: ON*\n\nNow reacting to statuses with ${config.reactionEmoji}` 
                }, { quoted: message });
            }
            else if (reactCmd === 'off') {
                config.reactEnabled = false;
                saveConfig();
                await sock.sendMessage(chatId, { 
                    text: '❌ *Auto-Reaction: OFF*' 
                }, { quoted: message });
            }
            else if (reactCmd === 'emoji') {
                const newEmoji = args[2];
                if (newEmoji) {
                    config.reactionEmoji = newEmoji;
                    saveConfig();
                    await sock.sendMessage(chatId, { 
                        text: `✅ Reaction emoji set to: ${newEmoji}` 
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, { 
                        text: `Current reaction emoji: ${config.reactionEmoji}\n\nUsage: .autostatus react emoji ❤️` 
                    }, { quoted: message });
                }
            }
            else {
                const reactStatus = config.reactEnabled ? 'ON ✅' : 'OFF ❌';
                await sock.sendMessage(chatId, { 
                    text: `📱 *AUTO-REACTION SETTINGS*\n\n` +
                          `Status: ${reactStatus}\n` +
                          `Emoji: ${config.reactionEmoji}\n\n` +
                          `Commands:\n` +
                          `• .autostatus react on\n` +
                          `• .autostatus react off\n` +
                          `• .autostatus react emoji ❤️` 
                }, { quoted: message });
            }
        }
        // Show status
        else {
            const status = config.enabled ? 'ON ✅' : 'OFF ❌';
            const reactStatus = config.reactEnabled ? 'ON ✅' : 'OFF ❌';
            await sock.sendMessage(chatId, { 
                text: `📱 *AUTO STATUS*\n\n` +
                      `View Status: ${status}\n` +
                      `Auto-Reaction: ${reactStatus} (${config.reactionEmoji})\n\n` +
                      `Commands:\n` +
                      `• .autostatus on\n` +
                      `• .autostatus off\n` +
                      `• .autostatus react on/off\n` +
                      `• .autostatus react emoji ❤️` 
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
