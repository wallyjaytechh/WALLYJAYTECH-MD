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
 * Anti-Call Command - Professional call rejection system
 * Features: Decline | Block | Warn (3 calls = block) | Auto-update on version change
 */

const fs = require('fs');
const settings = require('../settings');

const ANTICALL_PATH = './data/anticall.json';
const CALL_WARN_PATH = './data/callWarnings.json';

const defaultConfig = {
    enabled: false,
    mode: 'decline', // 'decline' | 'block' | 'warn'
    message: `╭──❍「 *CALL DETECTED* 」❍\n├• 👋 Hello @{caller}\n├• 📞 Your call was auto-declined\n├• 💬 Please send a text message\n├• 🤖 I'll respond when available\n╰───★─☆─♪♪─❍\n\n╭──❍「 *WALLYJAYTECH-MD* 」❍\n╰───★─☆─♪♪─❍`
};

const WARN_LIMIT = 3;

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

// ═══════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════

function readState() {
    try {
        const currentVersion = settings.version || '1.0.0';
        let data = { ...defaultConfig };
        let needsUpdate = false;
        if (fs.existsSync(ANTICALL_PATH)) {
            data = { ...defaultConfig, ...JSON.parse(fs.readFileSync(ANTICALL_PATH, 'utf8')) };
            if (data._version !== currentVersion) needsUpdate = true;
        }
        if (!fs.existsSync(ANTICALL_PATH) || needsUpdate) {
            const dir = './data';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const preserved = { enabled: data.enabled, mode: data.mode };
            const updated = { ...defaultConfig, ...preserved, _version: currentVersion };
            fs.writeFileSync(ANTICALL_PATH, JSON.stringify(updated, null, 2));
            return updated;
        }
        return data;
    } catch {
        const fallback = { ...defaultConfig, _version: settings.version || '1.0.0' };
        try { fs.writeFileSync(ANTICALL_PATH, JSON.stringify(fallback, null, 2)); } catch (e) {}
        return fallback;
    }
}

function writeState(config) {
    try {
        const dir = './data';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ ...defaultConfig, ...config, _version: settings.version || '1.0.0' }, null, 2));
    } catch (error) { console.error('❌ Error writing anticall config:', error); }
}

// ═══════════════════════════════════════
// CALL WARNING SYSTEM
// ═══════════════════════════════════════

function readWarnings() {
    try {
        if (fs.existsSync(CALL_WARN_PATH)) return JSON.parse(fs.readFileSync(CALL_WARN_PATH, 'utf8'));
    } catch (e) {}
    return {};
}

function writeWarnings(data) {
    try {
        const dir = './data';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(CALL_WARN_PATH, JSON.stringify(data, null, 2));
    } catch (e) {}
}

function addCallWarning(callerJid) {
    const warnings = readWarnings();
    const caller = callerJid.split('@')[0];
    if (!warnings[caller]) warnings[caller] = { count: 0, lastCall: 0 };
    warnings[caller].count++;
    warnings[caller].lastCall = Date.now();
    writeWarnings(warnings);
    return warnings[caller].count;
}

function resetCallWarnings(callerJid) {
    const warnings = readWarnings();
    const caller = callerJid.split('@')[0];
    if (warnings[caller]) { delete warnings[caller]; writeWarnings(warnings); }
}

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

async function anticallCommand(sock, chatId, message, args) {
    try {
        const state = readState();
        const sub = (args || '').trim().toLowerCase();
        const action = sub.split(' ')[0];

        const getModeText = (mode) => {
            switch(mode) {
                case 'block': return '🚫 Block Callers';
                case 'warn': return '⚠️ Warn & Block (3 calls)';
                default: return '📵 Decline Only';
            }
        };

        if (!action) {
            const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = state.enabled ? '🟢' : '🔴';
            await sock.sendMessage(chatId, {
                text: `📞 *ANTI-CALL SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `⚙️ *Mode:* ${getModeText(state.mode)}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .anticall on - Enable\n` +
                      `└ .anticall off - Disable\n` +
                      `└ .anticall decline - Decline only\n` +
                      `└ .anticall block - Block immediately\n` +
                      `└ .anticall warn - Warn 3x then block\n` +
                      `└ .anticall message <text> - Custom message\n` +
                      `└ .anticall status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .anticall warn\n` +
                      `└ .anticall message I'm busy, text me!`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (action === 'status') {
            const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const msgPreview = state.message.substring(0, 80) + (state.message.length > 80 ? '...' : '');
            await sock.sendMessage(chatId, {
                text: `📞 *ANTI-CALL STATUS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🟢 *Status:* ${status}\n` +
                      `⚙️ *Mode:* ${getModeText(state.mode)}\n\n` +
                      `💬 *Message:*\n_${msgPreview}_\n\n` +
                      `💡 Use @{caller} to mention caller.`,
                ...channelInfo
            });
            return;
        }

        if (action === 'on') {
            if (state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already *ON*.`, ...channelInfo }); return; }
            writeState({ ...state, enabled: true });
            await sock.sendMessage(chatId, { text: `✅ *ANTI-CALL ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls auto-handled.\n⚙️ Mode: ${getModeText(state.mode)}`, ...channelInfo });
            return;
        }

        if (action === 'off') {
            if (!state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*`, ...channelInfo }); return; }
            writeState({ ...state, enabled: false });
            await sock.sendMessage(chatId, { text: `❌ *ANTI-CALL DISABLED*`, ...channelInfo });
            return;
        }

        if (action === 'decline') {
            if (state.mode === 'decline') { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n📞 Already in *Decline Mode*.`, ...channelInfo }); return; }
            writeState({ ...state, mode: 'decline', enabled: true });
            await sock.sendMessage(chatId, { text: `📵 *DECLINE MODE ON*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls declined.\n👤 Callers NOT blocked.`, ...channelInfo });
            return;
        }

        if (action === 'block') {
            if (state.mode === 'block') { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n📞 Already in *Block Mode*.`, ...channelInfo }); return; }
            writeState({ ...state, mode: 'block', enabled: true });
            await sock.sendMessage(chatId, { text: `🚫 *BLOCK MODE ON*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls rejected.\n👤 Callers blocked immediately.`, ...channelInfo });
            return;
        }

        if (action === 'warn') {
            if (state.mode === 'warn') { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n📞 Already in *Warn Mode*.`, ...channelInfo }); return; }
            writeState({ ...state, mode: 'warn', enabled: true });
            await sock.sendMessage(chatId, { text: `⚠️ *WARN MODE ON*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls declined with warning.\n👤 Blocked after ${WARN_LIMIT} calls.`, ...channelInfo });
            return;
        }

        if (action === 'message') {
            const newMessage = sub.substring(7).trim();
            if (!newMessage) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .anticall message <text>\n\n💡 Use @{caller} for caller name.`, ...channelInfo }); return; }
            writeState({ ...state, message: newMessage });
            await sock.sendMessage(chatId, { text: `💬 *MESSAGE SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📝 _${newMessage}_`, ...channelInfo });
            return;
        }
    } catch (error) { console.error('❌ Anti-call command error:', error); }
}

// ═══════════════════════════════════════
// CALL HANDLER
// ═══════════════════════════════════════

const antiCallNotified = new Set();

async function handleAnticall(sock, calls) {
    try {
        const state = readState();
        if (!state.enabled) return;

        for (const call of calls) {
            const callerJid = call.from || call.peerJid || call.chatId;
            if (!callerJid) continue;

            try {
                const callerNumber = callerJid.split('@')[0];

                // Reject call
                try { if (typeof sock.rejectCall === 'function' && call.id) await sock.rejectCall(call.id, callerJid); else if (typeof sock.sendCallOfferAck === 'function' && call.id) await sock.sendCallOfferAck(call.id, callerJid, 'reject'); } catch (e) {}

                // Send message (once per minute)
                if (!antiCallNotified.has(callerJid)) {
                    antiCallNotified.add(callerJid);
                    setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                    const msg = state.message.replace(/\{caller\}/g, callerNumber);
                    await sock.sendMessage(callerJid, { text: msg, mentions: [callerJid] });
                }

                // Handle mode actions
                if (state.mode === 'block') {
                    setTimeout(async () => { try { await sock.updateBlockStatus(callerJid, 'block'); } catch (e) {} }, 2000);
                } else if (state.mode === 'warn') {
                    const warnCount = addCallWarning(callerJid);
                    if (warnCount >= WARN_LIMIT) {
                        await sock.sendMessage(callerJid, { text: `🚫 *BLOCKED*\n\nYou've called ${WARN_LIMIT} times. You are now blocked.` });
                        setTimeout(async () => {
                            try { await sock.updateBlockStatus(callerJid, 'block'); } catch (e) {}
                            resetCallWarnings(callerJid);
                        }, 2000);
                    } else {
                        await sock.sendMessage(callerJid, { text: `⚠️ *WARNING ${warnCount}/${WARN_LIMIT}*\n\nYou'll be blocked after ${WARN_LIMIT - warnCount} more call(s).` });
                    }
                }

            } catch (e) {}
        }
    } catch (error) { console.error('Error in handleAnticall:', error); }
}

module.exports = { anticallCommand, readState, handleAnticall };
