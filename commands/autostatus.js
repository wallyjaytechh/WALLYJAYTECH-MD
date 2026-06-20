/**
 * WALLYJAYTECH-MD - WhatsApp Bot
 * Auto Status Viewer with Reactions
 * FIXED: Proper on/off functionality
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '../data/autostatus.json');

// Ensure config file exists
function initConfig() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false, reactOn: false }, null, 2));
    }
}

initConfig();

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
            initConfig();
        }
        const data = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(data);
        // Ensure both properties exist
        if (typeof config.enabled !== 'boolean') config.enabled = false;
        if (typeof config.reactOn !== 'boolean') config.reactOn = false;
        return config;
    } catch (e) {
        console.error('❌ Error reading config:', e.message);
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

async function isAutoStatusEnabled() { 
    return readConfig().enabled; 
}

async function isStatusReactionEnabled() { 
    return readConfig().reactOn; 
}

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
        
        // STRICT CHECK
        if (!config.enabled) {
            console.log('⏭️ Status viewing DISABLED');
            return;
        }

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            
            // Only process status broadcasts, not our own, and must have participant
            if (msg.key && 
                msg.key.remoteJid === 'status@broadcast' && 
                !msg.key.fromMe && 
                msg.key.participant) {

                console.log(`👁️ Viewing status: ${msg.key.id} from ${msg.key.participant.split('@')[0]}`);
                
                try {
                    await sock.readMessages([msg.key]);
                    console.log('✅ Viewed:', msg.key.id);

                    // Send receipt for Android view count
                    try {
                        await sock.sendReceipt({
                            key: {
                                remoteJid: 'status@broadcast',
                                id: msg.key.id,
                                participant: msg.key.participant
                            },
                            receipt: {
                                userJid: sock.user.id,
                                readTimestamp: Date.now()
                            }
                        });
                    } catch (receiptErr) {
                        // Ignore receipt errors
                    }

                    // React if enabled
                    if (config.reactOn) {
                        await reactToStatus(sock, msg.key);
                    }
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit, waiting...');
                        await new Promise(r => setTimeout(r, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        console.error('❌ View error:', err.message);
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
        
        if (!config.enabled) {
            console.log('⏭️ Bulk status viewing DISABLED');
            return;
        }

        console.log(`\n📦 Processing ${statusMessages.length} status updates...`);

        for (const msg of statusMessages) {
            // Skip if not status broadcast, is from self, or no participant
            if (!msg.key || 
                msg.key.remoteJid !== 'status@broadcast' || 
                msg.key.fromMe || 
                !msg.key.participant) {
                continue;
            }

            try {
                await sock.readMessages([msg.key]);
                console.log('✅ Viewed:', msg.key.id);

                try {
                    await sock.sendReceipt({
                        key: { 
                            remoteJid: 'status@broadcast', 
                            id: msg.key.id, 
                            participant: msg.key.participant
                        },
                        receipt: { 
                            userJid: sock.user.id, 
                            readTimestamp: Date.now() 
                        }
                    });
                } catch (e) {
                    // Ignore receipt errors
                }

                if (config.reactOn) {
                    await reactToStatus(sock, msg.key);
                }
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) { 
                    await new Promise(r => setTimeout(r, 2000)); 
                }
            }
        }
    } catch (e) {
        console.error('❌ Bulk status error:', e.message);
    }
}

async function autoStatusCommand(sock, chatId, message, args) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = message.key.fromMe || await isOwnerOrSudo(senderId, sock, chatId);
        if (!isOwner) return;

        const config = readConfig();

        if (!args || args.length === 0) {
            await sock.sendMessage(chatId, {
                text: `👁️ *AUTO-STATUS VIEWER*\n\n` +
                      `🔵 Status Viewing: ${config.enabled ? '✅ ON' : '❌ OFF'}\n` +
                      `💚 Reactions: ${config.reactOn ? '✅ ON' : '❌ OFF'}\n\n` +
                      `📖 *Commands:*\n` +
                      `.autostatus on - Enable auto-view\n` +
                      `.autostatus off - Disable everything\n` +
                      `.autostatus react on - Enable reactions\n` +
                      `.autostatus react off - Disable reactions`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const cmd = args[0].toLowerCase();
        
        if (cmd === 'on') {
            config.enabled = true;
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: '✅ *AUTO STATUS VIEWER ENABLED*\n\nBot will now automatically view all status updates.', 
                    ...channelInfo 
                }, { quoted: message });
            }
        } 
        else if (cmd === 'off') {
            config.enabled = false;
            config.reactOn = false;
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: '❌ *AUTO STATUS VIEWER DISABLED*\n\nBot will no longer view or react to statuses.', 
                    ...channelInfo 
                }, { quoted: message });
            }
        } 
        else if (cmd === 'react' && args[1]) {
            const reactState = args[1].toLowerCase();
            if (reactState === 'on') {
                config.reactOn = true;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: '💚 *STATUS REACTIONS ENABLED*\n\nBot will react with 💚 on viewed statuses.', 
                        ...channelInfo 
                    }, { quoted: message });
                }
            } else if (reactState === 'off') {
                config.reactOn = false;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: '❌ *STATUS REACTIONS DISABLED*\n\nBot will view but not react to statuses.', 
                        ...channelInfo 
                    }, { quoted: message });
                }
            }
        }
    } catch (e) {
        console.error('❌ Command error:', e.message);
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
