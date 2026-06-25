//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                                                        //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                                                     //
//                                                                                                                                                                                        //
//                                                                  𝐕 : 1.0.0                                                                                                             //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                                 //
//                                                                                                                                                                                        //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                                                        //
//                                                                                                                                                                                        //
//                                                                                                                                                                                        //
//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//* 
//  * project_name : WALLYJAYTECH-MD
//  * author : wallyjaytech
//  * youtube : https://www.youtube.com/wallyjaytechy
//  * description : WALLYJAYTECH-MD ,A Multi-Device whatsapp user bot.
//*
//*
//re-upload? recode? copy code? give credit to wallyjaytech 2025:)
//Instagram: wallyjaytech
//Telegram: t.me/wallyjaytech
//GitHub: wallyjaytechh
//WhatsApp: +2348144317152
//want more free bot scripts? subscribe to my youtube channel: https://youtube.com/@wallyjaytechy
//   * Created By Github: wallyjaytechh.
//   * Credit To ally jay tech
//   * © 2025 WALLYJAYTECH-MD.
// ⛥┌┤
// */
/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecordtype Command - Turn on both autotyping AND autorecord with one command
 * Alternates every 5 seconds for BOTH infinite and timed modes
 * Professional Version with Include/Exclude system
 * FINAL FIX: 
 * - Recording shows first, then typing alternates
 * - Continuous alternating for full duration
 * - All changes sync to autotyping and autorecord
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '..', 'data', 'autorecordtype.json');
const activeSessions = new Map();

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

const DEFAULT_DURATION = 60;

const defaultConfig = {
    enabled: false,
    mode: 'all',
    duration: DEFAULT_DURATION,
    infinite: false,
    includeMode: false,
    numberList: []
};

// Auto-create data files
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const defaultConfigs = {
    'autorecordtype.json': {
        enabled: false,
        mode: 'all',
        duration: DEFAULT_DURATION,
        infinite: false,
        includeMode: false,
        numberList: []
    },
    'autotyping.json': {
        enabled: false,
        mode: 'all',
        duration: DEFAULT_DURATION,
        infinite: false,
        includeMode: false,
        numberList: []
    },
    'autorecord.json': {
        enabled: false,
        mode: 'all',
        duration: DEFAULT_DURATION,
        infinite: false,
        includeMode: false,
        numberList: []
    }
};

for (const [file, content] of Object.entries(defaultConfigs)) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`📁 Created: ${file}`);
    }
}

// ═══════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════

function initConfig() {
    try {
        const configHash = JSON.stringify(defaultConfig);
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ ...defaultConfig, _hash: configHash }, null, 2));
        }
        const config = JSON.parse(fs.readFileSync(configPath));
        let needsUpdate = false;
        for (const [key, value] of Object.entries(defaultConfig)) {
            if (config[key] === undefined) { config[key] = value; needsUpdate = true; }
        }
        if (config._hash !== configHash) needsUpdate = true;
        if (needsUpdate) {
            config._hash = configHash;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('📝 Autorecordtype config migrated');
        }
        return config;
    } catch (error) { 
        console.error('❌ Error reading config:', error);
        return { ...defaultConfig }; 
    }
}

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════

function extractPhoneNumber(jid) {
    if (!jid) return null;
    if (jid.endsWith('@lid')) return null;
    let phone = jid.split('@')[0];
    if (phone.includes(':')) phone = phone.split(':')[0];
    phone = phone.replace(/[^0-9]/g, '');
    return phone.length > 0 ? phone : null;
}

function isNumberInList(message) {
    const config = initConfig();
    if (!config.numberList || config.numberList.length === 0) return null;

    const chatId = message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    let senderJid = isGroup ? (message.key.participant || message.participant) : chatId;
    if (!senderJid) return null;
    
    let phone = null;
    if (senderJid.endsWith('@lid')) {
        const remoteJidAlt = message.key.remoteJidAlt;
        const participantAlt = message.key.participantAlt;
        if (remoteJidAlt?.includes('@s.whatsapp.net')) {
            phone = extractPhoneNumber(remoteJidAlt);
        } else if (participantAlt?.includes('@s.whatsapp.net')) {
            phone = extractPhoneNumber(participantAlt);
        }
    } else {
        phone = extractPhoneNumber(senderJid);
    }
    
    if (!phone || phone.length < 7) return null;
    const found = config.numberList.some(num => {
        const normalizedNum = num.replace(/[^0-9]/g, '');
        return phone === normalizedNum || phone.endsWith(normalizedNum) || normalizedNum.endsWith(phone);
    });
    return config.includeMode ? found : !found;
}

function stopAlternatingSession(chatId) {
    const s = activeSessions.get(chatId);
    if (s?.intervalId) { clearInterval(s.intervalId); activeSessions.delete(chatId); return true; }
    return false;
}

function stopAllAlternatingSessions() {
    let c = 0;
    for (const [id, s] of activeSessions.entries()) { clearInterval(s.intervalId); activeSessions.delete(id); c++; }
    return c;
}

// ✅ Professional: Recording first, continuous alternating for full duration
async function startAlternatingSession(sock, chatId, duration, infinite) {
    stopAlternatingSession(chatId);
    try {
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(300);
        
        // Start with RECORDING first
        let isRecording = true;
        let loopsDone = 0;
        const switchMs = 5000; // 5 seconds between switches
        const maxLoops = infinite ? Infinity : Math.floor((duration * 1000) / switchMs);
        
        await sock.sendPresenceUpdate('recording', chatId);
        console.log(`🎙️ Autorecordtype started: RECORDING in ${chatId} (0/${maxLoops === Infinity ? '∞' : maxLoops})`);
        
        const session = { 
            chatId, 
            startTime: Date.now(), 
            refreshCount: 0, 
            isRecording: true,
            isRunning: true,
            loopsDone: 0,
            maxLoops: maxLoops
        };
        
        session.intervalId = setInterval(async () => {
            try {
                loopsDone++;
                if (!infinite && loopsDone >= maxLoops) {
                    await sock.sendPresenceUpdate('paused', chatId);
                    console.log(`⏹️ Autorecordtype finished in ${chatId} after ${loopsDone} loops`);
                    session.isRunning = false;
                    stopAlternatingSession(chatId);
                    return;
                }
                
                // Alternate between recording and typing
                isRecording = !isRecording;
                if (isRecording) {
                    await sock.sendPresenceUpdate('recording', chatId);
                    console.log(`🎙️ Autorecordtype: RECORDING in ${chatId} (${loopsDone}/${maxLoops === Infinity ? '∞' : maxLoops})`);
                } else {
                    await sock.sendPresenceUpdate('composing', chatId);
                    console.log(`⌨️ Autorecordtype: TYPING in ${chatId} (${loopsDone}/${maxLoops === Infinity ? '∞' : maxLoops})`);
                }
                session.refreshCount++;
                session.loopsDone = loopsDone;
            } catch (e) {
                console.error(`❌ Autorecordtype error in ${chatId}:`, e.message);
                session.isRunning = false;
                stopAlternatingSession(chatId);
            }
        }, switchMs);
        
        activeSessions.set(chatId, session);
        return true;
    } catch (e) { 
        console.error(`❌ Failed to start alternating session in ${chatId}:`, e.message);
        return false; 
    }
}

// ✅ Enable BOTH autotyping and autorecord with full config sync
async function enableIndividualHandlers() {
    console.log(`🔍 DEBUG: Enabling individual handlers...`);
    
    const config = initConfig();
    
    const typingPath = path.join(__dirname, '..', 'data', 'autotyping.json');
    if (fs.existsSync(typingPath)) {
        let c = JSON.parse(fs.readFileSync(typingPath));
        c.enabled = true;
        c.mode = config.mode;
        c.duration = config.duration;
        c.infinite = config.infinite;
        c.includeMode = config.includeMode;
        c.numberList = config.numberList;
        fs.writeFileSync(typingPath, JSON.stringify(c, null, 2));
        console.log(`✅ Enabled & Synced: autotyping.json`);
    } else {
        const defaultTyping = { 
            enabled: true, 
            mode: config.mode, 
            duration: config.duration, 
            infinite: config.infinite, 
            includeMode: config.includeMode, 
            numberList: config.numberList 
        };
        fs.writeFileSync(typingPath, JSON.stringify(defaultTyping, null, 2));
        console.log(`✅ Created, enabled & synced: autotyping.json`);
    }

    const recordPath = path.join(__dirname, '..', 'data', 'autorecord.json');
    if (fs.existsSync(recordPath)) {
        let c = JSON.parse(fs.readFileSync(recordPath));
        c.enabled = true;
        c.mode = config.mode;
        c.duration = config.duration;
        c.infinite = config.infinite;
        c.includeMode = config.includeMode;
        c.numberList = config.numberList;
        fs.writeFileSync(recordPath, JSON.stringify(c, null, 2));
        console.log(`✅ Enabled & Synced: autorecord.json`);
    } else {
        const defaultRecord = { 
            enabled: true, 
            mode: config.mode, 
            duration: config.duration, 
            infinite: config.infinite, 
            includeMode: config.includeMode, 
            numberList: config.numberList 
        };
        fs.writeFileSync(recordPath, JSON.stringify(defaultRecord, null, 2));
        console.log(`✅ Created, enabled & synced: autorecord.json`);
    }
}

// ✅ Disable BOTH autotyping and autorecord
async function disableIndividualHandlers() {
    console.log(`🔍 DEBUG: Disabling individual handlers...`);
    
    const typingPath = path.join(__dirname, '..', 'data', 'autotyping.json');
    if (fs.existsSync(typingPath)) {
        let c = JSON.parse(fs.readFileSync(typingPath));
        c.enabled = false;
        fs.writeFileSync(typingPath, JSON.stringify(c, null, 2));
        console.log(`🔒 Disabled: autotyping.json`);
    }

    const recordPath = path.join(__dirname, '..', 'data', 'autorecord.json');
    if (fs.existsSync(recordPath)) {
        let c = JSON.parse(fs.readFileSync(recordPath));
        c.enabled = false;
        fs.writeFileSync(recordPath, JSON.stringify(c, null, 2));
        console.log(`🔒 Disabled: autorecord.json`);
    }
}

// ✅ Full config sync to individual handlers
async function syncConfigToIndividual(mode, duration, infinite, includeMode, numberList) {
    ['autotyping.json', 'autorecord.json'].forEach(f => {
        const p = path.join(__dirname, '..', 'data', f);
        if (fs.existsSync(p)) {
            let c = JSON.parse(fs.readFileSync(p));
            c.mode = mode;
            c.duration = duration;
            c.infinite = infinite;
            c.includeMode = includeMode;
            c.numberList = numberList;
            fs.writeFileSync(p, JSON.stringify(c, null, 2));
            console.log(`📝 Synced config to: ${f} (mode=${mode}, duration=${duration}, infinite=${infinite})`);
        }
    });
}

async function disableBoth() {
    ['autotyping.json', 'autorecord.json'].forEach(f => {
        const p = path.join(__dirname, '..', 'data', f);
        if (fs.existsSync(p)) {
            let c = JSON.parse(fs.readFileSync(p));
            c.enabled = false;
            c.infinite = false;
            c.duration = DEFAULT_DURATION;
            fs.writeFileSync(p, JSON.stringify(c, null, 2));
        }
    });
    stopAllAlternatingSessions();
}

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
        case 'all': return 'Both indicators will show in DMs and groups.';
        case 'dms': return 'Both indicators will show only in private messages.';
        case 'groups': return 'Both indicators will show only in group chats.';
        default: return 'Both indicators will show in DMs and groups.';
    }
}

function isAutorecordtypeEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════
// HANDLER FUNCTIONS
// ═══════════════════════════════════════

async function handleAutorecordtypeForMessage(sock, chatId, userMessage, message) {
    try {
        const config = initConfig();
        if (!config.enabled) return false;
        
        const isGroup = chatId.endsWith('@g.us');
        switch(config.mode) {
            case 'all': break;
            case 'dms': if (isGroup) return false; break;
            case 'groups': if (!isGroup) return false; break;
            default: break;
        }
        
        return true;
    } catch (e) { return false; }
}

async function handleAutorecordtypeForCommand(sock, chatId, message) {
    return await handleAutorecordtypeForMessage(sock, chatId, '', message);
}

async function showAutorecordtypeAfterCommand(sock, chatId, message) {
    return await handleAutorecordtypeForMessage(sock, chatId, '', message);
}

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

async function autorecordtypeCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo });
            return;
        }

        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        let cp = userMessage.trim();
        if (cp.startsWith('.')) cp = cp.substring(1);
        const parts = cp.split(/\s+/);
        const args = parts.slice(1);
        const config = initConfig();

        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';
            const activeCount = activeSessions.size;

            await sock.sendMessage(chatId, {
                text: `🎙️⌨️ *AUTO-RECORD-TYPE SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `🎯 *Mode:* ${getModeText(config.mode)}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n` +
                      `♾️ *Infinite:* ${config.infinite ? 'ON' : 'OFF'}\n` +
                      `🔢 *Filter:* ${filterMode} (${config.numberList.length} numbers)\n` +
                      `🔄 *Active Sessions:* ${activeCount}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autorecordtype on - Enable both\n` +
                      `└ .autorecordtype off - Disable both\n` +
                      `└ .autorecordtype mode all/dms/groups\n` +
                      `└ .autorecordtype duration <seconds>\n` +
                      `└ .autorecordtype duration infinite\n` +
                      `└ .autorecordtype status - Show settings\n` +
                      `└ .autorecordtype include add <numbers>\n` +
                      `└ .autorecordtype include remove <numbers>\n` +
                      `└ .autorecordtype exclude add <numbers>\n` +
                      `└ .autorecordtype exclude remove <numbers>\n` +
                      `└ .autorecordtype includelist / excludelist\n` +
                      `└ .autorecordtype includeclear / excludeclear\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🔄 *Alternates recording/typing every 5 seconds*\n` +
                      `🎙️ *Starts with RECORDING first*\n` +
                      `✅ *Individual auto-typing/recording ENABLED & SYNCED for each message*\n\n` +
                      `💡 *Examples:*\n` +
                      `└ .autorecordtype duration infinite\n` +
                      `└ .autorecordtype include add 2347012345678`,
                ...channelInfo
            });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'on' || action === 'enable') {
            if (config.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️⌨️ Auto-Record-Type is already *ON*.\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n\n💡 Use .autorecordtype off to disable.`,
                    ...channelInfo
                });
                return;
            }
            
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            await enableIndividualHandlers();
            
            await sock.sendMessage(chatId, {
                text: `✅ *AUTO-RECORD-TYPE ENABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n\n` +
                      `✅ Auto-typing: ENABLED\n` +
                      `✅ Auto-record: ENABLED\n` +
                      `🔄 Alternating every 5 seconds\n` +
                      `🎙️ Starting with RECORDING\n\n` +
                      `📌 Both indicators active in ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
            
            await startAlternatingSession(sock, chatId, config.duration, config.infinite);
        }
        else if (action === 'off' || action === 'disable') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️⌨️ Auto-Record-Type is already *OFF*.\n\n💡 Use .autorecordtype on to enable.`,
                    ...channelInfo
                });
                return;
            }
            const stopped = stopAllAlternatingSessions();
            config.enabled = false;
            config.infinite = false;
            config.duration = DEFAULT_DURATION;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await disableBoth();
            
            await sock.sendMessage(chatId, {
                text: `❌ *AUTO-RECORD-TYPE DISABLED*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🛑 Both typing & recording stopped.\n` +
                      `🔄 Stopped ${stopped} active session(s).\n` +
                      `⏱️ Duration reset to ${DEFAULT_DURATION}s.\n\n` +
                      `💡 Use .autorecordtype on to enable.`,
                ...channelInfo
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecordtype mode <all/dms/groups>`, ...channelInfo });
                return;
            }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                if (config.mode === mode) {
                    await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n🎯 Mode is already *${getModeText(mode)}*.`, ...channelInfo });
                    return;
                }
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await syncConfigToIndividual(mode, config.duration, config.infinite, config.includeMode, config.numberList);
                await sock.sendMessage(chatId, {
                    text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ *INVALID MODE*\n\n📖 Available: all, dms, groups`, ...channelInfo });
            }
        }
        else if (action === 'duration') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecordtype duration <seconds> or infinite`, ...channelInfo });
                return;
            }
            if (args[1].toLowerCase() === 'infinite') {
                if (config.infinite) {
                    await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*`, ...channelInfo });
                    return;
                }
                config.infinite = true;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await syncConfigToIndividual(config.mode, config.duration, true, config.includeMode, config.numberList);
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Both typing & recording will alternate every 5 seconds indefinitely.\n🎙️ Starting with RECORDING`,
                    ...channelInfo
                });
                if (config.enabled) {
                    stopAllAlternatingSessions();
                    await startAlternatingSession(sock, chatId, config.duration, true);
                }
                return;
            }
            const d = parseInt(args[1]);
            if (isNaN(d) || d < 5 || d > 120) {
                await sock.sendMessage(chatId, { text: `⚠️ *INVALID DURATION*\n\n📌 5-120 seconds or use 'infinite'.`, ...channelInfo });
                return;
            }
            if (config.duration === d && !config.infinite) {
                await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n⏱️ Duration is already *${d}s*.`, ...channelInfo });
                return;
            }
            config.duration = d;
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await syncConfigToIndividual(config.mode, d, false, config.includeMode, config.numberList);
            stopAllAlternatingSessions();
            await sock.sendMessage(chatId, {
                text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Both typing & recording: ${d} seconds\n└ Infinite mode: OFF`,
                ...channelInfo
            });
            if (config.enabled) {
                await startAlternatingSession(sock, chatId, d, false);
            }
        }
        else if (action === 'include') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecordtype include add 2347012345678`, ...channelInfo });
                    return;
                }
                config.includeMode = true;
                for (const num of numbers) { if (!config.numberList.includes(num)) config.numberList.push(num); }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await syncConfigToIndividual(config.mode, config.duration, config.infinite, true, config.numberList);
                await sock.sendMessage(chatId, { text: `✅ *INCLUDE ADDED*\n\n📌 Mode: Include Only\n🔢 Added ${numbers.length} number(s)`, ...channelInfo });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecordtype include remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await syncConfigToIndividual(config.mode, config.duration, config.infinite, true, config.numberList);
                await sock.sendMessage(chatId, { text: `✅ *INCLUDE REMOVED*\n\n📌 Removed ${before - config.numberList.length} number(s).`, ...channelInfo });
            }
            else { await sock.sendMessage(chatId, { text: `📋 *INCLUDE MODE*\n\n🔢 Numbers: ${config.numberList.length}`, ...channelInfo }); }
        }
        else if (action === 'exclude') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecordtype exclude add 2347012345678`, ...channelInfo });
                    return;
                }
                config.includeMode = false;
                for (const num of numbers) { if (!config.numberList.includes(num)) config.numberList.push(num); }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await syncConfigToIndividual(config.mode, config.duration, config.infinite, false, config.numberList);
                await sock.sendMessage(chatId, { text: `✅ *EXCLUDE ADDED*\n\n📌 Mode: Exclude\n🔢 Added ${numbers.length} number(s)`, ...channelInfo });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecordtype exclude remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await syncConfigToIndividual(config.mode, config.duration, config.infinite, false, config.numberList);
                await sock.sendMessage(chatId, { text: `✅ *EXCLUDE REMOVED*\n\n📌 Removed ${before - config.numberList.length} number(s).`, ...channelInfo });
            }
            else { await sock.sendMessage(chatId, { text: `📋 *EXCLUDE MODE*\n\n🔢 Numbers: ${config.numberList.length}`, ...channelInfo }); }
        }
        else if (action === 'includelist') {
            const nums = config.numberList;
            await sock.sendMessage(chatId, { text: `📋 *INCLUDE LIST*\n\n🔢 Mode: Include Only\n📊 Total: ${nums.length}\n\n${nums.map((n, i) => `${i + 1}. +${n}`).join('\n')}`, ...channelInfo });
        }
        else if (action === 'excludelist') {
            const nums = config.numberList;
            await sock.sendMessage(chatId, { text: `📋 *EXCLUDE LIST*\n\n🔢 Mode: Exclude\n📊 Total: ${nums.length}\n\n${nums.map((n, i) => `${i + 1}. +${n}`).join('\n')}`, ...channelInfo });
        }
        else if (action === 'includeclear') {
            if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*`, ...channelInfo }); return; }
            config.numberList = [];
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await syncConfigToIndividual(config.mode, config.duration, config.infinite, config.includeMode, []);
            await sock.sendMessage(chatId, { text: `✅ *INCLUDE LIST CLEARED*`, ...channelInfo });
        }
        else if (action === 'excludeclear') {
            if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*`, ...channelInfo }); return; }
            config.numberList = [];
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await syncConfigToIndividual(config.mode, config.duration, config.infinite, config.includeMode, []);
            await sock.sendMessage(chatId, { text: `✅ *EXCLUDE LIST CLEARED*`, ...channelInfo });
        }
        else if (action === 'status') {
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';
            const activeCount = activeSessions.size;
            await sock.sendMessage(chatId, {
                text: `🎙️⌨️ *AUTO-RECORD-TYPE STATUS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n` +
                      `♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n` +
                      `🔢 Filter: ${filterMode} (${config.numberList.length})\n` +
                      `🔄 Sessions: ${activeCount}`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, { text: `⚠️ *INVALID COMMAND*\n\n📖 Use .autorecordtype to see all options.`, ...channelInfo });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

module.exports = { 
    autorecordtypeCommand, 
    isAutorecordtypeEnabled,
    handleAutorecordtypeForMessage,
    handleAutorecordtypeForCommand,
    showAutorecordtypeAfterCommand
};
