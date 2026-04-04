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
const reacted = new Set(); // Track reacted statuses to avoid double reactions

// Clear cache every hour
setInterval(() => {
    viewed.clear();
    reacted.clear();
}, 60 * 60 * 1000);

// Helper function to extract publisher
function getStatusPublisher(msg) {
    if (!msg || !msg.key) return null;
    // Get the participant who posted the status
    const participant = msg.key.participant || msg.participant;
    if (participant && participant !== 'status@broadcast') {
        return participant;
    }
    return null;
}

// Helper to check if status is from bot
function isOwnStatus(sock, publisher) {
    if (!sock || !sock.user || !publisher) return false;
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    return publisher === botJid;
}

// Check if message is a reaction (to avoid loops)
function isReactionMessage(msg) {
    return msg.message?.reactionMessage || msg.reaction;
}

// React to status with 💚 - FIXED VERSION
async function reactToStatus(sock, statusId, publisherJid) {
    try {
        if (!config.reactOn) return false;
        if (!statusId || !publisherJid) return false;
        
        // Check if already reacted to this status
        const reactKey = `${statusId}_${publisherJid}`;
        if (reacted.has(reactKey)) {
            console.log(`💚 Already reacted to status ${statusId}, skipping`);
            return false;
        }
        
        console.log(`💚 Attempting to react to status: ${statusId} from ${publisherJid.split('@')[0]}`);
        
        // Send reaction
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
        
        // Mark as reacted
        reacted.add(reactKey);
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
        
        let messages = [];
        
        // Extract messages from different update types
        if (chatUpdate.messages) {
            messages = chatUpdate.messages;
        } else if (chatUpdate.key) {
            messages = [chatUpdate];
        } else {
            return;
        }
        
        for (const msg of messages) {
            // Skip if no key
            if (!msg.key) continue;
            
            // Skip if not a status broadcast
            if (msg.key.remoteJid !== 'status@broadcast') continue;
            
            // CRITICAL: Skip reaction messages to avoid infinite loop
            if (isReactionMessage(msg)) {
                console.log(`⏭️ Skipping reaction message to avoid loop`);
                continue;
            }
            
            // Skip if it's a message from the bot itself
            if (msg.key.fromMe === true) {
                console.log(`⏭️ Skipping bot's own message`);
                continue;
            }
            
            const statusId = msg.key.id;
            const publisher = getStatusPublisher(msg);
            
            if (!statusId || !publisher) {
                console.log(`⚠️ Could not extract publisher for status`);
                continue;
            }
            
            // Skip if already viewed
            if (viewed.has(statusId)) {
                console.log(`📱 Status ${statusId} already viewed`);
                continue;
            }
            
            // Skip bot's own statuses
            if (isOwnStatus(sock, publisher)) {
                console.log(`⏭️ Skipping bot's own status`);
                continue;
            }
            
            console.log(`📱 New status from: ${publisher.split('@')[0]}, ID: ${statusId}`);
            
            // Mark as viewed immediately to prevent duplicate processing
            viewed.add(statusId);
            
            // Small delay to ensure status is processed
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
                    // Delay before reacting
                    await new Promise(resolve => setTimeout(resolve, 1500));
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
            
            // Skip reaction messages
            if (isReactionMessage(msg)) continue;
            
            // Skip bot's own messages
            if (msg.key.fromMe === true) continue;
            
            const statusId = msg.key.id;
            const publisher = getStatusPublisher(msg);
            
            if (!statusId || !publisher) continue;
            
            if (viewed.has(statusId)) continue;
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
                    await new Promise(resolve => setTimeout(resolve, 1500));
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
