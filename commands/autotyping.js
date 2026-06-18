/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autotyping Command - Shows fake typing status (with infinite mode)
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

function initConfig() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false, mode: 'all', duration: DEFAULT_DURATION, infinite: false }, null, 2));
        }
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.infinite === undefined) { config.infinite = false; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); }
        return config;
    } catch (error) { return { enabled: false, mode: 'all', duration: DEFAULT_DURATION, infinite: false }; }
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
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        await sock.sendPresenceUpdate('composing', chatId);
        const session = { chatId, startTime: Date.now(), refreshCount: 0 };
        session.intervalId = setInterval(async () => {
            try { await sock.sendPresenceUpdate('composing', chatId); session.refreshCount++; } catch (e) { stopInfiniteTyping(chatId); }
        }, 10000);
        activeInfiniteTypingSessions.set(chatId, session);
        return true;
    } catch (e) { return false; }
}

async function autotypingCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        if (!message.key.fromMe && !isOwner) { await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner!', ...channelInfo }); return; }

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
            await sock.sendMessage(chatId, { text: `⌨️ *AUTO-TYPING SETTINGS*\n\n${statusIcon} *Status:* ${status}\n━━━━━━━━━━━━━━━━━━━━\n🎯 *Mode:* ${modeText}\n⏱️ *Duration:* ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n♾️ *Infinite Mode:* ${infiniteStatus}\n🔄 *Active Sessions:* ${sessions}\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Commands:*\n└ .autotyping on/off\n└ .autotyping mode all/dms/groups\n└ .autotyping duration <seconds>\n└ .autotyping infinite on/off/stop\n└ .autotyping status\n\n💡 *Examples:*\n└ .autotyping duration 30\n└ .autotyping infinite on`, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'on' || action === 'enable') {
            if (config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n⌨️ Auto-Typing is already *ON*.\n\n💡 Use .autotyping off to disable.`, ...channelInfo }); return; }
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `✅ *AUTO-TYPING ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n\n📌 Typing indicators active in ${getModeDescription(config.mode)}`, ...channelInfo });
            if (config.infinite && shouldShowTyping(chatId)) await startInfiniteTyping(sock, chatId);
        } else if (action === 'off' || action === 'disable') {
            if (!config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n⌨️ Auto-Typing is already *OFF*.\n\n💡 Use .autotyping on to enable.`, ...channelInfo }); return; }
            const stopped = stopAllInfiniteTyping();
            config.enabled = false;
            config.infinite = false;
            config.duration = DEFAULT_DURATION;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { text: `❌ *AUTO-TYPING DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Typing stopped.\n🔄 Stopped ${stopped} active session(s).\n⏱️ Duration reset to ${DEFAULT_DURATION}s.\n\n💡 Use .autotyping on to enable.`, ...channelInfo });
        } else if (action === 'mode') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autotyping mode <all/dms/groups>\n\n✨ *Example:*\n└ .autotyping mode groups`, ...channelInfo }); return; }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}`, ...channelInfo });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ *INVALID MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Available: all, dms, groups`, ...channelInfo });
            }
        } else if (action === 'duration') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autotyping duration <seconds>\n💡 Use 'infinite' for unlimited\n\n✨ *Example:*\n└ .autotyping duration 30\n└ .autotyping duration infinite`, ...channelInfo }); return; }
            if (args[1].toLowerCase() === 'infinite') {
                if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite typing is already *ON*.\n\n💡 Use .autotyping infinite off to disable.`, ...channelInfo }); return; }
                config.infinite = true;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Typing will continue indefinitely.\n🔄 Auto-refresh every 10 seconds.\n\n💡 Use .autotyping infinite stop to stop.`, ...channelInfo });
                if (config.enabled && shouldShowTyping(chatId)) await startInfiniteTyping(sock, chatId);
                return;
            }
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) { await sock.sendMessage(chatId, { text: `⚠️ *INVALID DURATION*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Duration must be between 5-120 seconds.\n💡 Use 'infinite' for unlimited.`, ...channelInfo }); return; }
            config.duration = duration;
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            stopAllInfiniteTyping();
            await sock.sendMessage(chatId, { text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Typing duration: ${duration} seconds\n└ Infinite mode: OFF`, ...channelInfo });
        } else if (action === 'infinite') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `♾️ *INFINITE MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Status: ${config.infinite ? '✅ ON' : '❌ OFF'}\n🔄 Active Sessions: ${activeInfiniteTypingSessions.size}\n\n📖 Commands:\n└ .autotyping infinite on\n└ .autotyping infinite off\n└ .autotyping infinite stop`, ...channelInfo }); return; }
            const sub = args[1].toLowerCase();
            if (sub === 'on' || sub === 'enable') {
                if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite is already *ON*.\n\n💡 Use .autotyping infinite off to disable.`, ...channelInfo }); return; }
                config.infinite = true;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Typing will continue indefinitely.\n🔄 Auto-refresh every 10 seconds.`, ...channelInfo });
                if (config.enabled && shouldShowTyping(chatId)) await startInfiniteTyping(sock, chatId);
            } else if (sub === 'off' || sub === 'disable') {
                if (!config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite is already *OFF*.\n\n💡 Use .autotyping infinite on to enable.`, ...channelInfo }); return; }
                config.infinite = false;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                const stopped = stopAllInfiniteTyping();
                await sock.sendMessage(chatId, { text: `⏱️ *INFINITE DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Stopped ${stopped} session(s).\n⏱️ Duration reset to ${DEFAULT_DURATION}s.`, ...channelInfo });
            } else if (sub === 'stop') {
                const stopped = stopAllInfiniteTyping();
                await sock.sendMessage(chatId, { text: stopped > 0 ? `🛑 *STOPPED*\n\n━━━━━━━━━━━━━━━━━━━━\n🔄 Stopped ${stopped} active typing session(s).\n\n💡 Typing will resume on next message.` : `⚠️ *NO ACTIVE SESSIONS*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 No infinite typing sessions running.`, ...channelInfo });
            }
        } else if (action === 'status') {
            const sessions = activeInfiniteTypingSessions.size;
            await sock.sendMessage(chatId, { text: `⌨️ *AUTO-TYPING STATUS*\n\n${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n🔄 Sessions: ${sessions}`, ...channelInfo });
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Commands:*\n└ .autotyping on/off\n└ .autotyping mode all/dms/groups\n└ .autotyping duration <seconds>\n└ .autotyping infinite on/off/stop\n└ .autotyping status`, ...channelInfo });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

function getModeText(mode) { switch(mode) { case 'all': return '🌍 All Chats'; case 'dms': return '💬 DMs Only'; case 'groups': return '👥 Groups Only'; default: return '🌍 All Chats'; } }
function getModeDescription(mode) { switch(mode) { case 'all': return 'both DMs and groups.'; case 'dms': return 'private messages only.'; case 'groups': return 'group chats only.'; default: return 'both DMs and groups.'; } }
function shouldShowTyping(chatId) { try { const config = initConfig(); if (!config.enabled) return false; const isGroup = chatId.endsWith('@g.us'); switch(config.mode) { case 'all': return true; case 'dms': return !isGroup; case 'groups': return isGroup; default: return true; } } catch (e) { return false; } }
function isAutotypingEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

async function handleAutotypingForMessage(sock, chatId, userMessage) {
    if (!shouldShowTyping(chatId)) return false;
    try { const config = initConfig(); if (config.infinite) return await startInfiniteTyping(sock, chatId); const duration = config.duration || DEFAULT_DURATION; await sock.presenceSubscribe(chatId); await delay(300); await sock.sendPresenceUpdate('composing', chatId); for (let i = 0; i < Math.floor(duration * 1000 / 10000); i++) { await delay(10000); await sock.sendPresenceUpdate('composing', chatId); } await sock.sendPresenceUpdate('paused', chatId); return true; } catch (e) { return false; }
}
async function handleAutotypingForCommand(sock, chatId) { return await handleAutotypingForMessage(sock, chatId, ''); }
async function showTypingAfterCommand(sock, chatId) { return await handleAutotypingForMessage(sock, chatId, ''); }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { autotypingCommand, isAutotypingEnabled, shouldShowTyping, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand, stopInfiniteTyping, stopAllInfiniteTyping, startInfiniteTyping };
