const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');
const settings = require('../settings');

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

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Default settings from settings.js
const DEFAULT_CONFIG = {
    enabled: settings.AUTO_STATUS_SEEN || false,
    reactEnabled: settings.AUTO_STATUS_REACT || false,
    replyEnabled: settings.AUTO_STATUS_REPLY || false,
    saveEnabled: settings.Status_Saver || false,
    reactEmojis: settings.CUSTOM_REACT_EMOJIS || ['💚', '❤️', '🔥', '💯', '😍', '👏'],
    replyMsg: settings.AUTO_STATUS_MSG || '✅ Status viewed by WALLYJAYTECH-MD'
};

// Initialize config file
if (!fs.existsSync(configPath)) {
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

// Load config
function loadConfig() {
    try {
        return JSON.parse(fs.readFileSync(configPath));
    } catch {
        return DEFAULT_CONFIG;
    }
}

// Save config
function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

// Main command handler
async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ Only owner can use this!',
                ...channelInfo
            });
            return;
        }

        const config = loadConfig();
        const command = args[0]?.toLowerCase();

        // Show status if no command
        if (!command) {
            const statusText = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃  STATUS SETTINGS   ┃
┗━━━━━━━━━━━━━━━━━━━━┛

┏─『 CURRENT STATUS 』──⊷
│ Auto View: ${config.enabled ? '✅ ON' : '❌ OFF'}
│ Auto React: ${config.reactEnabled ? '✅ ON' : '❌ OFF'}
│ Auto Reply: ${config.replyEnabled ? '✅ ON' : '❌ OFF'}
│ Status Saver: ${config.saveEnabled ? '✅ ON' : '❌ OFF'}
┗──────────────⊷

┏─『 REPLY MESSAGE 』──⊷
│ ${config.replyMsg}
┗──────────────⊷

┏─『 REACT EMOJIS 』──⊷
│ ${config.reactEmojis.join(', ')}
┗──────────────⊷

*Commands:*
• .autostatus on/off - Toggle auto view
• .autostatus react on/off - Toggle reactions
• .autostatus reply on/off - Toggle replies
• .autostatus save on/off - Toggle saving
• .autostatus setmsg <text> - Set reply message
• .autostatus setemoji <emoji1,emoji2> - Set reaction emojis
`;

            await sock.sendMessage(chatId, { text: statusText, ...channelInfo });
            return;
        }

        // Handle commands
        if (command === 'on') {
            config.enabled = true;
            saveConfig(config);
            await sock.sendMessage(chatId, { text: '✅ Auto status view enabled', ...channelInfo });
        }
        else if (command === 'off') {
            config.enabled = false;
            saveConfig(config);
            await sock.sendMessage(chatId, { text: '❌ Auto status view disabled', ...channelInfo });
        }
        else if (command === 'react') {
            const subCmd = args[1]?.toLowerCase();
            if (subCmd === 'on') {
                config.reactEnabled = true;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '✅ Auto reactions enabled', ...channelInfo });
            } else if (subCmd === 'off') {
                config.reactEnabled = false;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '❌ Auto reactions disabled', ...channelInfo });
            }
        }
        else if (command === 'reply') {
            const subCmd = args[1]?.toLowerCase();
            if (subCmd === 'on') {
                config.replyEnabled = true;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '✅ Auto replies enabled', ...channelInfo });
            } else if (subCmd === 'off') {
                config.replyEnabled = false;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '❌ Auto replies disabled', ...channelInfo });
            }
        }
        else if (command === 'save') {
            const subCmd = args[1]?.toLowerCase();
            if (subCmd === 'on') {
                config.saveEnabled = true;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '✅ Status saver enabled', ...channelInfo });
            } else if (subCmd === 'off') {
                config.saveEnabled = false;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: '❌ Status saver disabled', ...channelInfo });
            }
        }
        else if (command === 'setmsg') {
            const newMsg = args.slice(1).join(' ');
            if (newMsg) {
                config.replyMsg = newMsg;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: `✅ Reply message set to: ${newMsg}`, ...channelInfo });
            }
        }
        else if (command === 'setemoji') {
            const emojiStr = args.slice(1).join(' ');
            const emojis = emojiStr.split(',').map(e => e.trim());
            if (emojis.length > 0) {
                config.reactEmojis = emojis;
                saveConfig(config);
                await sock.sendMessage(chatId, { text: `✅ Reaction emojis set to: ${emojis.join(', ')}`, ...channelInfo });
            }
        }
    } catch (error) {
        console.error('AutoStatus command error:', error);
        await sock.sendMessage(chatId, { text: '❌ Error occurred!', ...channelInfo });
    }
}

// STATUS HANDLER - This runs on every status update (called from index.js)
async function handleStatusUpdate(sock, message) {
    try {
        const config = loadConfig();
        
        // Check if it's a status update
        const isStatus = message.key?.remoteJid === 'status@broadcast';
        if (!isStatus) return;

        const sender = message.key.participant || message.key.remoteJid;
        const statusType = message.message?.imageMessage ? 'image' :
                         message.message?.videoMessage ? 'video' :
                         message.message?.extendedTextMessage ? 'text' : 'media';

        // 1. AUTO VIEW STATUS
        if (config.enabled) {
            await sock.readMessages([message.key]);
            console.log(`✅ Auto-viewed status from: ${sender.split('@')[0]}`);
        }

        // 2. AUTO REACT TO STATUS
        if (config.reactEnabled) {
            const emojis = config.reactEmojis || ['💚', '❤️', '🔥', '💯', '😍', '👏'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            
            await sock.sendMessage('status@broadcast', {
                react: {
                    text: randomEmoji,
                    key: message.key
                }
            });
            console.log(`${randomEmoji} Reacted to status from: ${sender.split('@')[0]}`);
        }

        // 3. AUTO REPLY TO STATUS
        if (config.replyEnabled) {
            setTimeout(async () => {
                await sock.sendMessage('status@broadcast', {
                    text: config.replyMsg
                }, { quoted: message }).catch(() => {});
            }, 2000);
            console.log(`💬 Will reply to status from: ${sender.split('@')[0]}`);
        }

        // 4. SAVE STATUS MEDIA
        if (config.saveEnabled) {
            if (message.message?.imageMessage || message.message?.videoMessage) {
                try {
                    const buffer = await sock.downloadMediaMessage(message);
                    const fileName = `status_${Date.now()}.${statusType === 'image' ? 'jpg' : 'mp4'}`;
                    
                    // Save to ./status folder
                    const statusDir = path.join(__dirname, '../status');
                    if (!fs.existsSync(statusDir)) fs.mkdirSync(statusDir);
                    
                    fs.writeFileSync(path.join(statusDir, fileName), buffer);
                    console.log(`💾 Saved status: ${fileName}`);

                    // Forward to owner if number exists
                    if (settings.ownerNumber) {
                        await sock.sendMessage(settings.ownerNumber + '@s.whatsapp.net', {
                            [statusType]: buffer,
                            caption: `📥 Status from: ${sender.split('@')[0]}`
                        }).catch(() => {});
                    }
                } catch (err) {
                    console.error('Error saving status:', err.message);
                }
            }
        }

    } catch (error) {
        console.error('Status handler error:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};
