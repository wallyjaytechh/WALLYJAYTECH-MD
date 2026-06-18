/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * FINAL FIX: Preserves @s.whatsapp.net suffix on destination JID
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const CONFIG_FILE = path.join(__dirname, '../data/autostatus.json');

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

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let config = { enabled: false, reactOn: false };

try {
    if (fs.existsSync(CONFIG_FILE)) {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } else {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    }
} catch (e) {}

function saveConfig() {
    try { fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2)); } catch (e) {}
}

const viewed = new Set();
const reacted = new Set();

setInterval(() => { viewed.clear(); reacted.clear(); }, 30 * 60 * 1000);

function getStatusPublisher(msg) {
    if (!msg || !msg.key) return null;
    const participant = msg.key.participant || msg.participant;
    if (participant && participant !== 'status@broadcast') return participant;
    return null;
}

function isOwnStatus(sock, publisher) {
    if (!sock || !sock.user || !publisher) return false;
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    return publisher === botJid || publisher.split(':')[0] === botJid.split(':')[0];
}

function isReactionMessage(msg) {
    if (!msg || !msg.message) return false;
    return !!msg.message.reactionMessage;
}

// React to status with 💚 - FINAL FIXED VERSION
// Destination MUST include @s.whatsapp.net suffix
// Key participant MUST be the original LID from the status
async function reactToStatus(sock, statusId, publisherJid) {
    try {
        if (!config.reactOn) return false;
        if (!statusId || !publisherJid) return false;

        const reactKey = `${statusId}_${publisherJid}`;
        if (reacted.has(reactKey)) return false;

        // Resolve destination JID - MUST keep @s.whatsapp.net suffix
        let targetJid = publisherJid;
        
        if (publisherJid.endsWith('@lid')) {
            try {
                if (sock.signalRepository?.lidMapping?.getPNForLID) {
                    const pn = await sock.signalRepository.lidMapping.getPNForLID(publisherJid);
                    if (pn) {
                        // Strip :0 device suffix but KEEP @s.whatsapp.net
                        targetJid = pn.replace(/:\d+@/, '@');
                    }
                }
            } catch (e) {
                console.log(`⚠️ LID resolution failed: ${e.message}`);
            }
        }
        
        // CRITICAL: Ensure destination has @s.whatsapp.net suffix
        if (!targetJid.includes('@')) {
            targetJid = targetJid + '@s.whatsapp.net';
        }

        console.log(`💚 Reacting -> Destination: ${targetJid} | Key participant: ${publisherJid}`);

        await sock.sendMessage(targetJid, {
            react: {
                text: '💚',
                key: {
                    remoteJid: 'status@broadcast',
                    fromMe: false,
                    id: statusId,
                    participant: publisherJid  // Original LID stays here
                }
            }
        });

        reacted.add(reactKey);
        console.log(`✅ Reaction delivered`);
        return true;

    } catch (error) {
        console.log(`⚠️ Reaction failed: ${error.message}`);
        
        // Fallback: try sending directly to the original JID
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
            console.log(`✅ Reaction delivered (fallback)`);
            return true;
        } catch (e2) {
            console.log(`⚠️ Fallback failed: ${e2.message}`);
            return false;
        }
    }
}

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
            
            console.log(`📱 Status: ${publisher}`);
            viewed.add(statusId);
            
            await new Promise(r => setTimeout(r, 2000));
            
            try {
                await sock.readMessages([{
                    remoteJid: 'status@broadcast',
                    id: statusId,
                    participant: publisher
                }]);
                console.log(`✅ Viewed`);
                
                if (config.reactOn) {
                    await new Promise(r => setTimeout(r, 1500));
                    await reactToStatus(sock, statusId, publisher);
                }
            } catch (err) {
                console.log(`⚠️ View error: ${err.message}`);
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
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO-STATUS SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Auto View:* ${config.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n` +
                      `🟢 *Reactions:* ${config.reactOn ? '✅ ENABLED' : '❌ DISABLED'}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autostatus on/off\n` +
                      `└ .autostatus react on/off`,
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const command = args[0].toLowerCase();
        
        if (command === 'on' || command === 'enable') {
            config.enabled = true;
            saveConfig();
            await sock.sendMessage(chatId, { text: `✅ *AUTO-VIEW ENABLED*`, ...channelInfo });
        } else if (command === 'off' || command === 'disable') {
            config.enabled = false;
            saveConfig();
            await sock.sendMessage(chatId, { text: `❌ *AUTO-VIEW DISABLED*`, ...channelInfo });
        } else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { text: `⚠️ Usage: .autostatus react on/off`, ...channelInfo });
                return;
            }
            const reactCmd = args[1].toLowerCase();
            config.reactOn = (reactCmd === 'on' || reactCmd === 'enable');
            saveConfig();
            await sock.sendMessage(chatId, {
                text: config.reactOn ? `💫 *REACTIONS ENABLED*` : `❌ *REACTIONS DISABLED*`,
                ...channelInfo
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
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
