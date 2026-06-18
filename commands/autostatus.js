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

async function readConfig() {
    try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch (e) { return { enabled: false, reactOn: false }; }
}
async function writeConfig(config) {
    try { fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); } catch (e) {}
}
async function isAutoStatusEnabled() { const c = await readConfig(); return c.enabled; }
async function isStatusReactionEnabled() { const c = await readConfig(); return c.reactOn; }

async function reactToStatus(sock, statusKey) {
    try {
        const enabled = await isStatusReactionEnabled();
        if (!enabled) return;

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );
        console.log('✅ Reacted to status:', statusKey.id);
    } catch (error) {
        console.error('❌ Reaction error:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const enabled = await isAutoStatusEnabled();
        if (!enabled) return;
        
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
    } catch (e) {
        console.error('❌ Status error:', e.message);
    }
}

async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        const enabled = await isAutoStatusEnabled();
        if (!enabled) return;
        
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (msg.key.fromMe === true) continue;
            
            try {
                await sock.readMessages([msg.key]);
                await reactToStatus(sock, msg.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }
    } catch (e) {}
}

async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) return;
        
        const config = await readConfig();
        
        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `🔄 *Auto Status Settings*\n\n` +
                    `📱 *Auto View:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                    `💫 *Reactions:* ${config.reactOn ? '✅ Enabled' : '❌ Disabled'}\n\n` +
                    `*Commands:*\n` +
                    `• .autostatus on - Enable auto view\n` +
                    `• .autostatus off - Disable auto view\n` +
                    `• .autostatus react on - Enable reaction\n` +
                    `• .autostatus react off - Disable reaction`,
                ...channelInfo
            }, { quoted: message });
            return;
        }
        
        const cmd = args[0].toLowerCase();
        if (cmd === 'on') {
            config.enabled = true;
            await writeConfig(config);
            await sock.sendMessage(chatId, { text: '✅ *Auto view enabled!*', ...channelInfo });
        } else if (cmd === 'off') {
            config.enabled = false;
            await writeConfig(config);
            await sock.sendMessage(chatId, { text: '❌ *Auto view disabled!*', ...channelInfo });
        } else if (cmd === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { text: '❌ Usage: .autostatus react on/off', ...channelInfo });
                return;
            }
            config.reactOn = (args[1].toLowerCase() === 'on');
            await writeConfig(config);
            await sock.sendMessage(chatId, { text: config.reactOn ? '💫 *Reactions enabled!*' : '❌ *Reactions disabled!*', ...channelInfo });
        }
    } catch (e) {}
}

module.exports = {
    handleStatusUpdate,
    handleBulkStatusUpdate,
    autoStatusCommand,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    reactToStatus,
    readConfig,
    writeConfig
};
