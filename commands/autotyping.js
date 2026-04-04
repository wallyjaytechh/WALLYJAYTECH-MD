/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autotyping Command - Shows fake typing status
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

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
    try {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.join(__dirname, '..', 'data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify({ 
                enabled: false,
                mode: 'all',
                duration: 60
            }, null, 2));
            console.log('📁 Created new autotyping config file');
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        console.error('❌ Error initializing autotyping config:', error);
        return { enabled: false, mode: 'all', duration: 60 };
    }
}

// Toggle autotyping feature
async function autotypingCommand(sock, chatId, message) {
    try {
        console.log('⌨️ AutoTyping command triggered');
        
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                ...channelInfo
            });
            return;
        }

        const userMessage = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || '';
        
        console.log('📝 Raw message:', userMessage);
        
        let commandPart = userMessage.trim();
        if (commandPart.startsWith('.')) {
            commandPart = commandPart.substring(1);
        }
        
        const parts = commandPart.split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        console.log('🔍 Command:', commandName);
        console.log('🔍 Args:', args);
        
        const config = initConfig();
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            
            const settingText = `⌨️ *AUTO-TYPING SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.duration} seconds\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autotyping on/off - Enable/disable\n` +
                      `└ .autotyping mode all - Work everywhere\n` +
                      `└ .autotyping mode dms - DMs only\n` +
                      `└ .autotyping mode groups - Groups only\n` +
                      `└ .autotyping duration <seconds> - Set duration (5-120)\n` +
                      `└ .autotyping status - Show current settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .autotyping duration 30\n` +
                      `└ .autotyping mode groups`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        console.log('🎯 Action:', action);
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('✅ AutoTyping ENABLED');
            
            const responseText = `✅ *AUTO-TYPING ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.duration} seconds\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Bot will now show typing indicators for ${config.duration} seconds in ${getModeDescription(config.mode)}.`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('❌ AutoTyping DISABLED');
            
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-TYPING DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBot will no longer show typing indicators.',
                ...channelInfo 
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID OPTION*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available modes:*\n└ all - Work everywhere\n└ dms - DMs only\n└ groups - Groups only\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autotyping mode groups`,
                    ...channelInfo
                });
                return;
            }
            
            const mode = args[1].toLowerCase();
            console.log('📌 Setting mode to:', mode);
            
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n━━━━━━━━━━━━━━━━━━━━\n📌 ${getModeDescription(mode)}\n⏱️ Duration: ${config.duration} seconds`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available modes:*\n└ all - Work everywhere\n└ dms - DMs only\n└ groups - Groups only`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'duration') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autotyping duration <seconds>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autotyping duration 60\n\n📌 Max: 120 seconds | Min: 5 seconds`,
                    ...channelInfo
                });
                return;
            }
            
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID DURATION*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Duration must be between 5 and 120 seconds.\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autotyping duration 30`,
                    ...channelInfo
                });
                return;
            }
            
            config.duration = duration;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, {
                text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Typing duration: ${duration} seconds`,
                ...channelInfo
            });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            
            await sock.sendMessage(chatId, {
                text: `⌨️ *AUTO-TYPING STATUS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.duration} seconds\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available Commands:*\n` +
                      `└ .autotyping on/off\n` +
                      `└ .autotyping mode all/dms/groups\n` +
                      `└ .autotyping duration <seconds>\n` +
                      `└ .autotyping status\n` +
                      `└ .autotyping (shows this menu)\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✨ *Example:*\n` +
                      `└ .autotyping mode groups`,
                ...channelInfo
            });
        }
        
    } catch (error) {
        console.error('❌ Error in autotyping command:', error);
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
        case 'all': return 'Typing indicators will show in both DMs and groups.';
        case 'dms': return 'Typing indicators will show only in private messages.';
        case 'groups': return 'Typing indicators will show only in group chats.';
        default: return 'Typing indicators will show in both DMs and groups.';
    }
}

// Function to check if autotyping should work in current chat
function shouldShowTyping(chatId) {
    try {
        const config = initConfig();
        if (!config.enabled) {
            return false;
        }
        
        const isGroup = chatId.endsWith('@g.us');
        let result = false;
        
        switch(config.mode) {
            case 'all':
                result = true;
                break;
            case 'dms':
                result = !isGroup;
                break;
            case 'groups':
                result = isGroup;
                break;
            default:
                result = true;
        }
        
        return result;
    } catch (error) {
        console.error('Error checking autotyping status:', error);
        return false;
    }
}

// Function to check if autotyping is enabled
function isAutotypingEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autotyping status:', error);
        return false;
    }
}

// Function to handle autotyping for regular messages
async function handleAutotypingForMessage(sock, chatId, userMessage) {
    if (!shouldShowTyping(chatId)) return false;
    
    try {
        const config = initConfig();
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`⌨️ Showing typing in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        await sock.sendPresenceUpdate('composing', chatId);
        console.log(`⌨️ Typing indicator started (will last ${duration} seconds)`);
        
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('composing', chatId);
            console.log(`⌨️ Typing indicator refreshed (${Math.min((i+1)*10, duration)}/${duration} seconds)`);
        }
        
        await sock.sendPresenceUpdate('paused', chatId);
        console.log(`⌨️ Typing finished after ${duration} seconds`);
        
        return true;
    } catch (error) {
        console.error('❌ Error in handleAutotypingForMessage:', error.message);
        return false;
    }
}

// Function to handle autotyping for commands
async function handleAutotypingForCommand(sock, chatId) {
    if (!shouldShowTyping(chatId)) return false;
    
    try {
        const config = initConfig();
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`⌨️ Showing command typing in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        await sock.sendPresenceUpdate('composing', chatId);
        console.log(`⌨️ Command typing started (will last ${duration} seconds)`);
        
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('composing', chatId);
            console.log(`⌨️ Command typing refreshed (${Math.min((i+1)*10, duration)}/${duration} seconds)`);
        }
        
        await sock.sendPresenceUpdate('paused', chatId);
        console.log(`⌨️ Command typing finished after ${duration} seconds`);
        
        return true;
    } catch (error) {
        console.error('❌ Error in handleAutotypingForCommand:', error.message);
        return false;
    }
}

// Function to show typing status AFTER command execution
async function showTypingAfterCommand(sock, chatId) {
    if (!shouldShowTyping(chatId)) return false;
    
    try {
        const config = initConfig();
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`⌨️ Showing post-command typing in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('composing', chatId);
        console.log(`⌨️ Post-command typing started (will last ${duration} seconds)`);
        
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('composing', chatId);
            console.log(`⌨️ Post-command typing refreshed (${Math.min((i+1)*10, duration)}/${duration} seconds)`);
        }
        
        await sock.sendPresenceUpdate('paused', chatId);
        console.log(`⌨️ Post-command typing finished after ${duration} seconds`);
        
        return true;
    } catch (error) {
        console.error('❌ Error in showTypingAfterCommand:', error.message);
        return false;
    }
}

// Delay helper function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    shouldShowTyping,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};
