/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecord Command - Shows fake recording status for 60 seconds
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecord.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            // Ensure data directory exists
            const dataDir = path.join(__dirname, '..', 'data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(configPath, JSON.stringify({ 
                enabled: false,
                mode: 'all', // all, dms, groups
                duration: 60 // duration in seconds
            }, null, 2));
            console.log('📁 Created new autorecord config file');
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        console.error('❌ Error initializing autorecord config:', error);
        return { enabled: false, mode: 'all', duration: 60 };
    }
}

// Toggle autorecord feature
async function autorecordCommand(sock, chatId, message) {
    try {
        console.log('🎙️ AutoRecord command triggered');
        
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
        const userMessage = message.message?.conversation || 
                          message.message?.extendedTextMessage?.text || '';
        
        console.log('📝 Raw message:', userMessage);
        
        // Extract command and args
        let commandPart = userMessage.trim();
        if (commandPart.startsWith('.')) {
            commandPart = commandPart.substring(1);
        }
        
        const parts = commandPart.split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        console.log('🔍 Command:', commandName);
        console.log('🔍 Args:', args);
        
        // Initialize or read config
        const config = initConfig();
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const modeText = getModeText(config.mode);
            
            await sock.sendMessage(chatId, {
                text: `🎙️ *Auto-Record Settings*\n\n` +
                      `📱 *Status:* ${status}\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.duration} seconds\n\n` +
                      `*Commands:*\n` +
                      `• .autorecord on/off - Enable/disable\n` +
                      `• .autorecord mode all - Work everywhere\n` +
                      `• .autorecord mode dms - DMs only\n` +
                      `• .autorecord mode groups - Groups only\n` +
                      `• .autorecord duration <seconds> - Set duration (max 120)\n` +
                      `• .autorecord status - Show current settings`,
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
        console.log('🎯 Action:', action);
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('✅ AutoRecord ENABLED');
            await sock.sendMessage(chatId, {
                text: `✅ *Auto-record enabled!*\n\n` +
                      `Mode: ${getModeText(config.mode)}\n` +
                      `Duration: ${config.duration} seconds\n\n` +
                      `Bot will now show recording indicators for ${config.duration} seconds in ${getModeDescription(config.mode)}.`,
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
            console.log('❌ AutoRecord DISABLED');
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
            console.log('📌 Setting mode to:', mode);
            
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `🎯 *Auto-record mode set to:* ${getModeText(mode)}\n\n${getModeDescription(mode)}\n\nDuration: ${config.duration} seconds`,
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
        else if (action === 'duration') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: '❌ Please specify duration in seconds!\n\nExample: .autorecord duration 60\nMax: 120 seconds',
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
            
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) {
                await sock.sendMessage(chatId, {
                    text: '❌ Invalid duration!\n\nDuration must be between 5 and 120 seconds.',
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
            
            config.duration = duration;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `⏱️ *Auto-record duration set to:* ${duration} seconds`,
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
        else if (action === 'status') {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            const modeText = getModeText(config.mode);
            
            await sock.sendMessage(chatId, {
                text: `🎙️ *Auto-Record Status*\n\n` +
                      `📱 *Status:* ${status}\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.duration} seconds\n\n` +
                      `${getModeDescription(config.mode)}`,
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
                text: '❌ Invalid command!\n\n*Available Commands:*\n' +
                      '• .autorecord on/off\n' +
                      '• .autorecord mode all/dms/groups\n' +
                      '• .autorecord duration <seconds>\n' +
                      '• .autorecord status\n' +
                      '• .autorecord (shows this menu)',
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
        console.error('❌ Error in autorecord command:', error);
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
    if (!shouldShowRecording(chatId)) return false;
    
    try {
        const config = initConfig();
        const duration = config.duration || 60;
        const refreshInterval = 10000; // Refresh every 10 seconds
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`🎙️ Showing recording in ${chatId} for ${duration} seconds`);
        
        // Subscribe to presence updates
        await sock.presenceSubscribe(chatId);
        await delay(300);
        
        // Set available status first
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        
        // Show recording status
        await sock.sendPresenceUpdate('recording', chatId);
        console.log(`🎙️ Recording indicator started (will last ${duration} seconds)`);
        
        // Keep recording indicator active for the specified duration
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('recording', chatId);
            console.log(`🎙️ Recording indicator refreshed (${Math.min((i+1)*10, duration)}/${duration} seconds)`);
        }
        
        // Set to paused after duration
        await sock.sendPresenceUpdate('paused', chatId);
        console.log(`🎙️ Recording finished after ${duration} seconds`);
        
        return true;
    } catch (error) {
        console.error('❌ Error in handleAutorecordForMessage:', error.message);
        return false;
    }
}

// Function to handle autorecord for commands
async function handleAutorecordForCommand(sock, chatId) {
    if (!shouldShowRecording(chatId)) return false;
    
    try {
        const config = initConfig();
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`🎙️ Showing command recording in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        await sock.sendPresenceUpdate('recording', chatId);
        console.log(`🎙️ Command recording started (will last ${duration} seconds)`);
        
        // Keep recording for the specified duration
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('recording', chatId);
            console.log(`🎙️ Command recording refreshed (${Math.min((i+1)*10, duration)}/${duration} seconds)`);
        }
        
        // Finally pause
        await sock.sendPresenceUpdate('paused', chatId);
        console.log(`🎙️ Command recording finished after ${duration} seconds`);
        
        return true;
    } catch (error) {
        console.error('❌ Error in handleAutorecordForCommand:', error.message);
        return false;
    }
}

// Function to show recording status AFTER command execution
async function showRecordingAfterCommand(sock, chatId) {
    if (!shouldShowRecording(chatId)) return false;
    
    try {
        const config = initConfig();
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`🎙️ Showing post-command recording in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('recording', chatId);
        console.log(`🎙️ Post-command recording started (will last ${duration} seconds)`);
        
        // Keep recording for the specified duration
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('recording', chatId);
            console.log(`🎙️ Post-command recording refreshed (${Math.min((i+1)*10, duration)}/${duration} seconds)`);
        }
        
        await sock.sendPresenceUpdate('paused', chatId);
        console.log(`🎙️ Post-command recording finished after ${duration} seconds`);
        
        return true;
    } catch (error) {
        console.error('❌ Error in showRecordingAfterCommand:', error.message);
        return false;
    }
}

// Delay helper function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    autorecordCommand,
    isAutorecordEnabled,
    shouldShowRecording,
    handleAutorecordForMessage,
    handleAutorecordForCommand,
    showRecordingAfterCommand
};
