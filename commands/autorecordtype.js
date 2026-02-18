/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecordtype Command - Turn on both autotyping AND autorecord with one command
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecordtype.json');

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
                mode: 'all', // all, dms, groups
                duration: 60 // duration in seconds
            }, null, 2));
            console.log('📁 Created new autorecordtype config file');
        }
        return JSON.parse(fs.readFileSync(configPath));
    } catch (error) {
        console.error('❌ Error initializing autorecordtype config:', error);
        return { enabled: false, mode: 'all', duration: 60 };
    }
}

// Toggle autorecordtype feature
async function autorecordtypeCommand(sock, chatId, message) {
    try {
        console.log('🎙️⌨️ AutoRecordType command triggered');
        
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
            
            // Get individual feature status
            const typingStatus = await getAutotypingStatus();
            const recordStatus = await getAutorecordStatus();
            
            await sock.sendMessage(chatId, {
                text: `🎙️⌨️ *AutoRecordType Settings*\n\n` +
                      `📱 *Master Status:* ${status}\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.duration} seconds\n\n` +
                      `*Individual Status:*\n` +
                      `• Auto-typing: ${typingStatus}\n` +
                      `• Auto-record: ${recordStatus}\n\n` +
                      `*Commands:*\n` +
                      `• .autorecordtype on/off - Enable/disable both\n` +
                      `• .autorecordtype mode all - Work everywhere\n` +
                      `• .autorecordtype mode dms - DMs only\n` +
                      `• .autorecordtype mode groups - Groups only\n` +
                      `• .autorecordtype duration <seconds> - Set duration (max 120)\n` +
                      `• .autorecordtype status - Show current settings`,
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
            
            // Enable both autotyping and autorecord
            await enableBothFeatures(config.mode, config.duration);
            
            await sock.sendMessage(chatId, {
                text: `✅ *AutoRecordType enabled!*\n\n` +
                      `Mode: ${getModeText(config.mode)}\n` +
                      `Duration: ${config.duration} seconds\n\n` +
                      `✅ Auto-typing: ENABLED\n` +
                      `✅ Auto-record: ENABLED\n\n` +
                      `Both typing and recording indicators are now active for ${config.duration} seconds!`,
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
            
            // Disable both autotyping and autorecord
            await disableBothFeatures();
            
            await sock.sendMessage(chatId, {
                text: '❌ *AutoRecordType disabled!*\n\nBoth typing and recording indicators are now turned off.',
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
                
                // Update both features with new mode
                await updateBothFeaturesMode(mode);
                
                await sock.sendMessage(chatId, {
                    text: `🎯 *AutoRecordType mode set to:* ${getModeText(mode)}\n\n${getModeDescription(mode)}\n\nDuration: ${config.duration} seconds`,
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
                    text: '❌ Please specify duration in seconds!\n\nExample: .autorecordtype duration 60\nMax: 120 seconds',
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
            
            // Update both features with new duration
            await updateBothFeaturesDuration(duration);
            
            await sock.sendMessage(chatId, {
                text: `⏱️ *AutoRecordType duration set to:* ${duration} seconds\n\nBoth typing and recording will now last for ${duration} seconds.`,
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
            
            // Check current status of both features
            const typingStatus = await getAutotypingStatus();
            const recordStatus = await getAutorecordStatus();
            
            await sock.sendMessage(chatId, {
                text: `🎙️⌨️ *AutoRecordType Status*\n\n` +
                      `📱 *Master Status:* ${status}\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.duration} seconds\n\n` +
                      `*Individual Status:*\n` +
                      `• Auto-typing: ${typingStatus}\n` +
                      `• Auto-record: ${recordStatus}\n\n` +
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
                      '• .autorecordtype on/off\n' +
                      '• .autorecordtype mode all/dms/groups\n' +
                      '• .autorecordtype duration <seconds>\n' +
                      '• .autorecordtype status\n' +
                      '• .autorecordtype (shows this menu)',
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
        console.error('❌ Error in autorecordtype command:', error);
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
        case 'all': return 'Both typing and recording indicators will show in both DMs and groups.';
        case 'dms': return 'Both typing and recording indicators will show only in private messages.';
        case 'groups': return 'Both typing and recording indicators will show only in group chats.';
        default: return 'Both typing and recording indicators will show in both DMs and groups.';
    }
}

// Enable both autotyping and autorecord
async function enableBothFeatures(mode, duration) {
    try {
        // Enable autotyping
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        let autotypingConfig = { enabled: true, mode: mode, duration: duration };
        
        if (fs.existsSync(autotypingConfigPath)) {
            autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
        }
        autotypingConfig.enabled = true;
        autotypingConfig.mode = mode;
        autotypingConfig.duration = duration;
        fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        
        // Enable autorecord
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        let autorecordConfig = { enabled: true, mode: mode, duration: duration };
        
        if (fs.existsSync(autorecordConfigPath)) {
            autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
        }
        autorecordConfig.enabled = true;
        autorecordConfig.mode = mode;
        autorecordConfig.duration = duration;
        fs.writeFileSync(autorecordConfigPath, JSON.stringify(autorecordConfig, null, 2));
        
        console.log(`✅ Both autotyping and autorecord enabled (mode: ${mode}, duration: ${duration}s)`);
        return true;
    } catch (error) {
        console.error('Error enabling both features:', error);
        return false;
    }
}

// Disable both autotyping and autorecord
async function disableBothFeatures() {
    try {
        // Disable autotyping
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (fs.existsSync(autotypingConfigPath)) {
            let autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
            autotypingConfig.enabled = false;
            fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        }
        
        // Disable autorecord
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (fs.existsSync(autorecordConfigPath)) {
            let autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
            autorecordConfig.enabled = false;
            fs.writeFileSync(autorecordConfigPath, JSON.stringify(autorecordConfig, null, 2));
        }
        
        console.log('❌ Both autotyping and autorecord disabled');
        return true;
    } catch (error) {
        console.error('Error disabling both features:', error);
        return false;
    }
}

// Update mode for both features
async function updateBothFeaturesMode(mode) {
    try {
        // Update autotyping mode
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (fs.existsSync(autotypingConfigPath)) {
            let autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
            autotypingConfig.mode = mode;
            fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        }
        
        // Update autorecord mode
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (fs.existsSync(autorecordConfigPath)) {
            let autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
            autorecordConfig.mode = mode;
            fs.writeFileSync(autorecordConfigPath, JSON.stringify(autorecordConfig, null, 2));
        }
        
        console.log(`🎯 Both features mode updated to: ${mode}`);
        return true;
    } catch (error) {
        console.error('Error updating both features mode:', error);
        return false;
    }
}

// Update duration for both features
async function updateBothFeaturesDuration(duration) {
    try {
        // Update autotyping duration
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (fs.existsSync(autotypingConfigPath)) {
            let autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
            autotypingConfig.duration = duration;
            fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        }
        
        // Update autorecord duration
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (fs.existsSync(autorecordConfigPath)) {
            let autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
            autorecordConfig.duration = duration;
            fs.writeFileSync(autorecordConfigPath, JSON.stringify(autorecordConfig, null, 2));
        }
        
        console.log(`⏱️ Both features duration updated to: ${duration} seconds`);
        return true;
    } catch (error) {
        console.error('Error updating both features duration:', error);
        return false;
    }
}

// Get current status of autotyping
async function getAutotypingStatus() {
    try {
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (!fs.existsSync(autotypingConfigPath)) return '❌ Not configured';
        const autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
        return autotypingConfig.enabled ? '✅ Enabled' : '❌ Disabled';
    } catch (error) {
        return '❓ Unknown';
    }
}

// Get current status of autorecord
async function getAutorecordStatus() {
    try {
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (!fs.existsSync(autorecordConfigPath)) return '❌ Not configured';
        const autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
        return autorecordConfig.enabled ? '✅ Enabled' : '❌ Disabled';
    } catch (error) {
        return '❓ Unknown';
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

module.exports = {
    autorecordtypeCommand,
    isAutorecordtypeEnabled
};
