/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecordtype Command - Shows fake recording AND typing status (COMBINED)
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecordtype.json');

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

// Toggle autorecordtype feature
async function autorecordtypeCommand(sock, chatId, message) {
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
                text: `🎙️⌨️ *Auto-Record+Type Settings*\n\n📱 *Status:* ${status}\n🎯 *Mode:* ${modeText}\n\n*Commands:*\n• .autorecordtype on/off - Enable/disable\n• .autorecordtype mode all - Work everywhere\n• .autorecordtype mode dms - DMs only\n• .autorecordtype mode groups - Groups only\n• .autorecordtype status - Show current settings`,
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
                text: `✅ *Auto-record+type enabled!*\n\nMode: ${getModeText(config.mode)}\n\nBot will now show recording AND typing indicators in ${getModeDescription(config.mode)}.`,
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
                text: '❌ *Auto-record+type disabled!*\n\nBot will no longer show recording and typing indicators.',
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
                    text: `🎯 *Auto-record+type mode set to:* ${getModeText(mode)}\n\n${getModeDescription(mode)}`,
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
                text: `🎙️⌨️ *Auto-Record+Type Status*\n\n📱 *Status:* ${status}\n🎯 *Mode:* ${modeText}\n\n${getModeDescription(config.mode)}`,
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
                text: '❌ Invalid command!\n\n*Available Commands:*\n• .autorecordtype on/off\n• .autorecordtype mode all/dms/groups\n• .autorecordtype status\n• .autorecordtype (shows this menu)',
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
        console.error('Error in autorecordtype command:', error);
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
        case 'all': return 'Recording AND typing indicators will show in both DMs and groups.';
        case 'dms': return 'Recording AND typing indicators will show only in private messages.';
        case 'groups': return 'Recording AND typing indicators will show only in group chats.';
        default: return 'Recording AND typing indicators will show in both DMs and groups.';
    }
}

// Function to check if autorecordtype should work in current chat
function shouldShowRecordType(chatId) {
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
        console.error('Error checking autorecordtype status:', error);
        return false;
    }
}

// Function to check if autorecordtype is enabled
function isAutorecordtypeEnabled() {
    try {
        const config = initConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking autorecordtype status:', error);
        return false;
    }
}

// COMBINED FUNCTION: Shows recording THEN typing (like your autotyping.js)
async function handleAutorecordtypeForMessage(sock, chatId, userMessage) {
    if (shouldShowRecordType(chatId)) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // PHASE 1: Show RECORDING indicator (microphone icon)
            await sock.sendPresenceUpdate('recording', chatId);
            
            // Show recording based on message length (like autotyping.js)
            const recordingDelay = Math.max(2000, Math.min(5000, userMessage.length * 100));
            await new Promise(resolve => setTimeout(resolve, recordingDelay));
            
            // Stop recording
            await sock.sendPresenceUpdate('paused', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // PHASE 2: Show TYPING indicator ("Typing..." text) - EXACTLY LIKE AUTOTYPING.JS
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Simulate typing time based on message length with increased minimum time (like autotyping.js)
            const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            
            // Send composing again to ensure it stays visible (like autotyping.js)
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates both indicators were shown
        } catch (error) {
            console.error('❌ Error sending record+type indicators:', error);
            return false;
        }
    }
    return false; // Autorecordtype is disabled for this chat type
}

// Function to handle autorecordtype for commands
async function handleAutorecordtypeForCommand(sock, chatId) {
    if (shouldShowRecordType(chatId)) {
        try {
            // First subscribe to presence updates for this chat
            await sock.presenceSubscribe(chatId);
            
            // Send available status first
            await sock.sendPresenceUpdate('available', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Show RECORDING indicator
            await sock.sendPresenceUpdate('recording', chatId);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Stop recording
            await sock.sendPresenceUpdate('paused', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Show TYPING indicator (like autotyping.js)
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Keep typing indicator active for commands with increased duration (like autotyping.js)
            const commandTypingDelay = 3000;
            await new Promise(resolve => setTimeout(resolve, commandTypingDelay));
            
            // Send composing again to ensure it stays visible (like autotyping.js)
            await sock.sendPresenceUpdate('composing', chatId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Finally send paused status
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true; // Indicates both indicators were shown
        } catch (error) {
            console.error('❌ Error sending command record+type indicators:', error);
            return false;
        }
    }
    return false; // Autorecordtype is disabled for this chat type
}

// Function to show record+type status AFTER command execution
async function showRecordTypeAfterCommand(sock, chatId) {
    if (shouldShowRecordType(chatId)) {
        try {
            // This function runs after the command has been executed and response sent
            // So we just need to show a brief recording then typing indicator
            
            // Subscribe to presence updates
            await sock.presenceSubscribe(chatId);
            
            // Show recording status briefly
            await sock.sendPresenceUpdate('recording', chatId);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Stop recording
            await sock.sendPresenceUpdate('paused', chatId);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Then show typing status briefly (like autotyping.js)
            await sock.sendPresenceUpdate('composing', chatId);
            
            // Keep typing visible for a short time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Then pause
            await sock.sendPresenceUpdate('paused', chatId);
            
            return true;
        } catch (error) {
            console.error('❌ Error sending post-command record+type indicators:', error);
            return false;
        }
    }
    return false; // Autorecordtype is disabled for this chat type
}

module.exports = {
    autorecordtypeCommand,
    isAutorecordtypeEnabled,
    shouldShowRecordType,
    handleAutorecordtypeForMessage,
    handleAutorecordtypeForCommand,
    showRecordTypeAfterCommand
};
