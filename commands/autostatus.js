/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * DEBUG V3 - Added bulk handler debug
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autostatus.json');

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

async function handleStatusUpdate(sock, status) {
    try {
        const config = readConfig();
        if (!config.enabled) return;
        
        console.log(`🔍 handleStatusUpdate called`);

        if (status.messages && status.messages.length > 0) {
            console.log(`🔍 Processing ${status.messages.length} messages from chatUpdate`);
            
            for (const msg of status.messages) {
                if (!msg.key) continue;
                if (msg.key.remoteJid !== 'status@broadcast') continue;
                if (msg.key.fromMe === true) continue;
                
                console.log(`🔍 STATUS MSG - participant: "${msg.key.participant}" | id: ${msg.key.id}`);
                if (msg.key.participant) {
                    const parts = msg.key.participant.split('@');
                    console.log(`🔍 DOMAIN: ${parts[1] || 'NONE'} | Is LID: ${parts[1] === 'lid' ? 'YES' : 'NO'}`);
                }
                
                try {
                    await sock.readMessages([msg.key]);
                    console.log(`✅ Viewed: ${msg.key.id}`);
                    
                    const config2 = readConfig();
                    if (config2.reactOn && msg.key.participant) {
                        await sock.sendMessage(msg.key.participant, {
                            react: {
                                text: '💚',
                                key: {
                                    remoteJid: 'status@broadcast',
                                    fromMe: false,
                                    id: msg.key.id,
                                    participant: msg.key.participant
                                }
                            }
                        });
                        console.log(`✅ Reaction sent to ${msg.key.participant}`);
                    }
                } catch (err) {
                    console.log(`⚠️ Error: ${err.message}`);
                }
            }
        } else {
            console.log(`🔍 No messages array in status object`);
        }
    } catch (e) {
        console.log('⚠️ Status error:', e.message);
    }
}

async function handleBulkStatusUpdate(sock, statusMessages) {
    try {
        console.log(`🔍 BULK STATUS CALLED with ${statusMessages ? statusMessages.length : 0} messages`);
        
        const config = readConfig();
        if (!config.enabled) return;
        
        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (msg.key.fromMe === true) continue;
            
            console.log(`🔍 BULK MSG - participant: "${msg.key.participant}" | id: ${msg.key.id}`);
            if (msg.key.participant) {
                const parts = msg.key.participant.split('@');
                console.log(`🔍 DOMAIN: ${parts[1] || 'NONE'} | Is LID: ${parts[1] === 'lid' ? 'YES' : 'NO'}`);
            }
            
            try {
                await sock.readMessages([msg.key]);
                console.log(`✅ Bulk viewed`);
                
                if (config.reactOn && msg.key.participant) {
                    await sock.sendMessage(msg.key.participant, {
                        react: {
                            text: '💚',
                            key: {
                                remoteJid: 'status@broadcast',
                                fromMe: false,
                                id: msg.key.id,
                                participant: msg.key.participant
                            }
                        }
                    });
                    console.log(`✅ Bulk reaction sent`);
                }
            } catch (err) {
                console.log(`⚠️ Bulk error: ${err.message}`);
            }
        }
    } catch (e) {
        console.log('⚠️ Bulk handler error:', e.message);
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
                      `└ .autostatus react on/off\n\n` +
                      `🔍 *DEBUG V3*`,
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
    readConfig,
    writeConfig
};
