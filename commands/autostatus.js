/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * Fixed for Baileys v7+
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

// Clear cache every hour
setInterval(() => {
    viewed.clear();
    reacted.clear();
}, 60 * 60 * 1000);

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
    return msg.message?.reactionMessage || msg.reaction;
}

// Send reaction - FIXED for Baileys v7
async function reactToStatus(sock, statusId, publisherJid) {
    try {
        if (!config.reactOn) return false;
        if (!statusId || !publisherJid) return false;
        
        const reactKey = `${statusId}_${publisherJid}`;
        if (reacted.has(reactKey)) {
            return false;
        }
        
        console.log(`💚 Reacting to status: ${statusId} from ${publisherJid.split('@')[0]}`);
        
        // Method 1: Try standard reaction format
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
            }, { statusJidList: [publisherJid] });
            
            reacted.add(reactKey);
            console.log(`✅ Reacted to status with 💚`);
            return true;
        } catch (err1) {
            console.log(`⚠️ Method 1 failed: ${err1.message}`);
            
            // Method 2: Try direct reaction on status broadcast
            try {
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
                
                reacted.add(reactKey);
                console.log(`✅ Reacted with method 2`);
                return true;
            } catch (err2) {
                console.log(`⚠️ Method 2 failed: ${err2.message}`);
                
                // Method 3: Try with fromMe: true
                try {
                    await sock.sendMessage('status@broadcast', {
                        react: {
                            text: '💚',
                            key: {
                                remoteJid: 'status@broadcast',
                                fromMe: true,
                                id: statusId,
                                participant: publisherJid
                            }
                        }
                    });
                    
                    reacted.add(reactKey);
                    console.log(`✅ Reacted with method 3`);
                    return true;
                } catch (err3) {
                    console.log(`⚠️ All reaction methods failed: ${err3.message}`);
                    return false;
                }
            }
        }
    } catch (error) {
        console.log(`⚠️ React error: ${error.message}`);
        return false;
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
            
            console.log(`📱 Status from: ${publisher.split('@')[0]}, ID: ${statusId}`);
            viewed.add(statusId);
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // View the status
            const receipt = {
                remoteJid: 'status@broadcast',
                id: statusId,
                participant: publisher
            };
            
            try {
                await sock.readMessages([receipt]);
                console.log(`✅ Viewed status`);
                
                // React if enabled
                if (config.reactOn) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await reactToStatus(sock, statusId, publisher);
                }
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit, waiting 5s...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    try {
                        await sock.readMessages([receipt]);
                        if (config.reactOn) {
                            await reactToStatus(sock, statusId, publisher);
                        }
                    } catch (e2) {}
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
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const receipt = {
                remoteJid: 'status@broadcast',
                id: statusId,
                participant: publisher
            };
            
            try {
                await sock.readMessages([receipt]);
                console.log(`✅ Viewed bulk status`);
                
                if (config.reactOn) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await reactToStatus(sock, statusId, publisher);
                }
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    try {
                        await sock.readMessages([receipt]);
                        if (config.reactOn) await reactToStatus(sock, statusId, publisher);
                    } catch (e2) {}
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
                text: `✅ *AUTO-VIEW ENABLED*\n\n📌 Bot will now view all status updates.\n💚 Reactions: ${config.reactOn ? 'ON' : 'OFF'}`,
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
                    text: `💫 *REACTIONS ENABLED*\n\nBot will react to statuses with 💚`,
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
            text: '❌ Error processing command!',
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
