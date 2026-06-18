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

function initConfig() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false, mode: 'all', duration: 60, infinite: false }, null, 2));
        }
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.infinite === undefined) { config.infinite = false; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); }
        return config;
    } catch (error) { return { enabled: false, mode: 'all', duration: 60, infinite: false }; }
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
            await sock.sendMessage(chatId, { text: `✅ *AUTO-TYPING ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + ' seconds'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n\n📌 Typing indicators active!`, ...channelInfo });
            if (config.infinite && shouldShowTyping(chatId)) await startInfiniteTyping(sock, chatId);
        } else if (action === 'off' || action === 'disable') {
            if (!config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n⌨️ Auto-Typing is already *OFF*.\n\n💡 Use .autotyping on to enable.`, ...channelInfo }); return; }
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            const stopped = stopAllInfiniteTyping();
            await sock.sendMessage(chatId, { text: `❌ *AUTO-TYPING DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Stopped ${stopped} active session(s)`, ...channelInfo });
        } else if (action === 'mode') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ Modes: all, dms, groups`, ...channelInfo }); return; }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `🎯 *MODE UPDATED:* ${getModeText(mode)}`, ...channelInfo });
            }
        } else if (action === 'duration') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ Usage: .autotyping duration <seconds> or infinite`, ...channelInfo }); return; }
            if (args[1].toLowerCase() === 'infinite') {
                if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite typing is already *ON*.`, ...channelInfo }); return; }
                config.infinite = true; config.duration = 999999;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE MODE ENABLED*`, ...channelInfo });
                if (config.enabled && shouldShowTyping(chatId)) await startInfiniteTyping(sock, chatId);
                return;
            }
            const duration = parseInt(args[1]);
            if (isNaN(duration) || duration < 5 || duration > 120) { await sock.sendMessage(chatId, { text: `⚠️ Duration: 5-120 seconds`, ...channelInfo }); return; }
            config.duration = duration; config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            stopAllInfiniteTyping();
            await sock.sendMessage(chatId, { text: `⏱️ *DURATION:* ${duration} seconds`, ...channelInfo });
        } else if (action === 'infinite') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\nCommands: on/off/stop`, ...channelInfo }); return; }
            const sub = args[1].toLowerCase();
            if (sub === 'on' || sub === 'enable') {
                if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*\n\n♾️ Infinite is already *ON*.`, ...channelInfo }); return; }
                config.infinite = true; config.duration = 999999;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE ENABLED*`, ...channelInfo });
                if (config.enabled && shouldShowTyping(chatId)) await startInfiniteTyping(sock, chatId);
            } else if (sub === 'off' || sub === 'disable') {
                if (!config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n♾️ Infinite is already *OFF*.`, ...channelInfo }); return; }
                config.infinite = false; config.duration = 60;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                const stopped = stopAllInfiniteTyping();
                await sock.sendMessage(chatId, { text: `⏱️ *INFINITE DISABLED*\n🛑 Stopped ${stopped} session(s)`, ...channelInfo });
            } else if (sub === 'stop') {
                const stopped = stopAllInfiniteTyping();
                await sock.sendMessage(chatId, { text: stopped > 0 ? `🛑 Stopped ${stopped} session(s)` : `⚠️ No active sessions`, ...channelInfo });
            }
        } else if (action === 'status') {
            const sessions = activeInfiniteTypingSessions.size;
            await sock.sendMessage(chatId, { text: `⌨️ *AUTO-TYPING STATUS*\n\n${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n🔄 Sessions: ${sessions}`, ...channelInfo });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

function getModeText(mode) { switch(mode) { case 'all': return '🌍 All Chats'; case 'dms': return '💬 DMs Only'; case 'groups': return '👥 Groups Only'; default: return '🌍 All Chats'; } }
function shouldShowTyping(chatId) { try { const config = initConfig(); if (!config.enabled) return false; const isGroup = chatId.endsWith('@g.us'); switch(config.mode) { case 'all': return true; case 'dms': return !isGroup; case 'groups': return isGroup; default: return true; } } catch (e) { return false; } }
function isAutotypingEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

async function handleAutotypingForMessage(sock, chatId, userMessage) {
    if (!shouldShowTyping(chatId)) return false;
    try { const config = initConfig(); if (config.infinite) return await startInfiniteTyping(sock, chatId); const duration = config.duration || 60; await sock.presenceSubscribe(chatId); await delay(300); await sock.sendPresenceUpdate('composing', chatId); for (let i = 0; i < Math.floor(duration * 1000 / 10000); i++) { await delay(10000); await sock.sendPresenceUpdate('composing', chatId); } await sock.sendPresenceUpdate('paused', chatId); return true; } catch (e) { return false; }
}
async function handleAutotypingForCommand(sock, chatId) { return await handleAutotypingForMessage(sock, chatId, ''); }
async function showTypingAfterCommand(sock, chatId) { return await handleAutotypingForMessage(sock, chatId, ''); }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { autotypingCommand, isAutotypingEnabled, shouldShowTyping, handleAutotypingForMessage, handleAutotypingForCommand, showTypingAfterCommand, stopInfiniteTyping, stopAllInfiniteTyping, startInfiniteTyping };
