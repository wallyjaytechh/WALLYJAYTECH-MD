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
            return { enabled: false, reactOn: false };
        }
        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
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
    const config = readConfig();
    return config.enabled === true; 
}

async function isStatusReactionEnabled() { 
    const config = readConfig();
    return config.reactOn === true; 
}

async function reactToStatus(sock, msgKey) {
    try {
        const config = readConfig();
        // STRICT CHECK: Must be explicitly enabled
        if (config.enabled !== true || config.reactOn !== true) {
            console.log('⏭️ Skipping reaction - auto-status or reactions disabled');
            return;
        }

        const participant = msgKey.participant || msgKey.remoteJid;
        if (!participant || participant === 'status@broadcast') {
            console.log('⏭️ Skipping reaction - invalid participant');
            return;
        }

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
        // FRESH config read every time
        const config = readConfig();
        
        // STRICT check - must be explicitly true
        if (config.enabled !== true) {
            console.log('⏭️ Auto-status disabled, skipping status view');
            return;
        }

        console.log('🔄 Processing status update...');

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {

                const participant = msg.key.participant || msg.key.remoteJid;
                
                // Double-check config before each action
                const currentConfig = readConfig();
                if (currentConfig.enabled !== true) {
                    console.log('⏭️ Auto-status was disabled during processing');
                    return;
                }

                try {
                    await sock.readMessages([msg.key]);
                    console.log('✅ Viewed:', msg.key.id);

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

                    // Check config again before reacting
                    if (currentConfig.reactOn === true) {
                        await reactToStatus(sock, msg.key);
                    }
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        console.log('⚠️ Rate limit hit, waiting 2 seconds...');
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
        // FRESH config read
        const config = readConfig();
        
        // STRICT check
        if (config.enabled !== true) {
            console.log('⏭️ Auto-status disabled, skipping bulk status view');
            return;
        }

        console.log(`🔄 Processing ${statusMessages.length} status updates...`);

        for (const msg of statusMessages) {
            if (!msg.key || msg.key.remoteJid !== 'status@broadcast') continue;
            if (msg.key.fromMe === true) continue;

            // Re-check config for each message
            const currentConfig = readConfig();
            if (currentConfig.enabled !== true) {
                console.log('⏭️ Auto-status was disabled during bulk processing');
                break;
            }

            try {
                await sock.readMessages([msg.key]);
                console.log('✅ Viewed:', msg.key.id);

                try {
                    await sock.sendReceipt({
                        key: { 
                            remoteJid: 'status@broadcast', 
                            id: msg.key.id, 
                            participant: msg.key.participant || msg.key.remoteJid 
                        },
                        receipt: { 
                            userJid: sock.user.id, 
                            readTimestamp: Date.now() 
                        }
                    });
                } catch (e) {
                    console.log('⚠️ Bulk receipt error:', e.message);
                }

                if (currentConfig.reactOn === true) {
                    await reactToStatus(sock, msg.key);
                }
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) { 
                    console.log('⚠️ Rate limit, waiting...');
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
                text: `👁️ *AUTO-STATUS*\n\n🟢 View: ${config.enabled ? '✅ ON' : '❌ OFF'}\n🟢 React: ${config.reactOn ? '✅ ON' : '❌ OFF'}\n\n📖 .autostatus on/off\n📖 .autostatus react on/off`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        const cmd = args[0].toLowerCase();
        if (cmd === 'on') {
            config.enabled = true;
            writeConfig(config);
            await sock.sendMessage(chatId, { 
                text: '✅ *AUTO-VIEW ENABLED*\n\n_Status viewer is now active_', 
                ...channelInfo 
            });
        } else if (cmd === 'off') {
            config.enabled = false;
            config.reactOn = false;
            writeConfig(config);
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-VIEW DISABLED*\n\n_Status viewer is now inactive_', 
                ...channelInfo 
            });
        } else if (cmd === 'react' && args[1]) {
            if (args[1] === 'on') {
                config.reactOn = true;
            } else if (args[1] === 'off') {
                config.reactOn = false;
            }
            writeConfig(config);
            await sock.sendMessage(chatId, { 
                text: config.reactOn ? '💫 *REACTIONS ENABLED*' : '❌ *REACTIONS DISABLED*', 
                ...channelInfo 
            });
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
