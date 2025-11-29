/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecord Command - Shows fake recording status
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecord.json');

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

// Toggle autorecord feature
async function autorecordCommand(sock, chatId, message) {
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
                text: `🎙️ *Auto-Record Settings*\n\n📱 *Status:* ${status}\n🎯 *Mode:* ${modeText}\n\n*Commands:*\n• .autorecord on/off - Enable/disable\n• .autorecord mode all - Work everywhere\n• .autorecord mode dms - DMs only\n• .autorecord mode groups - Groups only\n• .autorecord status - Show current settings`,
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
                text: `✅ *Auto-record enabled!*\n\nMode: ${getModeText(config.mode)}\n\nBot will now show recording indicators in ${getModeDescription(config.mode)}.`,
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
                text: '❌ *Auto-record disabled!*\n\nBot will no longer show recording indicators.',
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
                    text: `🎯 *Auto-record mode set to:* ${getModeText(mode)}\n\n${getModeDescription(mode)}`,
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
                text: `🎙️ *Auto-Record Status*\n\n📱 *Status:* ${status}\n🎯 *Mode:* ${modeText}\n\n${getModeDescription(config.mode)}`,
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
                text: '❌ Invalid command!\n\n*Available Commands:*\n• .autorecord on/off\n• .autorecord mode all/dms/groups\n• .autorecord status\n• .autorecord (shows this menu)',
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
        console.error('Error in autorecord command:', error);
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
        case 'all': return 'Recording indicators will show in both DMs and groups.';
        case 'dms': return 'Recording indicators will show only in private messages.';
        case 'groups': return 'Recording indicators will show only in group chats.';
        default: return 'Recording indicators will show in both DMs and groups.';
    }
}

// Function to check if autorecord should work in current chat
function shouldShowRecording(chatId) {
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
        console.error('Error checking autorecord status:', error);
        return false;
    }
}

// Function to check if autorecord is enabled
function isAutorecordEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autorecord status:', error);
        return false;
    }
}

// Function to handle autorecord for regular messages
async function handleAutorecordForMessage(sock, chatId, userMessage) {
    if (shouldShowRecording(chatId)) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then send the recording status - THIS SHOWS THE MICROPHONE ICON
            await sock.sendPresenceUpdate('recording', chatId);
            
            // Simulate recording time based on message length
            const recordingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(resolve => setTimeout(resolve, recordingDelay));
            
            // Send recording again to ensure it stays visible
            await sock.sendPresenceUpdate('recording', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates recording was shown
        } catch (error) {
            console.error('❌ Error sending recording indicator:', error);
            return false; // Indicates recording failed
        }
    }
    return false; // Autorecord is disabled for this chat type
}

// Function to handle autorecord for commands
async function handleAutorecordForCommand(sock, chatId) {
    if (shouldShowRecording(chatId)) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then send the recording status
            await sock.sendPresenceUpdate('recording', chatId);
            
            // Keep recording indicator active for commands
            const commandRecordingDelay = 3000;
            await new Promise(resolve => setTimeout(resolve, commandRecordingDelay));
            
            // Send recording again to ensure it stays visible
            await sock.sendPresenceUpdate('recording', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates recording was shown
        } catch (error) {
            console.error('❌ Error sending command recording indicator:', error);
            return false; // Indicates recording failed
        }
    }
    return false; // Autorecord is disabled for this chat type
}

// Function to show recording status AFTER command execution
async function showRecordingAfterCommand(sock, chatId) {
    if (shouldShowRecording(chatId)) {
        try {
            // This function runs after the command has been executed and response sent
            // So we just need to show a brief recording indicator
            
            // Subscribe to presence updates
            await sock.presenceSubscribe(chatId);
            
            // Show recording status briefly
            await sock.sendPresenceUpdate('recording', chatId);
            
            // Keep recording visible for a short time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Then pause
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true;
        } catch (error) {
            console.error('❌ Error sending post-command recording indicator:', error);
            return false;
        }
    }
    return false; // Autorecord is disabled for this chat type
}

module.exports = {
    autorecordCommand,
    isAutorecordEnabled,
    shouldShowRecording,
    handleAutorecordForMessage,
    handleAutorecordForCommand,
    showRecordingAfterCommand
};
