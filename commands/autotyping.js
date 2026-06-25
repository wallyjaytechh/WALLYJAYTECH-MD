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
 * Autotyping Command - Shows fake typing status (with infinite mode)
 * Professional Version with Include/Exclude system
 */

const fs = require('fs');
const path = require('path');
const isOwnerOrSudo = require('../lib/isOwner');

const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');
const activeInfiniteTypingSessions = new Map();

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
            if (config[key] === undefined) { config[key] = value; needsUpdate = true; }
        }
        if (config._hash !== configHash) needsUpdate = true;
        
        if (needsUpdate) {
            config._hash = configHash;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log('📝 Autotyping config migrated');
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

function stopInfiniteTyping(chatId) {
    const session = activeInfiniteTypingSessions.get(chatId);
    if (session && session.intervalId) { clearInterval(session.intervalId); activeInfiniteTypingSessions.delete(chatId); return true; }
    return false;
}

function stopAllInfiniteTyping() {
    let count = 0;
    for (const [chatId, session] of activeInfiniteTypingSessions.entries()) { clearInterval(session.intervalId); activeInfiniteTypingSessions.delete(chatId); count++; }
    if (count > 0) console.log(`🛑 Stopped ${count} infinite typing sessions`);
    return count;
}

async function startInfiniteTyping(sock, chatId) {
    stopInfiniteTyping(chatId);
    try {
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(300);
        await sock.sendPresenceUpdate('composing', chatId);
        const session = { chatId, startTime: Date.now(), refreshCount: 0 };
        session.intervalId = setInterval(async () => {
            try { await sock.sendPresenceUpdate('composing', chatId); session.refreshCount++; } catch (e) { stopInfiniteTyping(chatId); }
        }, 10000);
        activeInfiniteTypingSessions.set(chatId, session);
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
        case 'all': return 'Typing indicators will show in both DMs and groups.';
        case 'dms': return 'Typing indicators will show only in private messages.';
        case 'groups': return 'Typing indicators will show only in group chats.';
        default: return 'Typing indicators will show in both DMs and groups.';
    }
}

function shouldShowTyping(chatId, message) {
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

function isAutotypingEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ═══════════════════════════════════════
// TYPING HANDLERS
// ═══════════════════════════════════════

async function handleAutotypingForMessage(sock, chatId, userMessage, message) {
    if (!shouldShowTyping(chatId, message)) return false;
    try {
        const config = initConfig();
        if (config.infinite) return await startInfiniteTyping(sock, chatId);
        const duration = config.duration || DEFAULT_DURATION;
        const refreshMs = duration <= 10 ? 2000 : 5000;
        const totalLoops = Math.floor((duration * 1000) / refreshMs);
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('composing', chatId);
        for (let i = 0; i < totalLoops; i++) { await delay(refreshMs); await sock.sendPresenceUpdate('composing', chatId); }
        await delay(1000);
        await sock.sendPresenceUpdate('paused', chatId);
        return true;
    } catch (e) { return false; }
}

async function handleAutotypingForCommand(sock, chatId, message) { return await handleAutotypingForMessage(sock, chatId, '', message); }
async function showTypingAfterCommand(sock, chatId, message) { return await handleAutotypingForMessage(sock, chatId, '', message); }

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

async function autotypingCommand(sock, chatId, message) {
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
            const sessions = activeInfiniteTypingSessions.size;
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';

            await sock.sendMessage(chatId, {
                text: `⌨️ *AUTO-TYPING SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `🎯 *Mode:* ${modeText}\n` +
                      `⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n` +
                      `♾️ *Infinite Mode:* ${infiniteStatus}\n` +
                      `🔢 *Filter:* ${filterMode} (${config.numberList.length} numbers)\n` +
                      `🔄 *Active Sessions:* ${sessions}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .autotyping on - Enable auto-typing\n` +
                      `└ .autotyping off - Disable auto-typing\n` +
                      `└ .autotyping mode all - All chats\n` +
                      `└ .autotyping mode dms - DMs only\n` +
                      `└ .autotyping mode groups - Groups only\n` +
                      `└ .autotyping duration <seconds> - Set duration (5-120)\n` +
                      `└ .autotyping duration infinite - Unlimited typing\n` +
                      `└ .autotyping infinite on/off/stop - Infinite mode\n` +
                      `└ .autotyping status - Show settings\n` +
                      `└ .autotyping include add <numbers> - Type only for these\n` +
                      `└ .autotyping include remove <numbers>\n` +
                      `└ .autotyping exclude add <numbers> - Skip these\n` +
                      `└ .autotyping exclude remove <numbers>\n` +
                      `└ .autotyping includelist / excludelist\n` +
                      `└ .autotyping includeclear / excludeclear\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Examples:*\n` +
                      `└ .autotyping duration 30\n` +
                      `└ .autotyping infinite on\n` +
                      `└ .autotyping include add 2347012345678`,
                ...channelInfo
            });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'on' || action === 'enable') {
            if (config.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n⌨️ Auto-Typing is already *ON*.\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n\n💡 Use .autotyping off to disable.`,
                    ...channelInfo
                });
                return;
            }
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `✅ *AUTO-TYPING ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n\n📌 Typing indicators active in ${getModeDescription(config.mode)}`,
                ...channelInfo
            });
            if (config.infinite && shouldShowTyping(chatId, null)) await startInfiniteTyping(sock, chatId);
        }
        else if (action === 'off' || action === 'disable') {
            if (!config.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n⌨️ Auto-Typing is already *OFF*.\n\n💡 Use .autotyping on to enable.`,
                    ...channelInfo
                });
                return;
            }
            const stopped = stopAllInfiniteTyping();
            config.enabled = false;
            config.infinite = false;
            config.duration = DEFAULT_DURATION;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: `❌ *AUTO-TYPING DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Typing stopped.\n🔄 Stopped ${stopped} active session(s).\n⏱️ Duration reset to ${DEFAULT_DURATION}s.\n\n💡 Use .autotyping on to enable.`,
                ...channelInfo
            });
        }
        else if (action === 'mode') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autotyping mode <all/dms/groups>`, ...channelInfo });
                return;
            }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                if (config.mode === mode) {
                    await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode is already *${getModeText(mode)}*.`, ...channelInfo });
                    return;
                }
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}`, ...channelInfo });
            } else { await sock.sendMessage(chatId, { text: `⚠️ *INVALID MODE*\n\n📖 Available: all, dms, groups`, ...channelInfo }); }
        }
        else if (action === 'duration') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autotyping duration <seconds> or infinite`, ...channelInfo });
                return;
            }
            if (args[1].toLowerCase() === 'infinite') {
                if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite typing is already *ON*.`, ...channelInfo }); return; }
                config.infinite = true; config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Typing will continue indefinitely.\n🔄 Auto-refresh every 10 seconds.`, ...channelInfo });
                if (config.enabled && shouldShowTyping(chatId, null)) await startInfiniteTyping(sock, chatId);
                return;
            }
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) { await sock.sendMessage(chatId, { text: `⚠️ *INVALID DURATION*\n\n📌 5-120 seconds or use 'infinite'.`, ...channelInfo }); return; }
            if (config.duration === duration && !config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n⏱️ Duration is already *${duration}s*.`, ...channelInfo }); return; }
            config.duration = duration; config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            stopAllInfiniteTyping();
            await sock.sendMessage(chatId, { text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Typing duration: ${duration} seconds\n└ Infinite mode: OFF`, ...channelInfo });
        }
        else if (action === 'infinite') {
            if (args.length < 2) {
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Status: ${config.infinite ? '✅ ON' : '❌ OFF'}\n🔄 Sessions: ${activeInfiniteTypingSessions.size}\n\n📖 .autotyping infinite on/off/stop`, ...channelInfo });
                return;
            }
            const sub = args[1].toLowerCase();
            if (sub === 'on') { if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*`, ...channelInfo }); return; } config.infinite = true; config.duration = DEFAULT_DURATION; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); await sock.sendMessage(chatId, { text: `♾️ *INFINITE ENABLED*`, ...channelInfo }); if (config.enabled && shouldShowTyping(chatId, null)) await startInfiniteTyping(sock, chatId); }
            else if (sub === 'off') { if (!config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*`, ...channelInfo }); return; } config.infinite = false; config.duration = DEFAULT_DURATION; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); const stopped = stopAllInfiniteTyping(); await sock.sendMessage(chatId, { text: `⏱️ *INFINITE DISABLED*\n🛑 Stopped ${stopped} session(s).`, ...channelInfo }); }
            else if (sub === 'stop') { const stopped = stopAllInfiniteTyping(); await sock.sendMessage(chatId, { text: stopped > 0 ? `🛑 *STOPPED ${stopped} session(s)*` : `⚠️ *NO ACTIVE SESSIONS*`, ...channelInfo }); }
        }
        else if (action === 'include') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autotyping include add 2347012345678`, ...channelInfo }); return; }
                config.includeMode = true;
                const added = [];
                for (const num of numbers) { if (!config.numberList.includes(num)) { config.numberList.push(num); added.push(num); } }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *INCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: Include Only\n🔢 Added ${added.length} number(s)\n\n💡 Typing will ONLY show for these numbers.`, ...channelInfo });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autotyping include remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *INCLUDE REMOVED*\n\n📌 Removed ${before - config.numberList.length} number(s).\n📊 Remaining: ${config.numberList.length}`, ...channelInfo });
            }
            else { await sock.sendMessage(chatId, { text: `📋 *INCLUDE MODE*\n\n🔢 Numbers: ${config.numberList.length}\n\n📖 .autotyping include add/remove\n📖 .autotyping includelist\n📖 .autotyping includeclear`, ...channelInfo }); }
        }
        else if (action === 'exclude') {
            const sub = args[1]?.toLowerCase();
            if (sub === 'add') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autotyping exclude add 2347012345678`, ...channelInfo }); return; }
                config.includeMode = false;
                const added = [];
                for (const num of numbers) { if (!config.numberList.includes(num)) { config.numberList.push(num); added.push(num); } }
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *EXCLUDE ADDED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Mode: Exclude\n🔢 Added ${added.length} number(s)\n\n💡 Typing will NOT show for these numbers.`, ...channelInfo });
            }
            else if (sub === 'remove') {
                const numbers = args.slice(2).join(' ').split(/[, ]+/).map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 7);
                if (numbers.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .autotyping exclude remove <numbers>`, ...channelInfo }); return; }
                const before = config.numberList.length;
                config.numberList = config.numberList.filter(n => !numbers.includes(n));
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `✅ *EXCLUDE REMOVED*\n\n📌 Removed ${before - config.numberList.length} number(s).\n📊 Remaining: ${config.numberList.length}`, ...channelInfo });
            }
            else { await sock.sendMessage(chatId, { text: `📋 *EXCLUDE MODE*\n\n🔢 Numbers: ${config.numberList.length}\n\n📖 .autotyping exclude add/remove\n📖 .autotyping excludelist\n📖 .autotyping excludeclear`, ...channelInfo }); }
        }
        else if (action === 'includelist') {
            const nums = config.numberList;
            await sock.sendMessage(chatId, { text: `📋 *INCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: Include Only\n📊 Total: ${nums.length}\n\n${nums.length > 0 ? nums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}`, ...channelInfo });
        }
        else if (action === 'excludelist') {
            const nums = config.numberList;
            await sock.sendMessage(chatId, { text: `📋 *EXCLUDE LIST*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Mode: Exclude\n📊 Total: ${nums.length}\n\n${nums.length > 0 ? nums.map((n, i) => `${i + 1}. +${n}`).join('\n') : '└ No numbers'}`, ...channelInfo });
        }
        else if (action === 'includeclear') { if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*`, ...channelInfo }); return; } config.numberList = []; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); await sock.sendMessage(chatId, { text: `✅ *INCLUDE LIST CLEARED*`, ...channelInfo }); }
        else if (action === 'excludeclear') { if (config.numberList.length === 0) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY EMPTY*`, ...channelInfo }); return; } config.numberList = []; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); await sock.sendMessage(chatId, { text: `✅ *EXCLUDE LIST CLEARED*`, ...channelInfo }); }
        else if (action === 'status') {
            const sessions = activeInfiniteTypingSessions.size;
            const filterMode = config.numberList.length > 0 ? (config.includeMode ? '✅ Include Only' : '🚫 Exclude') : '🌍 All Numbers';
            await sock.sendMessage(chatId, {
                text: `⌨️ *AUTO-TYPING STATUS*\n\n━━━━━━━━━━━━━━━━━━━━\n${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n🔢 Filter: ${filterMode} (${config.numberList.length})\n🔄 Sessions: ${sessions}`,
                ...channelInfo
            });
        }
        else { await sock.sendMessage(chatId, { text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Use .autotyping to see all options.`, ...channelInfo }); }
    } catch (error) { console.error('❌ Error:', error); }
}

module.exports = {
    autotypingCommand, isAutotypingEnabled, shouldShowTyping,
    handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand,
    stopInfiniteTyping, stopAllInfiniteTyping, startInfiniteTyping
};
