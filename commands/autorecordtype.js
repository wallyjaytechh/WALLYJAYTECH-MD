/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecordtype Command - Turn on both autotyping AND autorecord with one command (with infinite support)
 * Now alternates between recording and typing to show both
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autorecordtype.json');

// Store active alternating sessions
const activeSessions = new Map();

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

// Stop alternating session for a chat
function stopAlternatingSession(chatId) {
    const session = activeSessions.get(chatId);
    if (session && session.intervalId) {
        clearInterval(session.intervalId);
        activeSessions.delete(chatId);
        console.log(`🛑 Stopped alternating session for ${chatId}`);
        return true;
    }
    return false;
}

// Stop all alternating sessions
function stopAllAlternatingSessions() {
    let count = 0;
    for (const [chatId, session] of activeSessions.entries()) {
        clearInterval(session.intervalId);
        activeSessions.delete(chatId);
        count++;
    }
    if (count > 0) console.log(`🛑 Stopped ${count} alternating sessions`);
    return count;
}

// Start alternating between recording and typing
async function startAlternatingSession(sock, chatId) {
    stopAlternatingSession(chatId);
    
    console.log(`🔄 Starting alternating recording/typing in ${chatId}`);
    
    try {
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        
        let isRecording = true;
        let refreshCount = 0;
        
        const session = {
            chatId,
            startTime: Date.now(),
            refreshCount: 0,
            isRecording: true
        };
        
        // Alternate every 5 seconds between recording and typing
        session.intervalId = setInterval(async () => {
            try {
                if (isRecording) {
                    await sock.sendPresenceUpdate('recording', chatId);
                    console.log(`🔄 Alternating: RECORDING (${refreshCount}x)`);
                } else {
                    await sock.sendPresenceUpdate('composing', chatId);
                    console.log(`🔄 Alternating: TYPING (${refreshCount}x)`);
                }
                isRecording = !isRecording;
                session.refreshCount++;
                session.isRecording = isRecording;
                
                const runningTime = Math.floor((Date.now() - session.startTime) / 1000);
                const mins = Math.floor(runningTime / 60);
                const secs = runningTime % 60;
                if (refreshCount % 6 === 0) { // Log every ~30 seconds
                    console.log(`🔄 Alternating session running: ${mins}m ${secs}s (${session.refreshCount} switches)`);
                }
            } catch (error) {
                console.error('❌ Error in alternating session:', error.message);
                stopAlternatingSession(chatId);
            }
        }, 5000); // Switch every 5 seconds
        
        // First update immediately
        await sock.sendPresenceUpdate('recording', chatId);
        console.log('🔄 Started with RECORDING');
        
        activeSessions.set(chatId, session);
        return true;
    } catch (error) {
        console.error('❌ Error starting alternating session:', error.message);
        return false;
    }
}

// Enable both features and write configs
async function enableBothFeatures(sock, chatId, mode, duration, infinite = false) {
    try {
        // Write autotyping config
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        let autotypingConfig = { enabled: true, mode: mode, duration: duration, infinite: infinite };
        if (fs.existsSync(autotypingConfigPath)) {
            autotypingConfig = JSON.parse(fs.readFileSync(autotypingConfigPath));
        }
        autotypingConfig.enabled = true;
        autotypingConfig.mode = mode;
        autotypingConfig.duration = duration;
        autotypingConfig.infinite = infinite;
        fs.writeFileSync(autotypingConfigPath, JSON.stringify(autotypingConfig, null, 2));
        
        // Write autorecord config
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
        
        // Start alternating session if infinite
        if (infinite && sock && chatId) {
            await startAlternatingSession(sock, chatId);
        }
        
        console.log(`✅ Both features enabled (infinite: ${infinite})`);
        return true;
    } catch (error) {
        console.error('Error enabling both features:', error);
        return false;
    }
}

// Disable both features
async function disableBothFeatures() {
    try {
        const autotypingConfigPath = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (fs.existsSync(autotypingConfigPath)) {
            let cfg = JSON.parse(fs.readFileSync(autotypingConfigPath));
            cfg.enabled = false;
            cfg.infinite = false;
            fs.writeFileSync(autotypingConfigPath, JSON.stringify(cfg, null, 2));
        }
        
        const autorecordConfigPath = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (fs.existsSync(autorecordConfigPath)) {
            let cfg = JSON.parse(fs.readFileSync(autorecordConfigPath));
            cfg.enabled = false;
            cfg.infinite = false;
            fs.writeFileSync(autorecordConfigPath, JSON.stringify(cfg, null, 2));
        }
        
        stopAllAlternatingSessions();
        
        // Also stop individual sessions
        try {
            const { stopAllInfiniteRecordings } = require('./autorecord');
            stopAllInfiniteRecordings();
        } catch (e) {}
        try {
            const { stopAllInfiniteTyping } = require('./autotyping');
            stopAllInfiniteTyping();
        } catch (e) {}
        
        console.log('❌ Both features disabled');
        return true;
    } catch (error) {
        console.error('Error disabling both features:', error);
        return false;
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
        
        let commandPart = userMessage.trim();
        if (commandPart.startsWith('.')) commandPart = commandPart.substring(1);
        
        const parts = commandPart.split(/\s+/);
        const args = parts.slice(1);
        
        const config = initConfig();
        
        // No args = show status
        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            const sessions = activeSessions.size;
            
            const settingText = `🎙️⌨️ *AUTO-RECORD-TYPE SETTINGS*\n\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite (5s alternating)' : config.duration + ' seconds'}\n` +
                      `♾️ *Infinite:* ${config.infinite ? 'ON' : 'OFF'}\n` +
                      `🔄 *Active Sessions:* ${sessions}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autorecordtype on/off\n` +
                      `└ .autorecordtype mode all/dms/groups\n` +
                      `└ .autorecordtype duration <seconds>\n` +
                      `└ .autorecordtype duration infinite\n` +
                      `└ .autorecordtype status`;
            
            await sock.sendMessage(chatId, { text: settingText, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();
        
        if (action === 'on' || action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await enableBothFeatures(sock, chatId, config.mode, config.duration, config.infinite);
            
            await sock.sendMessage(chatId, {
                text: `✅ *AUTO-RECORD-TYPE ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.infinite ? '♾️ Infinite (alternating)' : config.duration + ' seconds'}\n\n` +
                      `✅ Auto-typing: ENABLED\n` +
                      `✅ Auto-record: ENABLED\n\n` +
                      `🔄 When infinite: alternates recording/typing every 5 seconds`,
                ...channelInfo
            });
        }
        else if (action === 'off' || action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await disableBothFeatures();
            
            await sock.sendMessage(chatId, { 
                text: '❌ *AUTO-RECORD-TYPE DISABLED*\n\nBoth typing and recording indicators stopped.',
                ...channelInfo 
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Modes: all, dms, groups\nExample: .autorecordtype mode groups`,
                    ...channelInfo
                });
                return;
            }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await updateBothConfigsMode(mode);
                await sock.sendMessage(chatId, {
                    text: `🎯 *MODE UPDATED:* ${getModeText(mode)}`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'duration') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Usage: .autorecordtype duration <seconds> or infinite`,
                    ...channelInfo
                });
                return;
            }
            
            if (args[1].toLowerCase() === 'infinite') {
                config.duration = 999999;
                config.infinite = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await updateBothConfigsDuration(999999, true);
                
                if (config.enabled) {
                    await startAlternatingSession(sock, chatId);
                }
                
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE MODE*\n\nBoth recording & typing will alternate every 5 seconds indefinitely.`,
                    ...channelInfo
                });
                return;
            }
            
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ Duration: 5-120 seconds, or use 'infinite'`,
                    ...channelInfo
                });
                return;
            }
            
            config.duration = duration;
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            stopAllAlternatingSessions();
            await updateBothConfigsDuration(duration, false);
            
            await sock.sendMessage(chatId, {
                text: `⏱️ *DURATION:* ${duration} seconds`,
                ...channelInfo
            });
        }
        else if (action === 'status') {
            const sessions = activeSessions.size;
            let sessionsInfo = '';
            if (sessions > 0) {
                sessionsInfo = '\n\n🔄 *Active Alternating Sessions:*\n';
                for (const [chat, session] of activeSessions.entries()) {
                    const runningTime = Math.floor((Date.now() - session.startTime) / 1000);
                    const mins = Math.floor(runningTime / 60);
                    const secs = runningTime % 60;
                    sessionsInfo += `└ ${chat.substring(0, 15)}... : ${mins}m ${secs}s\n`;
                }
            }
            
            await sock.sendMessage(chatId, {
                text: `🎙️⌨️ *AUTO-RECORD-TYPE STATUS*\n\n` +
                      `${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n` +
                      `🔄 Sessions: ${sessions} active` +
                      sessionsInfo,
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

// Helper functions
function getModeText(mode) {
    switch(mode) {
        case 'all': return '🌍 All Chats';
        case 'dms': return '💬 DMs Only';
        case 'groups': return '👥 Groups Only';
        default: return '🌍 All Chats';
    }
}

function getModeDescription(mode) {
    switch(mode) {
        case 'all': return 'Both indicators show in DMs and groups.';
        case 'dms': return 'Both indicators show only in DMs.';
        case 'groups': return 'Both indicators show only in groups.';
        default: return 'Both indicators show in DMs and groups.';
    }
}

// Update mode in both configs
async function updateBothConfigsMode(mode) {
    try {
        const paths = [
            path.join(__dirname, '..', 'data', 'autotyping.json'),
            path.join(__dirname, '..', 'data', 'autorecord.json')
        ];
        for (const p of paths) {
            if (fs.existsSync(p)) {
                let cfg = JSON.parse(fs.readFileSync(p));
                cfg.mode = mode;
                fs.writeFileSync(p, JSON.stringify(cfg, null, 2));
            }
        }
    } catch (e) {
        console.error('Error updating mode:', e);
    }
}

// Update duration in both configs
async function updateBothConfigsDuration(duration, infinite) {
    try {
        const paths = [
            path.join(__dirname, '..', 'data', 'autotyping.json'),
            path.join(__dirname, '..', 'data', 'autorecord.json')
        ];
        for (const p of paths) {
            if (fs.existsSync(p)) {
                let cfg = JSON.parse(fs.readFileSync(p));
                cfg.duration = duration;
                cfg.infinite = infinite;
                fs.writeFileSync(p, JSON.stringify(cfg, null, 2));
            }
        }
    } catch (e) {
        console.error('Error updating duration:', e);
    }
}

// Get statuses
async function getAutotypingStatus() {
    try {
        const p = path.join(__dirname, '..', 'data', 'autotyping.json');
        if (!fs.existsSync(p)) return '❌ Not configured';
        return JSON.parse(fs.readFileSync(p)).enabled ? '✅ Enabled' : '❌ Disabled';
    } catch (e) { return '❓ Unknown'; }
}

async function getAutorecordStatus() {
    try {
        const p = path.join(__dirname, '..', 'data', 'autorecord.json');
        if (!fs.existsSync(p)) return '❌ Not configured';
        return JSON.parse(fs.readFileSync(p)).enabled ? '✅ Enabled' : '❌ Disabled';
    } catch (e) { return '❓ Unknown'; }
}

function isAutorecordtypeEnabled() {
    try { return initConfig().enabled; } catch (e) { return false; }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    autorecordtypeCommand,
    isAutorecordtypeEnabled
};
