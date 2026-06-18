/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecordtype Command - Turn on both autotyping AND autorecord with one command
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

function initConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.join(__dirname, '..', 'data');
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false, mode: 'all', duration: 60, infinite: false }, null, 2));
        }
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.infinite === undefined) { config.infinite = false; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); }
        return config;
    } catch (error) { return { enabled: false, mode: 'all', duration: 60, infinite: false }; }
}

function stopAlternatingSession(chatId) { const s = activeSessions.get(chatId); if (s?.intervalId) { clearInterval(s.intervalId); activeSessions.delete(chatId); return true; } return false; }
function stopAllAlternatingSessions() { let c = 0; for (const [id, s] of activeSessions.entries()) { clearInterval(s.intervalId); activeSessions.delete(id); c++; } return c; }

async function startAlternatingSession(sock, chatId) {
    stopAlternatingSession(chatId);
    try {
        await sock.presenceSubscribe(chatId);
        await delay(300);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(500);
        let isRecording = true;
        const session = { chatId, startTime: Date.now(), refreshCount: 0, isRecording: true };
        session.intervalId = setInterval(async () => {
            try {
                if (isRecording) await sock.sendPresenceUpdate('recording', chatId);
                else await sock.sendPresenceUpdate('composing', chatId);
                isRecording = !isRecording; session.refreshCount++;
            } catch (e) { stopAlternatingSession(chatId); }
        }, 5000);
        await sock.sendPresenceUpdate('recording', chatId);
        activeSessions.set(chatId, session);
        return true;
    } catch (e) { return false; }
}

async function enableBoth(sock, chatId, mode, duration, infinite) {
    const atPath = path.join(__dirname, '..', 'data', 'autotyping.json');
    let at = { enabled: true, mode, duration, infinite };
    if (fs.existsSync(atPath)) at = JSON.parse(fs.readFileSync(atPath));
    at.enabled = true; at.mode = mode; at.duration = duration; at.infinite = infinite;
    fs.writeFileSync(atPath, JSON.stringify(at, null, 2));

    const arPath = path.join(__dirname, '..', 'data', 'autorecord.json');
    let ar = { enabled: true, mode, duration, infinite };
    if (fs.existsSync(arPath)) ar = JSON.parse(fs.readFileSync(arPath));
    ar.enabled = true; ar.mode = mode; ar.duration = duration; ar.infinite = infinite;
    fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));

    if (infinite && sock && chatId) await startAlternatingSession(sock, chatId);
}

async function disableBoth() {
    ['autotyping.json', 'autorecord.json'].forEach(f => {
        const p = path.join(__dirname, '..', 'data', f);
        if (fs.existsSync(p)) { let c = JSON.parse(fs.readFileSync(p)); c.enabled = false; c.infinite = false; fs.writeFileSync(p, JSON.stringify(c, null, 2)); }
    });
    stopAllAlternatingSessions();
    try { require('./autorecord').stopAllInfiniteRecordings(); } catch (e) {}
    try { require('./autotyping').stopAllInfiniteTyping(); } catch (e) {}
}

async function autorecordtypeCommand(sock, chatId, message) {
    try {
        const senderId = message.key.participant || message.key.remoteJid;
        const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
        if (!message.key.fromMe && !isOwner) { await sock.sendMessage(chatId, { text: '❌ Owner only!', ...channelInfo }); return; }

        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        let cp = userMessage.trim();
        if (cp.startsWith('.')) cp = cp.substring(1);
        const parts = cp.split(/\s+/);
        const args = parts.slice(1);
        const config = initConfig();

        if (args.length === 0) {
            await sock.sendMessage(chatId, { text: `🎙️⌨️ *AUTO-RECORD-TYPE SETTINGS*\n\n${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n🔄 Sessions: ${activeSessions.size}\n\n📖 *Commands:*\n└ .autorecordtype on/off\n└ .autorecordtype mode all/dms/groups\n└ .autorecordtype duration <seconds>\n└ .autorecordtype duration infinite\n└ .autorecordtype status`, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'on' || action === 'enable') {
            if (config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️⌨️ Auto-Record-Type is already *ON*.\n\n💡 Use .autorecordtype off to disable.`, ...channelInfo }); return; }
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await enableBoth(sock, chatId, config.mode, config.duration, config.infinite);
            await sock.sendMessage(chatId, { text: `✅ *AUTO-RECORD-TYPE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n\n✅ Auto-typing: ENABLED\n✅ Auto-record: ENABLED`, ...channelInfo });
        } else if (action === 'off' || action === 'disable') {
            if (!config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️⌨️ Auto-Record-Type is already *OFF*.\n\n💡 Use .autorecordtype on to enable.`, ...channelInfo }); return; }
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await disableBoth();
            await sock.sendMessage(chatId, { text: `❌ *AUTO-RECORD-TYPE DISABLED*`, ...channelInfo });
        } else if (action === 'mode') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ Modes: all, dms, groups`, ...channelInfo }); return; }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `🎯 *MODE UPDATED:* ${getModeText(mode)}`, ...channelInfo });
            }
        } else if (action === 'duration') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ Usage: .autorecordtype duration <seconds> or infinite`, ...channelInfo }); return; }
            if (args[1].toLowerCase() === 'infinite') {
                if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*\n\n♾️ Infinite is already *ON*.`, ...channelInfo }); return; }
                config.infinite = true; config.duration = 999999;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE ENABLED*`, ...channelInfo });
                if (config.enabled) await startAlternatingSession(sock, chatId);
                return;
            }
            const d = parseInt(args[1]);
            if (isNaN(d) || d < 5 || d > 120) { await sock.sendMessage(chatId, { text: `⚠️ Duration: 5-120`, ...channelInfo }); return; }
            config.duration = d; config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            stopAllAlternatingSessions();
            await sock.sendMessage(chatId, { text: `⏱️ *DURATION:* ${d} seconds`, ...channelInfo });
        } else if (action === 'status') {
            await sock.sendMessage(chatId, { text: `🎙️⌨️ *STATUS*\n\n${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n🔄 Sessions: ${activeSessions.size}`, ...channelInfo });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

function getModeText(mode) { switch(mode) { case 'all': return '🌍 All Chats'; case 'dms': return '💬 DMs Only'; case 'groups': return '👥 Groups Only'; default: return '🌍 All Chats'; } }
function isAutorecordtypeEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { autorecordtypeCommand, isAutorecordtypeEnabled };
