//══════════════════════════════════════════════════════════════════════════════//
//                          AUTO STATUS VIEWER WITH REACTIONS                   //
//                              View Statuses + React 💚                        //
//══════════════════════════════════════════════════════════════════════════════//

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

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
    enabled: false,
    reactOn: false
};

// Load config
try {
    if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } else {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
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

// React to status with 💚 - FIXED VERSION
async function reactToStatus(sock, statusKey) {
    try {
        if (!config.reactOn) return false;
        
        // Get the publisher JID
        const publisherJid = statusKey.participant || statusKey.remoteJid;
        if (!publisherJid) return false;
        
        // Send reaction using the correct method
        await sock.sendMessage('status@broadcast', {
            react: {
                text: '💚',
                key: {
                    remoteJid: 'status@broadcast',
                    fromMe: false,
                    id: statusKey.id,
                    participant: publisherJid
                }
            }
        });
        
        console.log(`✅ Reacted to status with 💚 from: ${publisherJid.split('@')[0]}`);
        return true;
    } catch (error) {
        // Silently fail - don't spam console
        if (!error.message?.includes('rate-overlimit')) {
            console.log(`⚠️ Could not react to status: ${error.message}`);
        }
        return false;
    }
}

// Views status instantly with optional reaction
async function handleStatusUpdate(sock, chatUpdate) {
    try {
        if (!config.enabled || !sock) return;
        
        // Handle different update types
        let statusKey = null;
        let publisher = null;
        
        // Case 1: Direct message with status
        if (chatUpdate.messages && chatUpdate.messages[0]) {
            const msg = chatUpdate.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                statusKey = msg.key;
                publisher = getStatusPublisher(msg);
            }
        }
        // Case 2: Direct key object
        else if (chatUpdate.key && chatUpdate.key.remoteJid === 'status@broadcast') {
            statusKey = chatUpdate.key;
            publisher = getStatusPublisher(chatUpdate);
        }
        // Case 3: Reaction or other update
        else if (chatUpdate.reaction && chatUpdate.reaction.key) {
            const reactKey = chatUpdate.reaction.key;
            if (reactKey.remoteJid === 'status@broadcast') {
                statusKey = reactKey;
                publisher = reactKey.participant || reactKey.remoteJid;
            }
        }
        
        if (!statusKey || !publisher) return;
        
        const statusId = statusKey.id;
        
        // Skip if already viewed
        if (viewed.has(statusId)) return;
        
        // Skip bot's own statuses
        if (isOwnStatus(sock, publisher)) return;
        
        // Mark as viewed
        viewed.add(statusId);
        
        // Small delay to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // View the status
        const receipt = {
            remoteJid: 'status@broadcast',
            id: statusId,
            participant: publisher
        };
        
        try {
            await sock.readMessages([receipt]);
            console.log(`✅ Viewed status from: ${publisher.split('@')[0]}`);
            
            // React after successful view (if reactions enabled)
            if (config.reactOn) {
                await reactToStatus(sock, statusKey);
            }
        } catch (err) {
            if (err.message?.includes('rate-overlimit')) {
                console.log('⚠️ Rate limit hit, waiting...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                await sock.readMessages([receipt]);
                if (config.reactOn) {
                    await reactToStatus(sock, statusKey);
                }
            }
        }
    } catch (e) {
        // Silent fail for status handler
        if (e.message && !e.message.includes('rate')) {
            console.log('⚠️ Status handler error:', e.message);
        }
    }
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
            
            if (isOwnStatus(sock, publisher)) continue;
            
            viewed.add(statusId);
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const receipt = {
                remoteJid: 'status@broadcast',
                id: statusId,
                participant: publisher
            };
            
            try {
                await sock.readMessages([receipt]);
                if (config.reactOn) {
                    await reactToStatus(sock, msg.key);
                }
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    await sock.readMessages([receipt]);
                    if (config.reactOn) {
                        await reactToStatus(sock, msg.key);
                    }
                }
            }
        }
    } catch (e) {}
}

// Professional command with reaction support - USING DYNAMIC OWNER CHECK
async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...channelInfo
            });
            return;
        }
        
        if (!args || args.length === 0) {
            const viewStatus = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const reactStatus = config.reactOn ? '✅ ENABLED' : '❌ DISABLED';
            const viewIcon = config.enabled ? '🟢' : '🔴';
            const reactIcon = config.reactOn ? '🟢' : '🔴';
            
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO-STATUS SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${viewIcon} *Auto View:* ${viewStatus}\n` +
                      `${reactIcon} *Reactions:* ${reactStatus}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autostatus on - Enable auto view\n` +
                      `└ .autostatus off - Disable auto view\n` +
                      `└ .autostatus react on - Enable reactions 💚\n` +
                      `└ .autostatus react off - Disable reactions\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Note:* Reactions use 💚 emoji`,
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const command = args[0].toLowerCase();
        
        if (command === 'on' || command === 'enable') {
            config.enabled = true;
            saveConfig();
            
            const responseText = `✅ *AUTO-VIEW ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Bot will now automatically view all status updates.\n` +
                      `💚 Reactions: ${config.reactOn ? 'ON' : 'OFF'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 Use .autostatus react on to enable reactions.`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
        } 
        else if (command === 'off' || command === 'disable') {
            config.enabled = false;
            saveConfig();
            
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-VIEW DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer view statuses automatically.',
                ...channelInfo
            });
        }
        else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatus react on/off\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autostatus react on\n└ .autostatus react off`,
                    ...channelInfo
                });
                return;
            }
            
            const reactCommand = args[1].toLowerCase();
            
            if (reactCommand === 'on' || reactCommand === 'enable') {
                config.reactOn = true;
                saveConfig();
                
                await sock.sendMessage(chatId, {
                    text: `💫 *REACTIONS ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will now react to status updates with 💚\n\n━━━━━━━━━━━━━━━━━━━━\n💡 Reactions are sent after viewing each status.`,
                    ...channelInfo
                });
            }
            else if (reactCommand === 'off' || reactCommand === 'disable') {
                config.reactOn = false;
                saveConfig();
                
                await sock.sendMessage(chatId, {
                    text: `❌ *REACTIONS DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer react to status updates.`,
                    ...channelInfo
                });
            }
            else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID OPTION*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Usage: .autostatus react on/off\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autostatus react on`,
                    ...channelInfo
                });
            }
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available Commands:*\n` +
                      `└ .autostatus on/off - Enable/disable auto view\n` +
                      `└ .autostatus react on/off - Enable/disable reactions\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✨ *Example:*\n` +
                      `└ .autostatus on\n` +
                      `└ .autostatus react on`,
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

// Helper functions for other modules
async function isAutoStatusEnabled() {
    return config.enabled;
}

async function isStatusReactionEnabled() {
    return config.reactOn;
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand,
    isAutoStatusEnabled,
    isStatusReactionEnabled
};
