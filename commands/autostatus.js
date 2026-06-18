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

async function reactToStatus(sock, statusKey) {
    try {
        const config = readConfig();
        if (!config.reactOn) return;
        await sock.relayMessage('status@broadcast', {
            reactionMessage: {
                key: { remoteJid: 'status@broadcast', id: statusKey.id, participant: statusKey.participant || statusKey.remoteJid, fromMe: false },
                text: '💚'
            }
        }, { messageId: statusKey.id, statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid] });
        console.log('✅ Reacted to status:', statusKey.id);
    } catch (error) { console.error('❌ Reaction error:', error.message); }
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
                    if (err.message?.includes('rate-overlimit')) { await new Promise(r => setTimeout(r, 2000)); await sock.readMessages([msg.key]); }
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
            try { await sock.readMessages([msg.key]); await reactToStatus(sock, msg.key); } catch (err) { if (err.message?.includes('rate-overlimit')) { await new Promise(r => setTimeout(r, 2000)); } }
        }
    } catch (e) {}
}

async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) return;

        const config = readConfig();

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO-STATUS SETTINGS*\n\n━━━━━━━━━━━━━━━━━━━━\n🟢 *Auto View:* ${config.enabled ? '✅ ON' : '❌ OFF'}\n🟢 *Reactions:* ${config.reactOn ? '✅ ON' : '❌ OFF'}\n━━━━━━━━━━━━━━━━━━━━\n📖 *Commands:*\n└ .autostatus on/off\n└ .autostatus react on/off`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const command = args[0].toLowerCase();

        if (command === 'on' || command === 'enable') {
            if (config.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Auto-Status View is already *ON*.\n\n💡 Use .autostatus off to disable.`, ...channelInfo });
                return;
            }
            config.enabled = true;
            writeConfig(config);
            await sock.sendMessage(chatId, { text: `✅ *AUTO-VIEW ENABLED*\n\n📌 Viewing all statuses.\n💚 Reactions: ${config.reactOn ? 'ON' : 'OFF'}`, ...channelInfo });
        } else if (command === 'off' || command === 'disable') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n👁️ Auto-Status View is already *OFF*.\n\n💡 Use .autostatus on to enable.`, ...channelInfo });
                return;
            }
            config.enabled = false;
            writeConfig(config);
            await sock.sendMessage(chatId, { text: `❌ *AUTO-VIEW DISABLED*`, ...channelInfo });
        } else if (command === 'react') {
            if (!args[1]) { await sock.sendMessage(chatId, { text: `⚠️ Usage: .autostatus react on/off`, ...channelInfo }); return; }
            const reactCmd = args[1].toLowerCase();
            const newState = (reactCmd === 'on' || reactCmd === 'enable');
            if (config.reactOn === newState) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ${newState ? 'ENABLED' : 'DISABLED'}*\n\n━━━━━━━━━━━━━━━━━━━━\n💚 Reactions are already *${newState ? 'ON' : 'OFF'}*.\n\n💡 Use .autostatus react ${newState ? 'off' : 'on'} to change.`, ...channelInfo });
                return;
            }
            config.reactOn = newState;
            writeConfig(config);
            await sock.sendMessage(chatId, { text: newState ? `💫 *REACTIONS ENABLED*` : `❌ *REACTIONS DISABLED*`, ...channelInfo });
        }
    } catch (e) {}
}

module.exports = { handleStatusUpdate, handleBulkStatusUpdate, autoStatusCommand, isAutoStatusEnabled, isStatusReactionEnabled, readConfig, writeConfig };
