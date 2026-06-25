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
 * Autorecord Command - Shows fake recording status (with infinite mode)
 * Professional Version with Include/Exclude system
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '..', 'data', 'autorecord.json');
const activeInfiniteSessions = new Map();

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

// ═══════════════════════════════════════
// CONFIGURATION (Auto-migrate on update)
// ═══════════════════════════════════════

function initConfig() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        
        const configHash = JSON.stringify(defaultConfig);
        
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ ...defaultConfig, _hash: configHash }, null, 2));
        }
        
        const config = JSON.parse(fs.readFileSync(configPath));
        let needsUpdate = false;
        
        for (const [key, value] of Object.entries(defaultConfig)) {
            if (config[key] === undefined) {
                config[key] = value;
                needsUpdate = true;
            }
        }
        if (config._hash !== configHash) needsUpdate = true;
        
        if (needsUpdate) {
            config._hash = configHash;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('📝 Autorecord config migrated');
        }
        
        return config;
    } catch (error) { return { ...defaultConfig }; }
}

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════

function extractPhoneNumber(jid) {
    if (!jid) return null;
    return jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
}

function isNumberInList(jid, message) {
    const config = initConfig();
    if (!config.numberList || config.numberList.length === 0) return null;

    const chatId = message.key.remoteJid;
    const isGroup = chatId?.endsWith('@g.us');
    let phone = null;

    if (isGroup) {
        const participant = message.key.participant || message.participant;
        if (participant) {
            if (message.key.participantAlt?.includes('@s.whatsapp.net')) {
                phone = extractPhoneNumber(message.key.participantAlt);
            } else if (!participant.endsWith('@lid')) {
                phone = extractPhoneNumber(participant);
            } else {
                try {
                    const store = require('./lightweight_store');
                    const contact = store.contacts[participant];
                    if (contact?.id?.includes('@s.whatsapp.net')) phone = extractPhoneNumber(contact.id);
                } catch (e) {}
            }
        }
    } else {
        if (message.key.remoteJidAlt?.includes('@s.whatsapp.net')) {
            phone = extractPhoneNumber(message.key.remoteJidAlt);
        } else {
            phone = extractPhoneNumber(jid);
        }
    }

    if (!phone || phone.length < 7) return null;
    const found = config.numberList.some(num => phone === num || phone.endsWith(num) || num.endsWith(phone));
    return config.includeMode ? found : !found;
}

function stopInfiniteRecording(chatId) {
    const session = activeInfiniteSessions.get(chatId);
    if (session && session.intervalId) { clearInterval(session.intervalId); activeInfiniteSessions.delete(chatId); return true; }
    return false;
}

function stopAllInfiniteRecordings() {
    let count = 0;
    for (const [chatId, session] of activeInfiniteSessions.entries()) { clearInterval(session.intervalId); activeInfiniteSessions.delete(chatId); count++; }
    if (count > 0) console.log(`🛑 Stopped ${count} infinite recording sessions`);
    return count;
}

async function startInfiniteRecording(sock, chatId) {
    stopInfiniteRecording(chatId);
    try {
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(300);
        await sock.sendPresenceUpdate('recording', chatId);
        const session = { chatId, startTime: Date.now(), refreshCount: 0 };
        session.intervalId = setInterval(async () => {
            try { await sock.sendPresenceUpdate('recording', chatId); session.refreshCount++; } catch (e) { stopInfiniteRecording(chatId); }
        }, 10000);
        activeInfiniteSessions.set(chatId, session);
        return true;
    } catch (e) { return false; }
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
        case 'all': return 'Recording indicators will show in both DMs and groups.';
        case 'dms': return 'Recording indicators will show only in private messages.';
        case 'groups': return 'Recording indicators will show only in group chats.';
        default: return 'Recording indicators will show in both DMs and groups.';
    }
}

function shouldShowRecording(chatId, message) {
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
        
        if (message) {
            const listResult = isNumberInList(chatId, message);
            if (listResult !== null && !listResult) return false;
        }
        
        return true;
    } catch (e) { return false; }
}

function isAutorecordEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

// ═══════════════════════════════════════
// RECORDING HANDLERS
// ═══════════════════════════════════════

async function handleAutorecordForMessage(sock, chatId, userMessage, message) {
    if (!shouldShowRecording(chatId, message)) return false;
    try {
        const config = initConfig();
        if (config.infinite) return await startInfiniteRecording(sock, chatId);
        const duration = config.duration || DEFAULT_DURATION;
        const refreshMs = duration <= 10 ? 2000 : 5000;
        const totalLoops = Math.floor((duration * 1000) / refreshMs);
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('recording', chatId);
        for (let i = 0; i < totalLoops; i++) { await delay(refreshMs); await sock.sendPresenceUpdate('recording', chatId); }
        await delay(1000);
        await sock.sendPresenceUpdate('paused', chatId);
        return true;
    } catch (e) { return false; }
}

async function handleAutorecordForCommand(sock, chatId, message) { return await handleAutorecordForMessage(sock, chatId, '', message); }
async function showRecordingAfterCommand(sock, chatId, message) { return await handleAutorecordForMessage(sock, chatId, '', message); }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

async function autorecordCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        if (!message.key.fromMe && !isOwner) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo });
            return;
        }

        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        let commandPart = userMessage.trim();
        if (commandPart.startsWith('.')) commandPart = commandPart.substring(1);
        const parts = commandPart.split(/\s+/);
        const args = parts.slice(1);
        const config = initConfig();

        if (args.length === 0) {
            const status = config.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = config.enabled ? '🟢' : '🔴';
            const modeText = getModeText(config.mode);
            const infiniteStatus = config.infinite ? '♾️ ON' : '⏱️ OFF';
            const sessions = activeInfiniteSessions.size;
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';

            await sock.sendMessage(chatId, {
                text: `🎙️ *AUTO-RECORD SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n` +
                      `♾️ *Infinite Mode:* ${infiniteStatus}\n` +
                      `🔢 *Filter:* ${filterMode} (${config.numberList.length} numbers)\n` +
                      `🔄 *Active Sessions:* ${sessions}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autorecord on - Enable auto-record\n` +
                      `└ .autorecord off - Disable auto-record\n` +
                      `└ .autorecord mode all - All chats\n` +
                      `└ .autorecord mode dms - DMs only\n` +
                      `└ .autorecord mode groups - Groups only\n` +
                      `└ .autorecord duration <seconds> - Set duration (5-120)\n` +
                      `└ .autorecord duration infinite - Unlimited recording\n` +
                      `└ .autorecord infinite on/off/stop - Infinite mode\n` +
                      `└ .autorecord status - Show settings\n` +
                      `└ .autorecord include add <numbers> - Record only these\n` +
                      `└ .autorecord include remove <numbers>\n` +
                      `└ .autorecord exclude add <numbers> - Skip these\n` +
                      `└ .autorecord exclude remove <numbers>\n` +
                      `└ .autorecord includelist / excludelist\n` +
                      `└ .autorecord includeclear / excludeclear\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Examples:*\n` +
                      `└ .autorecord duration 30\n` +
                      `└ .autorecord infinite on\n` +
                      `└ .autorecord include add 2347012345678`,
                ...channelInfo
            });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'on' || action === 'enable') {
            if (config.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️ Auto-Record is already *ON*.\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n\n💡 Use .autorecord off to disable.`,
                    ...channelInfo
                });
                return;
            }
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `✅ *AUTO-RECORD ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n\n📌 Recording indicators active in ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
            if (config.infinite && shouldShowRecording(chatId, null)) await startInfiniteRecording(sock, chatId);
        }
        else if (action === 'off' || action === 'disable') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️ Auto-Record is already *OFF*.\n\n💡 Use .autorecord on to enable.`,
                    ...channelInfo
                });
                return;
            }
            const stopped = stopAllInfiniteRecordings();
            config.enabled = false;
            config.infinite = false;
            config.duration = DEFAULT_DURATION;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `❌ *AUTO-RECORD DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Recording stopped.\n🔄 Stopped ${stopped} active session(s).\n⏱️ Duration reset to ${DEFAULT_DURATION}s.\n\n💡 Use .autorecord on to enable.`,
                ...channelInfo
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecord mode <all/dms/groups>\n\n✨ *Example:*\n└ .autorecord mode groups`,
                    ...channelInfo
                });
                return;
            }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                if (config.mode === mode) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode is already *${getModeText(mode)}*.\n\n💡 No changes needed.`,
                        ...channelInfo
                    });
                    return;
                }
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}`,
                    ...channelInfo
                });
            } else {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Available: all, dms, groups`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'duration') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecord duration <seconds>\n💡 Use 'infinite' for unlimited\n\n✨ *Example:*\n└ .autorecord duration 30\n└ .autorecord duration infinite`,
                    ...channelInfo
                });
                return;
            }
            if (args[1].toLowerCase() === 'infinite') {
                if (config.infinite) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *ALREADY INFINITE*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite recording is already *ON*.\n\n💡 Use .autorecord infinite off to disable.`,
                        ...channelInfo
                    });
                    return;
                }
                config.infinite = true;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Recording will continue indefinitely.\n🔄 Auto-refresh every 10 seconds.\n\n💡 Use .autorecord infinite stop to stop.`,
                    ...channelInfo
                });
                if (config.enabled && shouldShowRecording(chatId, null)) await startInfiniteRecording(sock, chatId);
                return;
            }
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *INVALID DURATION*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Duration must be between 5-120 seconds.\n💡 Use 'infinite' for unlimited.`,
                    ...channelInfo
                });
                return;
            }
            if (config.duration === duration && !config.infinite) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n⏱️ Duration is already *${duration} seconds*.\n\n💡 Use .autorecord duration <new value> to change.`,
                    ...channelInfo
                });
                return;
            }
            config.duration = duration;
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            stopAllInfiniteRecordings();
            await sock.sendMessage(chatId, {
                text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Recording duration: ${duration} seconds\n└ Infinite mode: OFF`,
                ...channelInfo
            });
        }
        else if (action === 'infinite') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Status: ${config.infinite ? '✅ ON' : '❌ OFF'}\n🔄 Active Sessions: ${activeInfiniteSessions.size}\n\n📖 Commands:\n└ .autorecord infinite on\n└ .autorecord infinite off\n└ .autorecord infinite stop`,
                    ...channelInfo
                });
                return;
            }
            const sub = args[1].toLowerCase();
            if (sub === 'on' || sub === 'enable') {
                if (config.infinite) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *ALREADY INFINITE*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite is already *ON*.\n\n💡 Use .autorecord infinite off to disable.`,
                        ...channelInfo
                    });
                    return;
                }
                config.infinite = true;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `♾️ *INFINITE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Recording will continue indefinitely.\n🔄 Auto-refresh every 10 seconds.`,
                    ...channelInfo
                });
                if (config.enabled && shouldShowRecording(chatId, null)) await startInfiniteRecording(sock, chatId);
            }
            else if (sub === 'off' || sub === 'disable') {
                if (!config.infinite) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite is already *OFF*.\n\n💡 Use .autorecord infinite on to enable.`,
                        ...channelInfo
                    });
                    return;
                }
                config.infinite = false;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                const stopped = stopAllInfiniteRecordings();
                await sock.sendMessage(chatId, {
                    text: `⏱️ *INFINITE DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Stopped ${stopped} session(s).\n⏱️ Duration reset to ${DEFAULT_DURATION}s.`,
                    ...channelInfo
                });
            }
            else if (sub === 'stop') {
                const stopped = stopAllInfiniteRecordings();
                await sock.sendMessage(chatId, {
                    text: stopped > 0
                        ? `🛑 *STOPPED*\n\n━━━━━━━━━━━━━━━━━━━━\n🔄 Stopped ${stopped} active recording session(s).\n\n💡 Recording will resume on next message.`
                        : `⚠️ *NO ACTIVE SESSIONS*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 No infinite recording sessions running.`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'include') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecord include add <numbers>\n\n✨ *Single:* .autorecord include add 2347012345678\n✨ *Bulk:* .autorecord include add 2347012345678,2349012345678\n\n⚠️ Full number with country code is required`,
                        ...channelInfo
                    });
                    return;
                }
                config.includeMode = true;
                const added = [];
                for (const num of numbers) {
                    if (!config.numberList.includes(num)) { config.numberList.push(num); added.push(num); }
                }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *INCLUDE ADDED*\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📌 *Mode:* Include Only\n` +
                          `🔢 *Added:* ${added.length} number(s)\n` +
                          `${added.map(n => `└ +${n}`).join('\n')}\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📊 *Total in list:* ${config.numberList.length}\n\n` +
                          `💡 Recording will ONLY show for these numbers.`,
                    ...channelInfo
                });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecord include remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *INCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - config.numberList.length} number(s).\n📊 Remaining: ${config.numberList.length}\n\n💡 Recording will ONLY show for listed numbers.`,
                    ...channelInfo
                });
            }
            else {
                await sock.sendMessage(chatId, {
                    text: `📋 *INCLUDE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 *Numbers:* ${config.numberList.length}\n\n📖 .autorecord include add <numbers>\n📖 .autorecord include remove <numbers>\n📖 .autorecord includelist\n📖 .autorecord includeclear`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'exclude') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) {
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecord exclude add <numbers>\n\n✨ *Single:* .autorecord exclude add 2347012345678\n✨ *Bulk:* .autorecord exclude add 2347012345678,2349012345678\n\n⚠️ Full number with country code is required`,
                        ...channelInfo
                    });
                    return;
                }
                config.includeMode = false;
                const added = [];
                for (const num of numbers) {
                    if (!config.numberList.includes(num)) { config.numberList.push(num); added.push(num); }
                }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *EXCLUDE ADDED*\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📌 *Mode:* Exclude\n` +
                          `🔢 *Added:* ${added.length} number(s)\n` +
                          `${added.map(n => `└ +${n}`).join('\n')}\n\n` +
                          `━━━━━━━━━━━━━━━━━━━━\n` +
                          `📊 *Total excluded:* ${config.numberList.length}\n\n` +
                          `💡 Recording will NOT show for these numbers.`,
                    ...channelInfo
                });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autorecord exclude remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, {
                    text: `✅ *EXCLUDE REMOVED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Removed ${before - config.numberList.length} number(s).\n📊 Remaining: ${config.numberList.length}`,
                    ...channelInfo
                });
            }
            else {
                await sock.sendMessage(chatId, {
                    text: `📋 *EXCLUDE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 *Numbers:* ${config.numberList.length}\n\n📖 .autorecord exclude add <numbers>\n📖 .autorecord exclude remove <numbers>\n📖 .autorecord excludelist\n📖 .autorecord excludeclear`,
                    ...channelInfo
                });
            }
        }
        else if (action === 'includelist') {
            const pageNums = config.numberList;
            await sock.sendMessage(chatId, {
                text: `📋 *INCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 *Mode:* Include Only\n📊 *Total:* ${pageNums.length} numbers\n\n${pageNums.length > 0 ? pageNums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}\n\n💡 .autorecord include add <numbers>`,
                ...channelInfo
            });
        }
        else if (action === 'excludelist') {
            const pageNums = config.numberList;
            await sock.sendMessage(chatId, {
                text: `📋 *EXCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 *Mode:* Exclude\n📊 *Total:* ${pageNums.length} numbers\n\n${pageNums.length > 0 ? pageNums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}\n\n💡 .autorecord exclude add <numbers>`,
                ...channelInfo
            });
        }
        else if (action === 'includeclear') {
            if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 Include list is already empty.\n\n💡 Use .autorecord include add <numbers> to add.`, ...channelInfo }); return; }
            config.numberList = [];
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `✅ *INCLUDE LIST CLEARED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 All numbers removed.\n🌍 Recording will show for everyone again.`, ...channelInfo });
        }
        else if (action === 'excludeclear') {
            if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*\n\n━━━━━━━━━━━━━━━━━━━━\n📋 Exclude list is already empty.\n\n💡 Use .autorecord exclude add <numbers> to add.`, ...channelInfo }); return; }
            config.numberList = [];
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `✅ *EXCLUDE LIST CLEARED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 All numbers removed.\n🌍 Recording will show for everyone again.`, ...channelInfo });
        }
        else if (action === 'status') {
            const sessions = activeInfiniteSessions.size;
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';
            let info = '';
            if (sessions > 0) {
                for (const [chat, s] of activeInfiniteSessions.entries()) {
                    const t = Math.floor((Date.now() - s.startTime) / 1000);
                    info += `└ ${chat.substring(0, 15)}... : ${Math.floor(t / 60)}m ${t % 60}s\n`;
                }
            }
            await sock.sendMessage(chatId, {
                text: `🎙️ *AUTO-RECORD STATUS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n` +
                      `🎯 Mode: ${getModeText(config.mode)}\n` +
                      `⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n` +
                      `♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n` +
                      `🔢 Filter: ${filterMode} (${config.numberList.length})\n` +
                      `🔄 Sessions: ${sessions}${info ? '\n\n' + info : ''}`,
                ...channelInfo
            });
        }
        else {
            await sock.sendMessage(chatId, {
                text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .autorecord to see all available options.\n\n✨ *Examples:*\n└ .autorecord on\n└ .autorecord duration 30\n└ .autorecord infinite on`,
                ...channelInfo
            });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

module.exports = {
    autorecordCommand, isAutorecordEnabled, shouldShowRecording,
    handleAutorecordForMessage, handleAutorecordForCommand, showRecordingAfterCommand,
    stopInfiniteRecording, stopAllInfiniteRecordings, startInfiniteRecording, initConfig
};
