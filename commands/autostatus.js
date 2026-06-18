/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * Now with notification trigger
 */

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

// Track viewed/ reacted statuses
const viewed = new Set();
const reacted = new Set();

// Clear cache every 30 minutes
setInterval(() => {
    viewed.clear();
    reacted.clear();
}, 30 * 60 * 1000);

// Helper: extract publisher
function getStatusPublisher(msg) {
    if (!msg || !msg.key) return null;
    const participant = msg.key.participant || msg.participant;
    if (participant && participant !== 'status@broadcast') {
        return participant;
    }
    return null;
}

// Helper: is own status
function isOwnStatus(sock, publisher) {
    if (!sock || !sock.user || !publisher) return false;
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    return publisher === botJid;
}

// Helper: is reaction message
function isReactionMessage(msg) {
    if (!msg || !msg.message) return false;
    return msg.message.reactionMessage ? true : false;
}

// React to status with 💚 - WITH NOTIFICATION TRIGGER
async function reactToStatus(sock, statusId, publisherJid) {
    try {
        if (!config.reactOn) return false;
        if (!statusId || !publisherJid) return false;
        
        const reactKey = `${statusId}_${publisherJid}`;
        if (reacted.has(reactKey)) return false;
        
        console.log(`💚 Reacting to status: ${publisherJid.split('@')[0]}`);
        
        // Step 1: Remove any existing reaction first
        try {
            await sock.sendMessage(publisherJid, {
                react: {
                    text: '',
                    key: {
                        remoteJid: 'status@broadcast',
                        fromMe: false,
                        id: statusId,
                        participant: publisherJid
                    }
                }
            });
            await new Promise(r => setTimeout(r, 800));
        } catch (e) {
            // Ignore if no existing reaction
        }
        
        // Step 2: Send new reaction with notification
        await sock.sendMessage(publisherJid, {
            react: {
                text: '💚',
                key: {
                    remoteJid: 'status@broadcast',
                    fromMe: false,
                    id: statusId,
                    participant: publisherJid
                }
            }
        }, {
            statusJidList: [publisherJid]
        });
        
        reacted.add(reactKey);
        console.log(`✅ Reaction sent with notification to user`);
        return true;
        
    } catch (error) {
        // Fallback: try simple reaction
        try {
            await sock.sendMessage(publisherJid, {
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
            
            reacted.add(reactKey);
            console.log(`✅ Reaction sent (fallback)`);
            return true;
        } catch (err2) {
            console.log(`⚠️ Reaction failed: ${err2.message}`);
            return false;
        }
    }
}

// View and react to status
async function handleStatusUpdate(sock, chatUpdate) {
    try {
        if (!config.enabled || !sock) return;
        
        let messages = [];
        if (chatUpdate.messages) {
            messages = chatUpdate.messages;
        } else if (chatUpdate.key) {
            messages = [chatUpdate];
        } else {
            return;
        }
        
        for (const msg of messages) {
            if (!msg.key) continue;
            if (msg.key.remoteJid !== 'status@broadcast') continue;
            if (isReactionMessage(msg)) continue;
            if (msg.key.fromMe === true) continue;
            
            const statusId = msg.key.id;
            const publisher = getStatusPublisher(msg);
            
            if (!statusId || !publisher) continue;
            if (viewed.has(statusId)) continue;
            if (isOwnStatus(sock, publisher)) continue;
            
            console.log(`📱 New status: ${publisher.split('@')[0]}`);
            viewed.add(statusId);
            
            // Delay before viewing
            await new Promise(r => setTimeout(r, 2000));
            
            // View the status
            try {
                await sock.readMessages([{
                    remoteJid: 'status@broadcast',
                    id: statusId,
                    participant: publisher
                }]);
                console.log(`✅ Viewed`);
                
                // React after viewing
                if (config.reactOn) {
                    await new Promise(r => setTimeout(r, 1500));
                    await reactToStatus(sock, statusId, publisher);
                }
            } catch (err) {
                console.log(`⚠️ View error: ${err.message}`);
                // Still try to react
                if (config.reactOn) {
                    await new Promise(r => setTimeout(r, 3000));
                    await reactToStatus(sock, statusId, publisher);
                }
            }
        }
    } catch (e) {
        console.log('⚠️ Status error:', e.message);
    }
}

// Bulk status handler
async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        if (!config.enabled || !sock || !statusMessages) return;
        
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (isReactionMessage(msg)) continue;
            if (msg.key.fromMe === true) continue;
            
            const statusId = msg.key.id;
            const publisher = getStatusPublisher(msg);
            
            if (!statusId || !publisher) continue;
            if (viewed.has(statusId)) continue;
            if (isOwnStatus(sock, publisher)) continue;
            
            viewed.add(statusId);
            
            await new Promise(r => setTimeout(r, 1500));
            
            try {
                await sock.readMessages([{
                    remoteJid: 'status@broadcast',
                    id: statusId,
                    participant: publisher
                }]);
                console.log(`✅ Bulk viewed`);
                
                if (config.reactOn) {
                    await new Promise(r => setTimeout(r, 1000));
                    await reactToStatus(sock, statusId, publisher);
                }
            } catch (err) {
                if (config.reactOn) {
                    await new Promise(r => setTimeout(r, 2000));
                    await reactToStatus(sock, statusId, publisher);
                }
            }
        }
    } catch (e) {
        console.log('⚠️ Bulk error:', e.message);
    }
}

// Command handler
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
                      `└ .autostatus react off - Disable reactions`,
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const command = args[0].toLowerCase();
        
        if (command === 'on' || command === 'enable') {
            config.enabled = true;
            saveConfig();
            await sock.sendMessage(chatId, {
                text: `✅ *AUTO-VIEW ENABLED*\n\n📌 Viewing all statuses.\n💚 Reactions: ${config.reactOn ? 'ON' : 'OFF'}`,
                ...channelInfo
            });
        } 
        else if (command === 'off' || command === 'disable') {
            config.enabled = false;
            saveConfig();
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-VIEW DISABLED*',
                ...channelInfo
            });
        }
        else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Usage: .autostatus react on/off`,
                    ...channelInfo
                });
                return;
            }
            
            const reactCmd = args[1].toLowerCase();
            if (reactCmd === 'on' || reactCmd === 'enable') {
                config.reactOn = true;
                saveConfig();
                await sock.sendMessage(chatId, {
                    text: `💫 *REACTIONS ENABLED*\n\nBot will react with 💚\nUsers will receive notification`,
                    ...channelInfo
                });
            } else {
                config.reactOn = false;
                saveConfig();
                await sock.sendMessage(chatId, {
                    text: `❌ *REACTIONS DISABLED*`,
                    ...channelInfo
                });
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error!',
            ...channelInfo
        });
    }
}

async function isAutoStatusEnabled() { return config.enabled; }
async function isStatusReactionEnabled() { return config.reactOn; }

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand,
    isAutoStatusEnabled,
    isStatusReactionEnabled
};
