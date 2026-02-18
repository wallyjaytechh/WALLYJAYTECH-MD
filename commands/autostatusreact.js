const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

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

// Path to store auto status reaction configuration
const configPath = path.join(__dirname, '../data/autoStatusReact.json');

// WhatsApp default status reaction emoji (the green love that appears automatically)
const DEFAULT_WHATSAPP_REACTION = '💚';

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    const dataDir = path.dirname(configPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false,
        mode: 'default' // default, random, specific
    }, null, 2));
}

async function autoStatusReactCommand(sock, chatId, msg, args) {
    try {
        const senderId = msg.key.participant || msg.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!msg.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used by the owner!',
                ...channelInfo
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            let modeText = '';
            
            switch(config.mode) {
                case 'default':
                    modeText = `💚 Default (${DEFAULT_WHATSAPP_REACTION})`;
                    break;
                case 'random':
                    modeText = '🎲 Random';
                    break;
                case 'specific':
                    modeText = `🎯 Specific (${config.specificEmoji || '❤️'})`;
                    break;
                default:
                    modeText = `💚 Default (${DEFAULT_WHATSAPP_REACTION})`;
            }
            
            await sock.sendMessage(chatId, { 
                text: `💚 *WALLYJAYTECH-MD Auto Status Reactions*\n\n📱 *Status Reactions:* ${status}\n🎭 *Mode:* ${modeText}\n\n*Commands:*\n• .autoreact on - Enable reactions\n• .autoreact off - Disable reactions\n• .autoreact default - Use WhatsApp default (💚)\n• .autoreact random - Use random emoji\n• .autoreact specific <emoji> - Use your emoji\n• .autoreact status - Show current settings`,
                ...channelInfo
            });
            return;
        }

        // Handle commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto status reactions enabled!*\n\nBot will now react to status updates.',
                ...channelInfo
            });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto status reactions disabled!*\n\nBot will no longer react to status updates.',
                ...channelInfo
            });
        }
        else if (command === 'default') {
            config.mode = 'default';
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: `💚 *Default reaction mode enabled!*\n\nBot will react with WhatsApp default: ${DEFAULT_WHATSAPP_REACTION}`,
                ...channelInfo
            });
        }
        else if (command === 'random') {
            config.mode = 'random';
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: '🎲 *Random reaction mode enabled!*\n\nBot will react with random emojis.',
                ...channelInfo
            });
        }
        else if (command === 'specific') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please provide an emoji!\n\nExample: .autoreact specific ❤️',
                    ...channelInfo
                });
                return;
            }
            
            const emoji = args[1];
            config.mode = 'specific';
            config.specificEmoji = emoji;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: `🎯 *Specific reaction set to:* ${emoji}`,
                ...channelInfo
            });
        }
        else if (command === 'status') {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            let modeText = '';
            
            switch(config.mode) {
                case 'default':
                    modeText = `💚 Default (${DEFAULT_WHATSAPP_REACTION})`;
                    break;
                case 'random':
                    modeText = '🎲 Random';
                    break;
                case 'specific':
                    modeText = `🎯 Specific (${config.specificEmoji || '❤️'})`;
                    break;
                default:
                    modeText = `💚 Default (${DEFAULT_WHATSAPP_REACTION})`;
            }
            
            await sock.sendMessage(chatId, { 
                text: `💚 *Auto Status Reactions Status*\n\n📱 *Status:* ${status}\n🎭 *Mode:* ${modeText}`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, { 
                text: `❌ *Invalid command!*\n\n*Available Commands:*\n• .autoreact on/off\n• .autoreact default - WhatsApp default (💚)\n• .autoreact random\n• .autoreact specific <emoji>\n• .autoreact status`,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in autoreact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred!\n' + error.message,
            ...channelInfo
        });
    }
}

// Function to check if auto reactions are enabled
function isAutoReactEnabled() {
    try {
        if (!fs.existsSync(configPath)) return false;
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch {
        return false;
    }
}

// Get reaction emoji based on settings
function getReactionEmoji() {
    try {
        if (!fs.existsSync(configPath)) return DEFAULT_WHATSAPP_REACTION;
        const config = JSON.parse(fs.readFileSync(configPath));
        
        switch(config.mode) {
            case 'default':
                return DEFAULT_WHATSAPP_REACTION;
            case 'random':
                // Simple random emojis (just a few common ones)
                const simpleEmojis = ['❤️', '🔥', '😍', '🎉', '👍', '✨', '💯', '🙌'];
                return simpleEmojis[Math.floor(Math.random() * simpleEmojis.length)];
            case 'specific':
                return config.specificEmoji || '❤️';
            default:
                return DEFAULT_WHATSAPP_REACTION;
        }
    } catch {
        return DEFAULT_WHATSAPP_REACTION;
    }
}

// Function to react to status
async function reactToStatus(sock, statusKey) {
    try {
        if (!isAutoReactEnabled()) return;

        const reactionEmoji = getReactionEmoji();

        // Send the reaction
        await sock.sendMessage('status@broadcast', {
            react: {
                key: statusKey,
                text: reactionEmoji
            }
        });
        
        console.log(`💬 Reacted to status with ${reactionEmoji}`);
        return true;
    } catch (error) {
        console.error('❌ Error reacting to status:', error.message);
        return false;
    }
}

module.exports = {
    autoStatusReactCommand,
    reactToStatus,
    isAutoReactEnabled,
    getReactionEmoji
};
