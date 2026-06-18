/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * Uses relayMessage for proper status reaction delivery
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autostatus.json');

// Ensure config file exists
if (!fs.existsSync(configPath)) {
    if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false, 
        reactOn: false 
    }, null, 2));
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
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
        return { enabled: false, reactOn: false };
    }
}

function writeConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (e) {}
}

async function isAutoStatusEnabled() {
    return readConfig().enabled;
}

async function isStatusReactionEnabled() {
    return readConfig().reactOn;
}

// THE KEY FIX: Use relayMessage for status reactions
async function reactToStatus(sock, statusKey) {
    try {
        const config = readConfig();
        if (!config.reactOn) return;

        const participant = statusKey.participant || statusKey.remoteJid;

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: participant,
                        fromMe: false
                    },
                    text: '💚'
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [participant, sock.user.id]
            }
        );
        
        console.log(`✅ Reacted to status: ${statusKey.id}`);
    } catch (error) {
        console.error('❌ Reaction error:', error.message);
    }
}

async function handleStatusUpdate(sock, status) {
    try {
        const config = readConfig();
        if (!config.enabled) return;
        
        await new Promise(r => setTimeout(r, 1000));

        // Handle messages array
        if (status.messages && status.messages.length > 0) {
            for (const msg of status.messages) {
                if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
                if (msg.key.fromMe === true) continue;
                
                try {
                    await sock.readMessages([msg.key]);
                    console.log(`✅ Viewed: ${msg.key.id}`);
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        await new Promise(r => setTimeout(r, 3000));
                        await sock.readMessages([msg.key]);
                    }
                }
            }
            return;
        }

        // Handle single key
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            if (status.key.fromMe === true) return;
            
            try {
                await sock.readMessages([status.key]);
                console.log(`✅ Viewed: ${status.key.id}`);
                await reactToStatus(sock, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(r => setTimeout(r, 3000));
                    await sock.readMessages([status.key]);
                }
            }
        }
    } catch (error) {
        console.error('❌ Status error:', error.message);
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
        
        if (!isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...channelInfo
            });
            return;
        }
        
        let config = readConfig();
        
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
            writeConfig(config);
            await sock.sendMessage(chatId, { text: '✅ *AUTO-VIEW ENABLED*', ...channelInfo });
        } else if (command === 'off' || command === 'disable') {
            config.enabled = false;
            writeConfig(config);
            await sock.sendMessage(chatId, { text: '❌ *AUTO-VIEW DISABLED*', ...channelInfo });
        } else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { text: '⚠️ Usage: .autostatus react on/off', ...channelInfo });
                return;
            }
            config.reactOn = (args[1].toLowerCase() === 'on' || args[1].toLowerCase() === 'enable');
            writeConfig(config);
            await sock.sendMessage(chatId, {
                text: config.reactOn ? '💫 *REACTIONS ENABLED*' : '❌ *REACTIONS DISABLED*',
                ...channelInfo
            });
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
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
