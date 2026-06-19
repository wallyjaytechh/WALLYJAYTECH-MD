/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * DEBUG: Shows full msgKey to find Alt JID fields
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

// DEBUG VERSION - Shows full msgKey
async function reactToStatus(sock, msgKey) {
    try {
        const config = readConfig();
        if (!config.reactOn) return;

        const publisher = msgKey.participant || msgKey.remoteJid;
        if (!publisher || publisher === 'status@broadcast') return;

        // DEBUG: Show full key including Alt JIDs
        console.log('📦 Full msgKey:', JSON.stringify(msgKey, null, 2));
        console.log('📦 participant:', msgKey.participant);
        console.log('📦 participantAlt:', msgKey.participantAlt);
        console.log('📦 remoteJid:', msgKey.remoteJid);
        console.log('📦 remoteJidAlt:', msgKey.remoteJidAlt);

        // Try using Alt JID if available (real phone number)
        const targetJid = msgKey.participantAlt || msgKey.remoteJidAlt || publisher;
        console.log(`💚 Reacting | target: ${targetJid} | id: ${msgKey.id}`);

        await sock.sendMessage(targetJid, {
            react: {
                text: '💚',
                key: {
                    remoteJid: 'status@broadcast',
                    fromMe: false,
                    id: msgKey.id,
                    participant: publisher
                }
            }
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
                text: `👁️ *AUTO-STATUS*\n\n🟢 View: ${config.enabled ? '✅ ON' : '❌ OFF'}\n🟢 React: ${config.reactOn ? '✅ ON' : '❌ OFF'}\n\n📖 .autostatus on/off\n📖 .autostatus react on/off\n\n🔍 DEBUG MODE`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const command = args[0].toLowerCase();
        if (command === 'on') { config.enabled = true; writeConfig(config); await sock.sendMessage(chatId, { text: '✅ ON', ...channelInfo }); }
        else if (command === 'off') { config.enabled = false; writeConfig(config); await sock.sendMessage(chatId, { text: '❌ OFF', ...channelInfo }); }
        else if (command === 'react' && args[1]) {
            config.reactOn = (args[1] === 'on');
            writeConfig(config);
            await sock.sendMessage(chatId, { text: config.reactOn ? '💫 REACT ON' : '❌ REACT OFF', ...channelInfo });
        }
    } catch (e) {}
}

module.exports = { handleStatusUpdate, handleBulkStatusUpdate, autoStatusCommand, isAutoStatusEnabled, isStatusReactionEnabled, readConfig, writeConfig };
