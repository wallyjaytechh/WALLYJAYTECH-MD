/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * relayMessage method - proven working
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

function readConfig() { try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) { return { enabled: false, reactOn: false }; } }
function writeConfig(config) { try { fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch (e) {} }
async function isAutoStatusEnabled() { const c = readConfig(); return c.enabled; }
async function isStatusReactionEnabled() { const c = readConfig(); return c.reactOn; }

// relayMessage method - the one that actually works
async function reactToStatus(sock, msgKey) {
    try {
        const config = readConfig();
        if (!config.reactOn) return;

        const participant = msgKey.participant || msgKey.remoteJid;
        if (!participant || participant === 'status@broadcast') return;

        console.log(`💚 Reacting via relayMessage | participant: ${participant} | id: ${msgKey.id}`);

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
            statusJidList: [participant]
        });

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
                text: `👁️ *AUTO-STATUS SETTINGS*\n\n🟢 *Auto View:* ${config.enabled ? '✅ ON' : '❌ OFF'}\n🟢 *Auto React:* ${config.reactOn ? '✅ ON' : '❌ OFF'}\n\n📖 .autostatus on/off\n📖 .autostatus react on/off`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const command = args[0].toLowerCase();
        if (command === 'on' || command === 'enable') {
            if (config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*`, ...channelInfo }); return; }
            config.enabled = true; writeConfig(config);
            await sock.sendMessage(chatId, { text: `✅ *AUTO-VIEW ENABLED*\n\n💚 Reactions: ${config.reactOn ? 'ON' : 'OFF'}`, ...channelInfo });
        } else if (command === 'off' || command === 'disable') {
            if (!config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*`, ...channelInfo }); return; }
            config.enabled = false; writeConfig(config);
            await sock.sendMessage(chatId, { text: `❌ *AUTO-VIEW DISABLED*`, ...channelInfo });
        } else if (command === 'react') {
            if (!args[1]) { await sock.sendMessage(chatId, { text: `⚠️ Usage: .autostatus react on/off`, ...channelInfo }); return; }
            const newState = (args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'enable');
            if (config.reactOn === newState) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ${newState ? 'ENABLED' : 'DISABLED'}*`, ...channelInfo }); return; }
            config.reactOn = newState; writeConfig(config);
            await sock.sendMessage(chatId, { text: newState ? `💫 *REACTIONS ENABLED*` : `❌ *REACTIONS DISABLED*`, ...channelInfo });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

module.exports = { handleStatusUpdate, handleBulkStatusUpdate, autoStatusCommand, isAutoStatusEnabled, isStatusReactionEnabled, readConfig, writeConfig };
