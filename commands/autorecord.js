/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecord Command - Shows fake recording status (with infinite mode)
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecord.json');

// Store active infinite recording sessions
const activeInfiniteSessions = new Map();

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
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ 
                enabled: false,
                mode: 'all',
                duration: 60,
                infinite: false
            }, null, 2));
            console.log('📁 Created new autorecord config file');
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        
        // Migrate old config if missing infinite field
        if (config.infinite === undefined) {
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('📝 Config migrated to support infinite mode');
        }
        
        return config;
    } catch (error) {
        console.error('❌ Error initializing autorecord config:', error);
        return { enabled: false, mode: 'all', duration: 60, infinite: false };
    }
}

// Stop infinite recording for a specific chat
function stopInfiniteRecording(chatId) {
    const session = activeInfiniteSessions.get(chatId);
    if (session && session.intervalId) {
        clearInterval(session.intervalId);
        activeInfiniteSessions.delete(chatId);
        console.log(`🛑 Stopped infinite recording for ${chatId}`);
        return true;
    }
    return false;
}

// Stop all infinite recordings
function stopAllInfiniteRecordings() {
    let count = 0;
    for (const [chatId, session] of activeInfiniteSessions.entries()) {
        clearInterval(session.intervalId);
        activeInfiniteSessions.delete(chatId);
        count++;
    }
    if (count > 0) {
        console.log(`🛑 Stopped all ${count} infinite recording sessions`);
    }
    return count;
}

// Start infinite recording for a specific chat
async function startInfiniteRecording(sock, chatId) {
    stopInfiniteRecording(chatId);
    
    console.log(`♾️ Starting infinite recording in ${chatId}`);
    
    try {
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        await sock.sendPresenceUpdate('recording', chatId);
        console.log(`♾️ Infinite recording started`);
        
        const session = {
            chatId,
            startTime: Date.now(),
            refreshCount: 0
        };
        
        session.intervalId = setInterval(async () => {
            try {
                await sock.sendPresenceUpdate('recording', chatId);
                session.refreshCount++;
                const runningTime = Math.floor((Date.now() - session.startTime) / 1000);
                const mins = Math.floor(runningTime / 60);
                const secs = runningTime % 60;
                console.log(`♾️ Infinite recording refreshed (${session.refreshCount}x, ${mins}m ${secs}s)`);
            } catch (error) {
                console.error('❌ Error refreshing infinite recording:', error.message);
                stopInfiniteRecording(chatId);
            }
        }, 10000);
        
        activeInfiniteSessions.set(chatId, session);
        return true;
    } catch (error) {
        console.error('❌ Error starting infinite recording:', error.message);
        return false;
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
            const infiniteStatus = config.infinite ? '♾️ ON' : '⏱️ OFF';
            const sessions = activeInfiniteSessions.size;
            
            const settingText = `🎙️ *AUTO-RECORD SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n` +
                      `♾️ *Infinite Mode:* ${infiniteStatus}\n` +
                      `🔄 *Active Sessions:* ${sessions}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autorecord on/off - Enable/disable\n` +
                      `└ .autorecord mode all/dms/groups - Set mode\n` +
                      `└ .autorecord duration <seconds> - Set duration\n` +
                      `└ .autorecord infinite on/off/stop - Infinite mode\n` +
                      `└ .autorecord status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Examples:*\n` +
                      `└ .autorecord duration 30\n` +
                      `└ .autorecord infinite on`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        console.log('🎯 Action:', action);
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('✅ AutoRecord ENABLED');
            
            const responseText = `✅ *AUTO-RECORD ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n` +
                      `♾️ Infinite Mode: ${config.infinite ? 'ON' : 'OFF'}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 Bot will show recording in ${getModeDescription(config.mode)}`;
            
            await sock.sendMessage(chatId, { text: responseText, ...channelInfo });
            
            // Start infinite recording if enabled
            if (config.infinite && shouldShowRecording(chatId)) {
                await startInfiniteRecording(sock, chatId);
            }
        } 
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('❌ AutoRecord DISABLED');
            
            // Stop all infinite sessions
            const stopped = stopAllInfiniteRecordings();
            
            await sock.sendMessage(chatId, { 
                text: `❌ *AUTO-RECORD DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Stopped ${stopped} active session(s)\n\nBot will no longer show recording indicators.`,
                ...channelInfo 
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID OPTION*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available modes:*\n└ all - Work everywhere\n└ dms - DMs only\n└ groups - Groups only\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autorecord mode groups`,
                    ...channelInfo
                });
                return;
            }
            
            const mode = args[1].toLowerCase();
            
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}`,
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
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecord duration <seconds>\n\n━━━━━━━━━━━━━━━━━━━━\n✨ *Example:*\n└ .autorecord duration 60\n\n📌 Max: 120 seconds | Min: 5 seconds\n💡 Use 'infinite' for unlimited`,
                    ...channelInfo
                });
                return;
            }
            
            // Check if user wants infinite
            if (args[1].toLowerCase() === 'infinite') {
                config.infinite = true;
                config.duration = 999999;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Recording will continue indefinitely\n└ Auto-refresh every 10 seconds\n\n💡 Use .autorecord infinite stop to stop`,
                    ...channelInfo
                });
                return;
            }
            
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID DURATION*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Duration must be between 5 and 120 seconds.\n\n✨ *Example:*\n└ .autorecord duration 30\n💡 Or use 'infinite' for unlimited`,
                    ...channelInfo
                });
                return;
            }
            
            config.duration = duration;
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await sock.sendMessage(chatId, {
                text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Recording duration: ${duration} seconds\n└ Infinite mode: OFF`,
                ...channelInfo
            });
        }
        else if (action === 'infinite') {
            if (args.length < 2) {
                const infiniteStatus = config.infinite ? '♾️ ENABLED' : '❌ DISABLED';
                const sessions = activeInfiniteSessions.size;
                
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Status: ${infiniteStatus}\n🔄 Active Sessions: ${sessions}\n\n📖 *Commands:*\n└ .autorecord infinite on - Enable\n└ .autorecord infinite off - Disable\n└ .autorecord infinite stop - Stop all`,
                    ...channelInfo
                });
                return;
            }
            
            const subAction = args[1].toLowerCase();
            
            if (subAction === 'on' || subAction === 'enable') {
                config.infinite = true;
                config.duration = 999999;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE RECORDING ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Recording will continue indefinitely\n🔄 Auto-refresh every 10 seconds\n\n⚠️ Use .autorecord infinite stop to stop`,
                    ...channelInfo
                });
                
                // Start if enabled
                if (config.enabled && shouldShowRecording(chatId)) {
                    await startInfiniteRecording(sock, chatId);
                }
            }
            else if (subAction === 'off' || subAction === 'disable') {
                config.infinite = false;
                config.duration = 60;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                
                const stopped = stopAllInfiniteRecordings();
                
                await sock.sendMessage(chatId, {
                    text: `⏱️ *INFINITE MODE DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Stopped ${stopped} session(s)\n⏱️ Default duration: 60 seconds`,
                    ...channelInfo
                });
            }
            else if (subAction === 'stop') {
                const stopped = stopAllInfiniteRecordings();
                
                if (stopped > 0) {
                    await sock.sendMessage(chatId, {
                        text: `🛑 *STOPPED ${stopped} SESSION(S)*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Recording will resume on next message if autorecord is enabled.`,
                        ...channelInfo
                    });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *NO ACTIVE SESSIONS*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 No infinite recording sessions to stop.`,
                        ...channelInfo
                    });
                }
            }
        }
        else if (action === 'status') {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            const sessions = activeInfiniteSessions.size;
            
            let sessionsInfo = '';
            if (sessions > 0) {
                sessionsInfo = '\n\n🔄 *Active Infinite Sessions:*\n';
                for (const [chat, session] of activeInfiniteSessions.entries()) {
                    const runningTime = Math.floor((Date.now() - session.startTime) / 1000);
                    const mins = Math.floor(runningTime / 60);
                    const secs = runningTime % 60;
                    sessionsInfo += `└ ${chat.substring(0, 15)}... : ${mins}m ${secs}s\n`;
                }
            }
            
            await sock.sendMessage(chatId, {
                text: `🎙️ *AUTO-RECORD STATUS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n` +
                      `♾️ *Infinite Mode:* ${config.infinite ? 'ON' : 'OFF'}\n` +
                      `🔄 *Sessions:* ${sessions} active\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📌 ${getModeDescription(config.mode)}` +
                      sessionsInfo,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Available Commands:*\n` +
                      `└ .autorecord on/off\n` +
                      `└ .autorecord mode all/dms/groups\n` +
                      `└ .autorecord duration <seconds>\n` +
                      `└ .autorecord duration infinite\n` +
                      `└ .autorecord infinite on/off/stop\n` +
                      `└ .autorecord status\n\n` +
                      `✨ *Examples:*\n` +
                      `└ .autorecord infinite on\n` +
                      `└ .autorecord infinite stop`,
                ...channelInfo
            });
        }
        
    } catch (error) {
        console.error('❌ Error in autorecord command:', error);
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
    if (!shouldShowRecording(chatId)) return false;
    
    try {
        const config = initConfig();
        
        // If infinite mode, use infinite recording
        if (config.infinite) {
            return await startInfiniteRecording(sock, chatId);
        }
        
        // Regular timed recording
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`🎙️ Showing recording in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        await sock.sendPresenceUpdate('recording', chatId);
        
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('recording', chatId);
        }
        
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
        
        // If infinite mode, use infinite recording
        if (config.infinite) {
            return await startInfiniteRecording(sock, chatId);
        }
        
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`🎙️ Showing command recording in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        await sock.sendPresenceUpdate('recording', chatId);
        
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('recording', chatId);
        }
        
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
        
        // If infinite mode, use infinite recording
        if (config.infinite) {
            return await startInfiniteRecording(sock, chatId);
        }
        
        const duration = config.duration || 60;
        const refreshInterval = 10000;
        const refreshCount = Math.floor(duration * 1000 / refreshInterval);
        
        console.log(`🎙️ Showing post-command recording in ${chatId} for ${duration} seconds`);
        
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('recording', chatId);
        
        for (let i = 0; i < refreshCount; i++) {
            await delay(refreshInterval);
            await sock.sendPresenceUpdate('recording', chatId);
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
    showRecordingAfterCommand,
    stopInfiniteRecording,
    stopAllInfiniteRecordings,
    startInfiniteRecording,
    initConfig
};
