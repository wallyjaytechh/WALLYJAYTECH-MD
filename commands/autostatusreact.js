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

// Available emojis for status reactions
const AVAILABLE_EMOJIS = [
    '❤️', '😂', '😍', '😊', '👍', '👏', '🔥', '🎉', '💯', '😎',
    '🤔', '😢', '😡', '👀', '✨', '💫', '🌟', '🙌', '🎯', '💥'
];

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false,
        randomEmoji: true,
        specificEmoji: '❤️'
    }));
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
            const emojiMode = config.randomEmoji ? '🎲 Random' : `🎯 Specific (${config.specificEmoji})`;
            
            await sock.sendMessage(chatId, { 
                text: `💫 *WALLYJAYTECH-MD Status Reactions*\n\n*Status Reactions:* ${status}\n*Emoji Mode:* ${emojiMode}\n\n*Commands:*\n• .autostatusreact on/off - Enable/disable reactions\n• .autostatusreact random - Random emoji mode\n• .autostatusreact specific <emoji> - Set specific emoji`,
                ...channelInfo
            });
            return;
        }

        // Handle commands
        const command = args[0].toLowerCase();
        
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '💫 *Status reactions enabled!*\n\nBot will now react to status updates.',
                ...channelInfo
            });
        } 
        else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ *Status reactions disabled!*\n\nBot will no longer react to status updates.',
                ...channelInfo
            });
        }
        else if (command === 'random') {
            config.randomEmoji = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: `🎲 *Random emoji mode enabled!*\n\nBot will react with random emojis.`,
                ...channelInfo
            });
        }
        else if (command === 'specific') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please provide an emoji!\n\nExample: .autostatusreact specific ❤️',
                    ...channelInfo
                });
                return;
            }
            
            const emoji = args[1];
            if (!AVAILABLE_EMOJIS.includes(emoji)) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Invalid emoji! Available emojis: ${AVAILABLE_EMOJIS.join(' ')}`,
                    ...channelInfo
                });
                return;
            }
            
            config.randomEmoji = false;
            config.specificEmoji = emoji;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: `🎯 *Specific emoji set to:* ${emoji}\n\nBot will now react with this emoji to status updates.`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, { 
                text: `❌ *Invalid command!*\n\n*Available Commands:*\n• .autostatusreact on/off - Enable/disable reactions\n• .autostatusreact random - Random emoji mode\n• .autostatusreact specific <emoji> - Set specific emoji`,
                ...channelInfo
            });
        }

    } catch (error) {
        console.error('Error in autostatusreact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing status reactions!\n' + error.message,
            ...channelInfo
        });
    }
}

// Function to check if status reactions are enabled
function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

// Get reaction emoji based on settings
function getStatusReactionEmoji() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.randomEmoji) {
            // Return random emoji from available list
            return AVAILABLE_EMOJIS[Math.floor(Math.random() * AVAILABLE_EMOJIS.length)];
        } else {
            // Return specific emoji
            return config.specificEmoji || '❤️';
        }
    } catch (error) {
        console.error('Error getting status reaction emoji:', error);
        return '❤️';
    }
}

// Function to react to status
async function handleStatusReaction(sock, status) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        let statusKey = null;

        // Handle status from messages.upsert
        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                statusKey = msg.key;
            }
        }
        // Handle direct status updates
        else if (status.key && status.key.remoteJid === 'status@broadcast') {
            statusKey = status.key;
        }

        // If we have a valid status key
        if (statusKey) {
            // Wait for status to be viewed first
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const reactionEmoji = getStatusReactionEmoji();
            
            console.log(`💫 Attempting to react to status with ${reactionEmoji}`);
            
            // Simple reaction method
            try {
                const statusJid = 'status@broadcast';
                
                // Simple reaction message
                await sock.sendMessage(statusJid, {
                    react: {
                        text: reactionEmoji,
                        key: statusKey
                    }
                });
                
                console.log(`✅ Reacted to status with ${reactionEmoji}`);
            } catch (error) {
                console.error('❌ Failed to react to status:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error in status reaction:', error.message);
    }
}

module.exports = {
    autoStatusReactCommand,
    handleStatusReaction
};
