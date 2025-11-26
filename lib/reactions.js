 const fs = require('fs');
const path = require('path');

// Expanded list of emojis for reactions
const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏', '🙏', '🤔', '👀', '✨', '✅', '⭐', '💯', '😎'];

// Path for storing auto-reaction state
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Default settings
const defaultSettings = {
    enabled: false,
    reactToCommands: true,    // React to command messages
    reactToOthers: true,      // React to other people's messages
    reactToSelf: true,        // React to bot's own messages
    reactInGroups: true,      // React in group chats
    reactInDMs: true,         // React in private DMs
    randomMode: true,         // Use random emojis
    specificEmoji: '👍',      // Used when randomMode is false
    emojiPool: reactionEmojis // Available emojis
};

// Load auto-reaction state from file
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || { ...defaultSettings };
        }
    } catch (error) {
        console.error('Error loading auto-reaction state:', error);
    }
    return { ...defaultSettings };
}

// Save auto-reaction state to file
function saveAutoReactionState(settings) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        data.autoReaction = settings;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving auto-reaction state:', error);
    }
}

// Load settings
let settings = loadAutoReactionState();

function getRandomEmoji() {
    return settings.emojiPool[Math.floor(Math.random() * settings.emojiPool.length)];
}

function getReactionEmoji() {
    return settings.randomMode ? getRandomEmoji() : settings.specificEmoji;
}

// Check if we should react to this message
function shouldReactToMessage(sock, message) {
    if (!settings.enabled) return false;

    const chatId = message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    const isBot = senderId.includes(sock.user.id.split(':')[0]);
    const isSelf = message.key.fromMe;
    const isCommand = message.message?.conversation?.startsWith('.') || 
                     message.message?.extendedTextMessage?.text?.startsWith('.');

    // Check chat type
    if (isGroup && !settings.reactInGroups) return false;
    if (!isGroup && !settings.reactInDMs) return false;

    // Check message type
    if (isCommand && !settings.reactToCommands) return false;
    if (!isCommand && !isSelf && !settings.reactToOthers) return false;
    if (isSelf && !settings.reactToSelf) return false;

    // Don't react to protocol messages (deletions, etc.)
    if (message.message?.protocolMessage) return false;

    // Don't react to empty messages
    if (!message.message?.conversation && !message.message?.extendedTextMessage?.text) return false;

    return true;
}

// Function to add reaction to ANY message
async function handleAutoreact(sock, message) {
    try {
        if (!shouldReactToMessage(sock, message)) return;
        
        const emoji = getReactionEmoji();
        
        // Add random delay to make it look natural (1-3 seconds)
        const delay = Math.floor(Math.random() * 2000) + 1000;
        
        setTimeout(async () => {
            try {
                await sock.sendMessage(message.key.remoteJid, {
                    react: {
                        text: emoji,
                        key: message.key
                    }
                });
                
                const chatType = message.key.remoteJid.endsWith('@g.us') ? 'group' : 'DM';
                console.log(`✅ Auto-reacted with ${emoji} in ${chatType}`);
            } catch (error) {
                console.error('Error adding auto-reaction:', error);
            }
        }, delay);
    } catch (error) {
        console.error('Error in handleAutoreact:', error);
    }
}

// Function to add reaction to command messages (keep for backward compatibility)
async function addCommandReaction(sock, message) {
    try {
        if (!settings.enabled || !settings.reactToCommands || !message?.key?.id) return;
        
        const emoji = getReactionEmoji();
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error adding command reaction:', error);
    }
}

// Function to handle areact command with enhanced options
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command is only available for the owner!',
                quoted: message
            });
            return;
        }

        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = userMessage.split(' ').slice(1);
        const action = args[0]?.toLowerCase();

        if (!action) {
            // Show current settings
            const status = settings.enabled ? '✅ Enabled' : '❌ Disabled';
            const mode = settings.randomMode ? '🎲 Random' : `🎯 Specific (${settings.specificEmoji})`;
            
            await sock.sendMessage(chatId, { 
                text: `🎭 *AUTO-REACT SETTINGS* 🎭\n\n` +
                      `*Status:* ${status}\n` +
                      `*Mode:* ${mode}\n` +
                      `*Emojis:* ${settings.emojiPool.join(' ')}\n\n` +
                      `*React to:*\n` +
                      `• Commands: ${settings.reactToCommands ? '✅' : '❌'}\n` +
                      `• Others: ${settings.reactToOthers ? '✅' : '❌'}\n` +
                      `• Self: ${settings.reactToSelf ? '✅' : '❌'}\n` +
                      `• Groups: ${settings.reactInGroups ? '✅' : '❌'}\n` +
                      `• DMs: ${settings.reactInDMs ? '✅' : '❌'}\n\n` +
                      `*Commands:*\n` +
                      `• .areact on/off - Enable/disable\n` +
                      `• .areact random - Random mode\n` +
                      `• .areact specific <emoji> - Set specific emoji\n` +
                      `• .areact commands on/off - Toggle command reactions\n` +
                      `• .areact others on/off - Toggle others' messages\n` +
                      `• .areact self on/off - Toggle self messages\n` +
                      `• .areact groups on/off - Toggle groups\n` +
                      `• .areact dms on/off - Toggle DMs`,
                quoted: message
            });
            return;
        }

        if (action === 'on') {
            settings.enabled = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: '✅ *Auto-reactions enabled globally!*\n\nThe bot will now react to messages automatically.',
                quoted: message
            });
        } 
        else if (action === 'off') {
            settings.enabled = false;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: '❌ *Auto-reactions disabled globally!*',
                quoted: message
            });
        }
        else if (action === 'random') {
            settings.randomMode = true;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: '🎲 *Random mode enabled!*\n\nI will react with random emojis.',
                quoted: message
            });
        }
        else if (action === 'specific') {
            const emoji = args[1];
            if (!emoji) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Please provide an emoji!\n\nExample: .areact specific 👍',
                    quoted: message
                });
                return;
            }
            settings.randomMode = false;
            settings.specificEmoji = emoji;
            saveAutoReactionState(settings);
            await sock.sendMessage(chatId, { 
                text: `🎯 *Specific reaction set to:* ${emoji}\n\nI will now react with this emoji to all messages.`,
                quoted: message
            });
        }
        // Toggle specific settings
        else if (['commands', 'others', 'self', 'groups', 'dms'].includes(action)) {
            const subAction = args[1]?.toLowerCase();
            if (subAction === 'on' || subAction === 'off') {
                const settingMap = {
                    'commands': 'reactToCommands',
                    'others': 'reactToOthers', 
                    'self': 'reactToSelf',
                    'groups': 'reactInGroups',
                    'dms': 'reactInDMs'
                };
                
                settings[settingMap[action]] = subAction === 'on';
                saveAutoReactionState(settings);
                
                await sock.sendMessage(chatId, { 
                    text: `✅ *${action} reactions ${subAction === 'on' ? 'enabled' : 'disabled'}!*`,
                    quoted: message
                });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `Usage: .areact ${action} on/off`,
                    quoted: message
                });
            }
        }
        else {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid command! Use .areact to see all options.',
                quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error controlling auto-reactions',
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand,
    handleAutoreact
};
