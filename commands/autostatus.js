/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * Fixes: skip deleted statuses, self-visibility, react requires view on
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autostatus.json');

if (!fs.existsSync(configPath)) {
    if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false, reactOn: false }, null, 2));
}

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

// Track reacted statuses with timestamp to detect deleted/reposted
const reactedStatuses = new Map();

// Clean old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, time] of reactedStatuses) {
        if (now - time > 30 * 60 * 1000) reactedStatuses.delete(key);
    }
}, 10 * 60 * 1000);

function readConfig() { try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) { return { enabled: false, reactOn: false }; } }
function writeConfig(config) { try { fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch (e) {} }
async function isAutoStatusEnabled() { const c = readConfig(); return c.enabled; }
async function isStatusReactionEnabled() { const c = readConfig(); return c.reactOn; }

async function reactToStatus(sock, msgKey) {
    try {
        const config = readConfig();
        // Require BOTH view and react to be ON
        if (!config.enabled || !config.reactOn) return;

        const participant = msgKey.participant || msgKey.remoteJid;
        if (!participant || participant === 'status@broadcast') return;

        // Check if this exact status was already reacted to
        const reactKey = `${participant}_${msgKey.id}`;
        if (reactedStatuses.has(reactKey)) {
            console.log(`⏭️ Already reacted to this status: ${msgKey.id}`);
            return;
        }

        console.log(`💚 Reacting | participant: ${participant} | id: ${msgKey.id}`);

        await sock.relayMessage('status@broadcast', {
            reactionMessage: {
                key: {
                    remoteJid: 'status@broadcast',
                    id: msgKey.id,
                    participant: participant,
                    fromMe: false
                },
                text: '💚'
            }
        }, {
            messageId: msgKey.id,
            statusJidList: [participant, sock.user.id] // Include self so bot owner sees reaction
        });

        // Store with timestamp
        reactedStatuses.set(reactKey, Date.now());
        console.log('✅ Reacted:', msgKey.id);
    } catch (error) {
        console.error('❌ Reaction error:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const config = readConfig();
        if (!config.enabled) return;
        
        await new Promise(r => setTimeout(r, 1000));

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {
                
                // Skip protocol messages (deletions, revocations)
                if (msg.message?.protocolMessage) {
                    console.log('⏭️ Skipping protocol message');
                    return;
                }

                try {
                    await sock.readMessages([msg.key]);
                    console.log('✅ Viewed:', msg.key.id);
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        await new Promise(r => setTimeout(r, 2000));
                        await sock.readMessages([msg.key]);
                    }
                }
            }
        }
    } catch (e) { console.error('❌ Status error:', e.message); }
}

async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        const config = readConfig();
        if (!config.enabled) return;
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (msg.key.fromMe === true) continue;
            if (msg.message?.protocolMessage) continue;
            try { await sock.readMessages([msg.key]); await reactToStatus(sock, msg.key); } catch (err) {
                if (err.message?.includes('rate-overlimit')) { await new Promise(r => setTimeout(r, 2000)); }
            }
        }
    } catch (e) {}
}

async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) { await sock.sendMessage(chatId, { text: '❌ Owner only!', ...channelInfo }); return; }

        const config = readConfig();

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO-STATUS SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Auto View:* ${config.enabled ? '✅ ON' : '❌ OFF'}\n` +
                      `🟢 *Auto React:* ${config.reactOn ? '✅ ON' : '❌ OFF'}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 *Note:* Reactions require Auto View to be ON first\n\n` +
                      `📖 *Commands:*\n` +
                      `└ .autostatus on/off\n` +
                      `└ .autostatus react on/off`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const command = args[0].toLowerCase();

        if (command === 'on' || command === 'enable') {
            if (config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Auto-Status View is already *ON*.\n\n💡 Use .autostatus off to disable.`, ...channelInfo }); return; }
            config.enabled = true; writeConfig(config);
            await sock.sendMessage(chatId, { text: `✅ *AUTO-VIEW ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will now view all status updates.\n💚 Reactions: ${config.reactOn ? 'ON' : 'OFF'}\n\n💡 Use .autostatus react on to enable reactions.`, ...channelInfo });
        } else if (command === 'off' || command === 'disable') {
            if (!config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Auto-Status View is already *OFF*.\n\n💡 Use .autostatus on to enable.`, ...channelInfo }); return; }
            config.enabled = false;
            config.reactOn = false; // Also disable reactions when view is off
            writeConfig(config);
            await sock.sendMessage(chatId, { text: `❌ *AUTO-VIEW DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will no longer view statuses.\n💚 Reactions also disabled.\n\n💡 Use .autostatus on to enable.`, ...channelInfo });
        } else if (command === 'react') {
            if (!args[1]) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autostatus react on/off\n\n✨ *Example:*\n└ .autostatus react on`, ...channelInfo }); return; }
            const newState = (args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'enable');
            
            // Require view to be ON before enabling reactions
            if (newState && !config.enabled) {
                await sock.sendMessage(chatId, { 
                    text: `⚠️ *VIEW REQUIRED FIRST*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 You must enable Auto View first!\n\n💡 Use .autostatus on to enable view,\nthen .autostatus react on for reactions.`,
                    ...channelInfo
                });
                return;
            }
            
            if (config.reactOn === newState) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ${newState ? 'ENABLED' : 'DISABLED'}*\n\n━━━━━━━━━━━━━━━━━━━━\n💚 Reactions are already *${newState ? 'ON' : 'OFF'}*.\n\n💡 Use .autostatus react ${newState ? 'off' : 'on'} to change.`, ...channelInfo }); return; }
            config.reactOn = newState; writeConfig(config);
            await sock.sendMessage(chatId, { 
                text: newState 
                    ? `💫 *REACTIONS ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will now react to status updates with 💚\n👁️ You will see your own reactions.\n🛡️ Duplicate protection active.`
                    : `❌ *REACTIONS DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Bot will no longer react to status updates.\n\n💡 Use .autostatus react on to enable.`,
                ...channelInfo
            });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

module.exports = { handleStatusUpdate, handleBulkStatusUpdate, autoStatusCommand, isAutoStatusEnabled, isStatusReactionEnabled, readConfig, writeConfig };
