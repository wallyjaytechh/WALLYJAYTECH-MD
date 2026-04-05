/** 
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autoread Command - Automatically read all messages
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autoread.json');

// Channel info for professional branding
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

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify({ 
            enabled: false,
            mode: 'all'
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autoread feature
async function autoreadCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...channelInfo
            });
            return;
        }

        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        
        const config = initConfig();
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            
            const settingText = `📖 *AUTO-READ SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autoread on/off - Enable/disable\n` +
                      `└ .autoread mode all - Read all messages\n` +
                      `└ .autoread mode dms - DMs only\n` +
                      `└ .autoread mode groups - Groups only\n` +
                      `└ .autoread status - Show current settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .autoread mode groups\n` +
                      `└ .autoread on`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            const responseText = `✅ *AUTO-READ ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Bot will now automatically read messages in ${getModeDescription(config.mode)}.`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-READ DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer automatically read messages.',
                ...channelInfo
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID OPTION*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available modes:*\n└ all - Read all messages\n└ dms - DMs only\n└ groups - Groups only\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autoread mode groups`,
                    ...channelInfo
                });
                return;
            }
            
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n━━━━━━━━━━━━━━━━━━━━\n📌 ${getModeDescription(mode)}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available modes:*\n└ all - Read all messages\n└ dms - DMs only\n└ groups - Groups only`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            
            await sock.sendMessage(chatId, {
                text: `📖 *AUTO-READ STATUS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available Commands:*\n` +
                      `└ .autoread on/off\n` +
                      `└ .autoread mode all/dms/groups\n` +
                      `└ .autoread status\n` +
                      `└ .autoread (shows this menu)\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✨ *Example:*\n` +
                      `└ .autoread mode groups\n` +
                      `└ .autoread on`,
                ...channelInfo
            });
        }
        
    } catch (error) {
        console.error('Error in autoread command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            ...channelInfo
        });
    }
}

// Helper function to get mode text
function getModeText(mode) {
    switch(mode) {
        case 'all': return '🌍 All Chats';
        case 'dms': return '💬 DMs Only';
        case 'groups': return '👥 Groups Only';
        default: return '🌍 All Chats';
    }
}

// Helper function to get mode description
function getModeDescription(mode) {
    switch(mode) {
        case 'all': return 'Bot will read messages in both DMs and groups.';
        case 'dms': return 'Bot will read messages only in private messages.';
        case 'groups': return 'Bot will read messages only in group chats.';
        default: return 'Bot will read messages in both DMs and groups.';
    }
}

// Function to check if autoread should work in current chat
function shouldReadMessage(chatId) {
    try {
        const config = initConfig();
        if (!config.enabled) return false;
        
        const isGroup = chatId.endsWith('@g.us');
        
        switch(config.mode) {
            case 'all': return true;
            case 'dms': return !isGroup;
            case 'groups': return isGroup;
            default: return true;
        }
    } catch (error) {
        console.error('Error checking autoread status:', error);
        return false;
    }
}

// Function to check if autoread is enabled
function isAutoreadEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autoread status:', error);
        return false;
    }
}

// Function to check if bot is mentioned in a message
function isBotMentionedInMessage(message, botNumber) {
    if (!message.message) return false;
    
    const messageTypes = [
        'extendedTextMessage', 'imageMessage', 'videoMessage', 'stickerMessage',
        'documentMessage', 'audioMessage', 'contactMessage', 'locationMessage'
    ];
    
    for (const type of messageTypes) {
        if (message.message[type]?.contextInfo?.mentionedJid) {
            const mentionedJid = message.message[type].contextInfo.mentionedJid;
            if (mentionedJid.some(jid => jid === botNumber)) {
                return true;
            }
        }
    }
    
    const textContent = 
        message.message.conversation || 
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption || '';
    
    if (textContent) {
        const botUsername = botNumber.split('@')[0];
        if (textContent.includes(`@${botUsername}`)) {
            return true;
        }
        
        const botNames = [global.botname?.toLowerCase(), 'bot', 'wallyjaytech', 'wallyjaytech-md'];
        const words = textContent.toLowerCase().split(/\s+/);
        if (botNames.some(name => words.includes(name))) {
            return true;
        }
    }
    
    return false;
}

// Function to handle autoread functionality
async function handleAutoread(sock, message) {
    if (shouldReadMessage(message.key.remoteJid)) {
        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotMentioned = isBotMentionedInMessage(message, botNumber);
        
        if (isBotMentioned) {
            return false;
        } else {
            const key = { remoteJid: message.key.remoteJid, id: message.key.id, participant: message.key.participant };
            await sock.readMessages([key]);
            return true;
        }
    }
    return false;
}

module.exports = {
    autoreadCommand,
    isAutoreadEnabled,
    shouldReadMessage,
    isBotMentionedInMessage,
    handleAutoread
};
