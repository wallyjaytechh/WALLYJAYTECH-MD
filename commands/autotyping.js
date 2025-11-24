/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autotyping Command - Shows fake typing status
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ 
            enabled: false,
            mode: 'all' // all, dms, groups
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

// Toggle autotyping feature
async function autotypingCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ This command is only available for the owner!',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        // Get command arguments
        const userMessage = message.message?.conversation?.trim() || 
                          message.message?.extendedTextMessage?.text?.trim() || '';
        const args = userMessage.split(' ').slice(1);
        
        // Initialize or read config
        const config = initConfig();
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const modeText = getModeText(config.mode);
            
            await sock.sendMessage(chatId, {
                text: `⌨️ *Auto-Typing Settings*\n\n📱 *Status:* ${status}\n🎯 *Mode:* ${modeText}\n\n*Commands:*\n• .autotyping on/off - Enable/disable\n• .autotyping mode all - Work everywhere\n• .autotyping mode dms - DMs only\n• .autotyping mode groups - Groups only\n• .autotyping status - Show current settings`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `✅ *Auto-typing enabled!*\n\nMode: ${getModeText(config.mode)}\n\nBot will now show typing indicators in ${getModeDescription(config.mode)}.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: '❌ *Auto-typing disabled!*\n\nBot will no longer show typing indicators.',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please specify a mode!\n\nAvailable modes:\n• all - Work everywhere\n• dms - DMs only\n• groups - Groups only',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
                return;
            }
            
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `🎯 *Auto-typing mode set to:* ${getModeText(mode)}\n\n${getModeDescription(mode)}`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid mode!\n\nAvailable modes:\n• all - Work everywhere\n• dms - DMs only\n• groups - Groups only',
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363420618370733@newsletter',
                            newsletterName: 'WALLYJAYTECH-MD BOTS',
                            serverMessageId: -1
                        }
                    }
                });
            }
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const modeText = getModeText(config.mode);
            
            await sock.sendMessage(chatId, {
                text: `⌨️ *Auto-Typing Status*\n\n📱 *Status:* ${status}\n🎯 *Mode:* ${modeText}\n\n${getModeDescription(config.mode)}`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: '❌ Invalid command!\n\n*Available Commands:*\n• .autotyping on/off\n• .autotyping mode all/dms/groups\n• .autotyping status\n• .autotyping (shows this menu)',
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363420618370733@newsletter',
                        newsletterName: 'WALLYJAYTECH-MD BOTS',
                        serverMessageId: -1
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error in autotyping command:', error);
        await sock.sendMessage(chatId, {
            text: '❌ Error processing command!',
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420618370733@newsletter',
                    newsletterName: 'WALLYJAYTECH-MD BOTS',
                    serverMessageId: -1
                }
            }
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
        if (!config.enabled) return false;
        
        const isGroup = chatId.endsWith('@g.us');
        
        switch(config.mode) {
            case 'all': return true;
            case 'dms': return !isGroup;
            case 'groups': return isGroup;
            default: return true;
        }
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
    if (shouldShowTyping(chatId)) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then send the composing status
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Simulate typing time based on message length with increased minimum time
            const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            
            // Send composing again to ensure it stays visible
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates typing was shown
        } catch (error) {
            console.error('❌ Error sending typing indicator:', error);
            return false; // Indicates typing failed
        }
    }
    return false; // Autotyping is disabled for this chat type
}

// Function to handle autotyping for commands - BEFORE command execution (not used anymore)
async function handleAutotypingForCommand(sock, chatId) {
    if (shouldShowTyping(chatId)) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then send the composing status
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Keep typing indicator active for commands with increased duration
            const commandTypingDelay = 3000;
            await new Promise(resolve => setTimeout(resolve, commandTypingDelay));
            
            // Send composing again to ensure it stays visible
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates typing was shown
        } catch (error) {
            console.error('❌ Error sending command typing indicator:', error);
            return false; // Indicates typing failed
        }
    }
    return false; // Autotyping is disabled for this chat type
}

// Function to show typing status AFTER command execution
async function showTypingAfterCommand(sock, chatId) {
    if (shouldShowTyping(chatId)) {
        try {
            // This function runs after the command has been executed and response sent
            // So we just need to show a brief typing indicator
            
            // Subscribe to presence updates
            await sock.presenceSubscribe(chatId);
            
            // Show typing status briefly
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Keep typing visible for a short time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Then pause
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true;
        } catch (error) {
            console.error('❌ Error sending post-command typing indicator:', error);
            return false;
        }
    }
    return false; // Autotyping is disabled for this chat type
}

module.exports = {
    autotypingCommand,
    isAutotypingEnabled,
    shouldShowTyping,
    handleAutotypingForMessage,
    handleAutotypingForCommand,
    showTypingAfterCommand
};
