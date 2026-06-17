/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecordtype Command - Turn on both autotyping AND autorecord with one command (with infinite support)
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecordtype.json');

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
                duration: 60,
                infinite: false
            }, null, 2));
            console.log('📁 Created new autorecordtype config file');
        }
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.infinite === undefined) {
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        }
        return config;
    } catch (error) {
        console.error('❌ Error initializing autorecordtype config:', error);
        return { enabled: false, mode: 'all', duration: 60, infinite: false };
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
        const args = parts.slice(1);
        
        console.log('🔍 Args:', args);
        
        const config = initConfig();
        
        // If no arguments, show current status
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            
            const typingStatus = await getAutotypingStatus();
            const recordStatus = await getAutorecordStatus();
            
            const settingText = `🎙️⌨️ *AUTO-RECORD-TYPE SETTINGS*\n\n` +
                      `${statusIcon} *Master Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n` +
                      `♾️ *Infinite:* ${config.infinite ? 'ON' : 'OFF'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📊 *Individual Status:*\n` +
                      `└ Auto-typing: ${typingStatus}\n` +
                      `└ Auto-record: ${recordStatus}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autorecordtype on/off - Enable/disable both\n` +
                      `└ .autorecordtype mode all - Work everywhere\n` +
                      `└ .autorecordtype mode dms - DMs only\n` +
                      `└ .autorecordtype mode groups - Groups only\n` +
                      `└ .autorecordtype duration <seconds> - Set duration\n` +
                      `└ .autorecordtype duration infinite - Infinite mode\n` +
                      `└ .autorecordtype status - Show current settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .autorecordtype duration infinite\n` +
                      `└ .autorecordtype mode groups`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        console.log('🎯 Action:', action);
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await enableBothFeatures(config.mode, config.duration, config.infinite);
            
            const responseText = `✅ *AUTO-RECORD-TYPE ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✅ Auto-typing: ENABLED\n` +
                      `✅ Auto-record: ENABLED\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Both typing and recording indicators are now active!`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await disableBothFeatures();
            
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-RECORD-TYPE DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\nBoth typing and recording indicators are now turned off.',
                ...channelInfo 
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID OPTION*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available modes:*\n└ all - Work everywhere\n└ dms - DMs only\n└ groups - Groups only\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autorecordtype mode groups`,
                    ...channelInfo
                });
                return;
            }
            
            const mode = args[1].toLowerCase();
            
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await updateBothFeaturesMode(mode);
                
                await sock.sendMessage(chatId, {
                    text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n━━━━━━━━━━━━━━━━━━━━\n📌 ${getModeDescription(mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}`,
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
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecordtype duration <seconds>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autorecordtype duration 60\n\n📌 Max: 120 seconds | Min: 5 seconds\n💡 Use 'infinite' for unlimited`,
                    ...channelInfo
                });
                return;
            }
            
            // Check for infinite mode
            if (args[1].toLowerCase() === 'infinite') {
                config.duration = 999999;
                config.infinite = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await updateBothFeaturesDuration(999999, true);
                
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Both typing & recording will continue indefinitely\n🔄 Auto-refresh every 10 seconds\n\n💡 Use .autorecordtype off to stop`,
                    ...channelInfo
                });
                return;
            }
            
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID DURATION*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Duration must be between 5 and 120 seconds.\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autorecordtype duration 30\n💡 Or use 'infinite' for unlimited`,
                    ...channelInfo
                });
                return;
            }
            
            config.duration = duration;
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await updateBothFeaturesDuration(duration, false);
            
            await sock.sendMessage(chatId, {
                text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Both typing and recording duration: ${duration} seconds\n└ Infinite mode: OFF`,
                ...channelInfo
            });
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            
            const typingStatus = await getAutotypingStatus();
            const recordStatus = await getAutorecordStatus();
            
            await sock.sendMessage(chatId, {
                text: `🎙️⌨️ *AUTO-RECORD-TYPE STATUS*\n\n` +
                      `${statusIcon} *Master Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n` +
                      `♾️ *Infinite:* ${config.infinite ? 'ON' : 'OFF'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📊 *Individual Status:*\n` +
                      `└ Auto-typing: ${typingStatus}\n` +
                      `└ Auto-record: ${recordStatus}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available Commands:*\n` +
                      `└ .autorecordtype on/off\n` +
                      `└ .autorecordtype mode all/dms/groups\n` +
                      `└ .autorecordtype duration <seconds>\n` +
                      `└ .autorecordtype duration infinite\n` +
                      `└ .autorecordtype status\n` +
                      `└ .autorecordtype (shows this menu)\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `✨ *Example:*\n` +
                      `└ .autorecordtype mode groups\n` +
                      `└ .autorecordtype duration infinite`,
                ...channelInfo
            });
        }
        
    } catch (error) {
        console.error('❌ Error in autorecordtype command:', error);
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
        case 'all': return 'Both typing and recording indicators will show in both DMs and groups.';
        case 'dms': return 'Both typing and recording indicators will show only in private messages.';
        case 'groups': return 'Both typing and recording indicators will show only in group chats.';
        default: return 'Both typing and recording indicators will show in both DMs and groups.';
    }
}

// Enable both autotyping and autorecord
async function enableBothFeatures(mode, duration, infinite = false) {
    try {
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        let autotypingConfig = { enabled: true, mode: mode, duration: duration };
        
        if (fs.existsSync(autotypingConfigPath)) {
            autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
        }
        autotypingConfig.enabled = true;
        autotypingConfig.mode = mode;
        autotypingConfig.duration = duration;
        fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        let autorecordConfig = { enabled: true, mode: mode, duration: duration, infinite: infinite };
        
        if (fs.existsSync(autorecordConfigPath)) {
            autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
        }
        autorecordConfig.enabled = true;
        autorecordConfig.mode = mode;
        autorecordConfig.duration = duration;
        autorecordConfig.infinite = infinite;
        fs.writeFileSync(autorecordConfigPath, JSON.stringify(autorecordConfig, null, 2));
        
        console.log(`✅ Both autotyping and autorecord enabled (mode: ${mode}, duration: ${duration}s, infinite: ${infinite})`);
        return true;
    } catch (error) {
        console.error('Error enabling both features:', error);
        return false;
    }
}

// Disable both autotyping and autorecord
async function disableBothFeatures() {
    try {
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (fs.existsSync(autotypingConfigPath)) {
            let autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
            autotypingConfig.enabled = false;
            fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        }
        
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (fs.existsSync(autorecordConfigPath)) {
            let autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
            autorecordConfig.enabled = false;
            autorecordConfig.infinite = false;
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
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (fs.existsSync(autotypingConfigPath)) {
            let autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
            autotypingConfig.mode = mode;
            fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        }
        
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
async function updateBothFeaturesDuration(duration, infinite = false) {
    try {
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (fs.existsSync(autotypingConfigPath)) {
            let autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
            autotypingConfig.duration = duration;
            fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        }
        
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (fs.existsSync(autorecordConfigPath)) {
            let autorecordConfig = JSON.parse(fs.readFileSync(autorecordConfigPath));
            autorecordConfig.duration = duration;
            autorecordConfig.infinite = infinite;
            fs.writeFileSync(autorecordConfigPath, JSON.stringify(autorecordConfig, null, 2));
        }
        
        console.log(`⏱️ Both features duration updated to: ${duration} seconds, infinite: ${infinite}`);
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
