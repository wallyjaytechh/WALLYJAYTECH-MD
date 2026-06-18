/**
 * WALLYJAYTECH-MD - A WhatsApp Bot
 * Autorecordtype Command - Turn on both autotyping AND autorecord with one command
 * Alternates every 5 seconds for BOTH infinite and timed modes
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

function initConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            const dataDir = path.join(__dirname, '..', 'data');
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            fs.writeFileSync(configPath, JSON.stringify({ enabled: false, mode: 'all', duration: DEFAULT_DURATION, infinite: false }, null, 2));
        }
        const config = JSON.parse(fs.readFileSync(configPath));
        if (config.infinite === undefined) { config.infinite = false; fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); }
        return config;
    } catch (error) { return { enabled: false, mode: 'all', duration: DEFAULT_DURATION, infinite: false }; }
}

function stopAlternatingSession(chatId) { const s = activeSessions.get(chatId); if (s?.intervalId) { clearInterval(s.intervalId); activeSessions.delete(chatId); return true; } return false; }
function stopAllAlternatingSessions() { let c = 0; for (const [id, s] of activeSessions.entries()) { clearInterval(s.intervalId); activeSessions.delete(id); c++; } return c; }

async function startAlternatingSession(sock, chatId, duration, infinite) {
    stopAlternatingSession(chatId);
    try {
        await sock.presenceSubscribe(chatId);
        await delay(200);
        await sock.sendPresenceUpdate('available', chatId);
        await delay(300);
        
        let isRecording = true;
        let loopsDone = 0;
        const switchMs = 5000;
        const maxLoops = infinite ? Infinity : Math.floor((duration * 1000) / switchMs);
        
        await sock.sendPresenceUpdate('recording', chatId);
        
        const session = { chatId, startTime: Date.now(), refreshCount: 0, isRecording: true };
        
        session.intervalId = setInterval(async () => {
            try {
                loopsDone++;
                if (!infinite && loopsDone >= maxLoops) {
                    await sock.sendPresenceUpdate('paused', chatId);
                    stopAlternatingSession(chatId);
                    return;
                }
                
                isRecording = !isRecording;
                if (isRecording) {
                    await sock.sendPresenceUpdate('recording', chatId);
                } else {
                    await sock.sendPresenceUpdate('composing', chatId);
                }
                session.refreshCount++;
            } catch (e) { stopAlternatingSession(chatId); }
        }, switchMs);
        
        activeSessions.set(chatId, session);
        return true;
    } catch (e) { return false; }
}

async function updateBothConfigs(mode, duration, infinite) {
    ['autotyping.json', 'autorecord.json'].forEach(f => {
        const p = path.join(__dirname, '..', 'data', f);
        if (fs.existsSync(p)) {
            let c = JSON.parse(fs.readFileSync(p));
            c.enabled = true;
            c.mode = mode;
            c.duration = duration;
            c.infinite = infinite;
            fs.writeFileSync(p, JSON.stringify(c, null, 2));
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
            await sock.sendMessage(chatId, { text: `🎙️⌨️ *AUTO-RECORD-TYPE SETTINGS*\n\n${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n🔄 Sessions: ${activeSessions.size}\n\n📖 *Commands:*\n└ .autorecordtype on/off\n└ .autorecordtype mode all/dms/groups\n└ .autorecordtype duration <seconds>\n└ .autorecordtype duration infinite\n└ .autorecordtype status\n\n🔄 *Alternates recording/typing every 5s*`, ...channelInfo });
            return;
        }

        const action = args[0].toLowerCase();

        if (action === 'on' || action === 'enable') {
            if (config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️⌨️ Auto-Record-Type is already *ON*.\n\n💡 Use .autorecordtype off to disable.`, ...channelInfo }); return; }
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await updateBothConfigs(config.mode, config.duration, config.infinite);
            await sock.sendMessage(chatId, { text: `✅ *AUTO-RECORD-TYPE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n\n✅ Auto-typing: ENABLED\n✅ Auto-record: ENABLED\n🔄 Alternating every 5 seconds\n\n📌 Both indicators active in ${getModeDescription(config.mode)}`, ...channelInfo });
            if (config.infinite) {
                await startAlternatingSession(sock, chatId, config.duration, true);
            } else {
                await startAlternatingSession(sock, chatId, config.duration, false);
            }
        } else if (action === 'off' || action === 'disable') {
            if (!config.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🎙️⌨️ Auto-Record-Type is already *OFF*.\n\n💡 Use .autorecordtype on to enable.`, ...channelInfo }); return; }
            const stopped = stopAllAlternatingSessions();
            config.enabled = false;
            config.infinite = false;
            config.duration = DEFAULT_DURATION;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await disableBoth();
            await sock.sendMessage(chatId, { text: `❌ *AUTO-RECORD-TYPE DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n🛑 Both typing & recording stopped.\n🔄 Stopped ${stopped} alternating session(s).\n⏱️ Duration reset to ${DEFAULT_DURATION}s.\n\n💡 Use .autorecordtype on to enable.`, ...channelInfo });
        } else if (action === 'mode') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecordtype mode <all/dms/groups>\n\n✨ *Example:*\n└ .autorecordtype mode groups`, ...channelInfo }); return; }
            const mode = args[1].toLowerCase();
            if (mode === 'all' || mode === 'dms' || mode === 'groups') {
                config.mode = mode;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `🎯 *MODE UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ New mode: ${getModeText(mode)}\n\n📌 ${getModeDescription(mode)}`, ...channelInfo });
            } else {
                await sock.sendMessage(chatId, { text: `⚠️ *INVALID MODE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 Available: all, dms, groups`, ...channelInfo });
            }
        } else if (action === 'duration') {
            if (args.length < 2) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .autorecordtype duration <seconds>\n💡 Use 'infinite' for unlimited\n\n✨ *Example:*\n└ .autorecordtype duration 30\n└ .autorecordtype duration infinite`, ...channelInfo }); return; }
            if (args[1].toLowerCase() === 'infinite') {
                if (config.infinite) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY INFINITE*\n\n━━━━━━━━━━━━━━━━━━━━\n♾️ Infinite is already *ON*.\n\n💡 Use .autorecordtype off to disable.`, ...channelInfo }); return; }
                config.infinite = true;
                config.duration = DEFAULT_DURATION;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { text: `♾️ *INFINITE MODE ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Both typing & recording will alternate every 5 seconds indefinitely.\n\n💡 Use .autorecordtype off to stop.`, ...channelInfo });
                if (config.enabled) await startAlternatingSession(sock, chatId, config.duration, true);
                return;
            }
            const d = parseInt(args[1]);
            if (isNaN(d) || d < 5 || d > 120) { await sock.sendMessage(chatId, { text: `⚠️ *INVALID DURATION*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Duration must be between 5-120 seconds.\n💡 Use 'infinite' for unlimited.`, ...channelInfo }); return; }
            config.duration = d;
            config.infinite = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            stopAllAlternatingSessions();
            await sock.sendMessage(chatId, { text: `⏱️ *DURATION UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n└ Both typing & recording: ${d} seconds\n└ Infinite mode: OFF\n🔄 Alternating every 5 seconds`, ...channelInfo });
            if (config.enabled) await startAlternatingSession(sock, chatId, d, false);
        } else if (action === 'status') {
            await sock.sendMessage(chatId, { text: `🎙️⌨️ *AUTO-RECORD-TYPE STATUS*\n\n${config.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}\n━━━━━━━━━━━━━━━━━━━━\n🎯 Mode: ${getModeText(config.mode)}\n⏱️ Duration: ${config.infinite ? '♾️ Infinite' : config.duration + 's'}\n♾️ Infinite: ${config.infinite ? 'ON' : 'OFF'}\n🔄 Sessions: ${activeSessions.size}\n\n🔄 Alternates every 5 seconds`, ...channelInfo });
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ *INVALID COMMAND*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Commands:*\n└ .autorecordtype on/off\n└ .autorecordtype mode all/dms/groups\n└ .autorecordtype duration <seconds>\n└ .autorecordtype duration infinite\n└ .autorecordtype status`, ...channelInfo });
        }
    } catch (error) { console.error('❌ Error:', error); }
}

function getModeText(mode) { switch(mode) { case 'all': return '🌍 All Chats'; case 'dms': return '💬 DMs Only'; case 'groups': return '👥 Groups Only'; default: return '🌍 All Chats'; } }
function getModeDescription(mode) { switch(mode) { case 'all': return 'both DMs and groups.'; case 'dms': return 'private messages only.'; case 'groups': return 'group chats only.'; default: return 'both DMs and groups.'; } }
function isAutorecordtypeEnabled() { try { return initConfig().enabled; } catch (e) { return false; } }

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { autorecordtypeCommand, isAutorecordtypeEnabled };
