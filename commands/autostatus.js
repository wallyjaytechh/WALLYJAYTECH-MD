/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * FIXED: Proper file paths + Android view count + iPhone reaction
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autostatus.json');

// Ensure config file exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(configPath)) {
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

function readConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            const dir = path.dirname(configPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false, reactOn: false }, null, 2));
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        return { enabled: false, reactOn: false };
    }
}

function writeConfig(config) {
    try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (e) {
        console.error('❌ Failed to write config:', e.message);
        return false;
    }
}

async function isAutoStatusEnabled() { return readConfig().enabled; }
async function isStatusReactionEnabled() { return readConfig().reactOn; }

async function reactToStatus(sock, msgKey) {
    try {
        const config = readConfig();
        if (!config.enabled || !config.reactOn) return;

        const participant = msgKey.participant || msgKey.remoteJid;
        if (!participant || participant === 'status@broadcast') return;

        const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

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
            statusJidList: [participant, myJid]
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

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {

                const participant = msg.key.participant || msg.key.remoteJid;

                try {
                    await sock.readMessages([msg.key]);

                    // Send receipt for Android view count
                    try {
                        await sock.sendReceipt({
                            key: {
                                remoteJid: 'status@broadcast',
                                id: msg.key.id,
                                participant: participant
                            },
                            receipt: {
                                userJid: sock.user.id,
                                readTimestamp: Date.now()
                            }
                        });
                    } catch (receiptErr) {
                        console.log('⚠️ Receipt error:', receiptErr.message);
                    }

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
    } catch (e) {
        console.error('❌ Status error:', e.message);
    }
}

async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        const config = readConfig();
        if (!config.enabled) return;
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (msg.key.fromMe === true) continue;
            try {
                await sock.readMessages([msg.key]);
                try {
                    await sock.sendReceipt({
                        key: { remoteJid: 'status@broadcast', id: msg.key.id, participant: msg.key.participant || msg.key.remoteJid },
                        receipt: { userJid: sock.user.id, readTimestamp: Date.now() }
                    });
                } catch (e) {}
                await reactToStatus(sock, msg.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) { await new Promise(r => setTimeout(r, 2000)); }
            }
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
                text: `👁️ *AUTO-STATUS*\n\n🟢 View: ${config.enabled ? '✅ ON' : '❌ OFF'}\n🟢 React: ${config.reactOn ? '✅ ON' : '❌ OFF'}\n\n📖 .autostatus on/off\n📖 .autostatus react on/off`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const cmd = args[0].toLowerCase();
        if (cmd === 'on') {
            config.enabled = true;
            writeConfig(config);
            await sock.sendMessage(chatId, { text: '✅ *AUTO-VIEW ENABLED*', ...channelInfo });
        } else if (cmd === 'off') {
            config.enabled = false;
            config.reactOn = false;
            writeConfig(config);
            await sock.sendMessage(chatId, { text: '❌ *AUTO-VIEW DISABLED*', ...channelInfo });
        } else if (cmd === 'react' && args[1]) {
            config.reactOn = (args[1] === 'on');
            writeConfig(config);
            await sock.sendMessage(chatId, { text: config.reactOn ? '💫 *REACTIONS ENABLED*' : '❌ *REACTIONS DISABLED*', ...channelInfo });
        }
    } catch (e) {}
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    readConfig,
    writeConfig
};
