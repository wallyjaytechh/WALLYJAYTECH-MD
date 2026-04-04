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

// React to status with 💚 - WORKING VERSION
async function reactToStatus(sock, statusId, publisherJid) {
    try {
        if (!config.reactOn) return false;
        if (!statusId || !publisherJid) return false;
        
        console.log(`💚 Attempting to react to status: ${statusId} from ${publisherJid.split('@')[0]}`);
        
        // Method 1: Using react key
        await sock.sendMessage('status@broadcast', {
            react: {
                text: '💚',
                key: {
                    remoteJid: 'status@broadcast',
                    fromMe: false,
                    id: statusId,
                    participant: publisherJid
                }
            }
        });
        
        console.log(`✅ Reacted to status with 💚 from: ${publisherJid.split('@')[0]}`);
        return true;
    } catch (error) {
        console.log(`⚠️ Could not react to status: ${error.message}`);
        return false;
    }
}

// Views status instantly with optional reaction
async function handleStatusUpdate(sock, chatUpdate) {
    try {
        if (!config.enabled || !sock) return;
        
        console.log('📱 Status update received:', JSON.stringify(chatUpdate, null, 2).substring(0, 500));
        
        let statusId = null;
        let publisher = null;
        
        // Case 1: messages.upsert event
        if (chatUpdate.messages && chatUpdate.messages[0]) {
            const msg = chatUpdate.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                statusId = msg.key.id;
                publisher = msg.key.participant || msg.key.remoteJid;
                console.log(`📱 Found status in messages.upsert: ${statusId}`);
            }
        }
        // Case 2: Direct status update
        else if (chatUpdate.key && chatUpdate.key.remoteJid === 'status@broadcast') {
            statusId = chatUpdate.key.id;
            publisher = chatUpdate.key.participant || chatUpdate.key.remoteJid;
            console.log(`📱 Found status in direct update: ${statusId}`);
        }
        
        if (!statusId || !publisher) {
            console.log('📱 No status found in update');
            return;
        }
        
        // Skip if already viewed
        if (viewed.has(statusId)) {
            console.log(`📱 Status ${statusId} already viewed, skipping`);
            return;
        }
        
        // Skip bot's own statuses
        if (isOwnStatus(sock, publisher)) {
            console.log(`📱 Skipping bot's own status`);
            return;
        }
        
        // Mark as viewed
        viewed.add(statusId);
        
        // Small delay to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
                // Add a small delay before reacting
                await new Promise(resolve => setTimeout(resolve, 1000));
                await reactToStatus(sock, statusId, publisher);
            }
        } catch (err) {
            if (err.message?.includes('rate-overlimit')) {
                console.log('⚠️ Rate limit hit, waiting 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                await sock.readMessages([receipt]);
                if (config.reactOn) {
                    await reactToStatus(sock, statusId, publisher);
                }
            } else {
                console.log(`⚠️ Error viewing status: ${err.message}`);
            }
        }
    } catch (e) {
        console.log('⚠️ Status handler error:', e.message);
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
            
            const publisher = msg.key.participant || msg.key.remoteJid;
            if (!publisher) continue;
            
            if (isOwnStatus(sock, publisher)) continue;
            
            viewed.add(statusId);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const receipt = {
                remoteJid: 'status@broadcast',
                id: statusId,
                participant: publisher
            };
            
            try {
                await sock.readMessages([receipt]);
                console.log(`✅ Viewed bulk status from: ${publisher.split('@')[0]}`);
                
                if (config.reactOn) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await reactToStatus(sock, statusId, publisher);
                }
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    await sock.readMessages([receipt]);
                    if (config.reactOn) {
                        await reactToStatus(sock, statusId, publisher);
                    }
                }
            }
        }
    } catch (e) {
        console.log('⚠️ Bulk status error:', e.message);
    }
}

// Professional command with reaction support
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
