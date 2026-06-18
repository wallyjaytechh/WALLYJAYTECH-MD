/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Auto Status Viewer with Reactions
 * DEBUG VERSION - Shows full key structure
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

// DEBUG VERSION - Shows full key details
async function handleStatusUpdate(sock, status) {
    try {
        const config = readConfig();
        if (!config.enabled) return;
        
        await new Promise(r => setTimeout(r, 1000));

        if (status.messages && status.messages.length > 0) {
            for (const msg of status.messages) {
                if (!msg.key) continue;
                if (msg.key.remoteJid !== 'status@broadcast') continue;
                if (msg.key.fromMe === true) continue;
                
                // ============ DEBUG ============
                console.log(`\n🔍 ====== NEW STATUS ======`);
                console.log(`🔍 FULL KEY:`, JSON.stringify(msg.key, null, 2));
                console.log(`🔍 participant = ${msg.key.participant}`);
                console.log(`🔍 remoteJid = ${msg.key.remoteJid}`);
                console.log(`🔍 id = ${msg.key.id}`);
                console.log(`🔍 fromMe = ${msg.key.fromMe}`);
                // ============ END DEBUG ============
                
                try {
                    await sock.readMessages([msg.key]);
                    console.log(`✅ Viewed: ${msg.key.id}`);
                    
                    const config2 = readConfig();
                    if (config2.reactOn) {
                        const participant = msg.key.participant;
                        
                        console.log(`💚 Trying reaction -> participant: ${participant}`);
                        console.log(`💚 Trying reaction -> status id: ${msg.key.id}`);
                        
                        await sock.sendMessage(participant, {
                            react: {
                                text: '💚',
                                key: {
                                    remoteJid: 'status@broadcast',
                                    fromMe: false,
                                    id: msg.key.id,
                                    participant: participant
                                }
                            }
                        });
                        
                        console.log(`✅ Reaction sent`);
                    }
                } catch (err) {
                    console.log(`⚠️ Error: ${err.message}`);
                    
                    // Try fallback: send to status@broadcast
                    if (config.reactOn) {
                        try {
                            console.log(`💚 Fallback: sending to status@broadcast`);
                            await sock.sendMessage('status@broadcast', {
                                react: {
                                    text: '💚',
                                    key: {
                                        remoteJid: 'status@broadcast',
                                        fromMe: false,
                                        id: msg.key.id,
                                        participant: msg.key.participant
                                    }
                                }
                            }, {
                                statusJidList: [msg.key.participant]
                            });
                            console.log(`✅ Fallback sent`);
                        } catch (e2) {
                            console.log(`⚠️ Fallback also failed: ${e2.message}`);
                        }
                    }
                }
            }
        }

        // Single key format
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            if (status.key.fromMe === true) return;
            
            console.log(`\n🔍 ====== SINGLE KEY STATUS ======`);
            console.log(`🔍 FULL KEY:`, JSON.stringify(status.key, null, 2));
            console.log(`🔍 participant = ${status.key.participant}`);
            
            try {
                await sock.readMessages([status.key]);
                console.log(`✅ Viewed`);
                
                const config2 = readConfig();
                if (config2.reactOn) {
                    const participant = status.key.participant;
                    
                    await sock.sendMessage(participant, {
                        react: {
                            text: '💚',
                            key: {
                                remoteJid: 'status@broadcast',
                                fromMe: false,
                                id: status.key.id,
                                participant: participant
                            }
                        }
                    });
                    console.log(`✅ Reaction sent`);
                }
            } catch (err) {
                console.log(`⚠️ Error: ${err.message}`);
            }
        }
    } catch (e) {
        console.log('⚠️ Status error:', e.message);
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
                
                if (config.reactOn) {
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
                }
            } catch (err) {}
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
                      `└ .autostatus react on/off\n\n` +
                      `🔍 *DEBUG MODE ACTIVE*`,
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
