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
 * Features: Decline | Block | Warn (configurable) | Deduplicated | Auto-update
 */

const fs = require('fs');
const settings = require('../settings');

const ANTICALL_PATH = './data/anticall.json';
const CALL_WARN_PATH = './data/callWarnings.json';

const defaultConfig = {
    enabled: false,
    mode: 'decline',
    warnLimit: 3,
    message: `╭──❍「 *CALL DETECTED* 」❍\n├• 👋 Hello @{caller}\n├• 📞 Your call was auto-declined\n├• 💬 Please send a text message\n├• 🤖 I'll respond when available\n╰───★─☆─♪♪─❍\n\n╭──❍「 *WALLYJAYTECH-MD* 」❍\n╰───★─☆─♪♪─❍`
};

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
// STATE MANAGEMENT (Auto-update on config change)
// ═══════════════════════════════════════

function readState() {
    try {
        const configHash = JSON.stringify(defaultConfig);
        let data = { ...defaultConfig };
        let needsUpdate = false;
        if (fs.existsSync(ANTICALL_PATH)) {
            data = { ...defaultConfig, ...JSON.parse(fs.readFileSync(ANTICALL_PATH, 'utf8')) };
            if (data._hash !== configHash) needsUpdate = true;
        }
        if (!fs.existsSync(ANTICALL_PATH) || needsUpdate) {
            const dir = './data';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const preserved = { enabled: data.enabled, mode: data.mode, warnLimit: data.warnLimit };
            const updated = { ...defaultConfig, ...preserved, _version: settings.version || '1.0.0', _hash: configHash };
            fs.writeFileSync(ANTICALL_PATH, JSON.stringify(updated, null, 2));
            return updated;
        }
        return data;
    } catch {
        const configHash = JSON.stringify(defaultConfig);
        const fallback = { ...defaultConfig, _version: settings.version || '1.0.0', _hash: configHash };
        try { fs.writeFileSync(ANTICALL_PATH, JSON.stringify(fallback, null, 2)); } catch (e) {}
        return fallback;
    }
}

function writeState(config) {
    try {
        const dir = './data';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const configHash = JSON.stringify(defaultConfig);
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ ...defaultConfig, ...config, _version: settings.version || '1.0.0', _hash: configHash }, null, 2));
    } catch (error) { console.error('❌ Error writing anticall config:', error); }
}

// ═══════════════════════════════════════
// CALL WARNING SYSTEM
// ═══════════════════════════════════════

function readWarnings() {
    try { if (fs.existsSync(CALL_WARN_PATH)) return JSON.parse(fs.readFileSync(CALL_WARN_PATH, 'utf8')); } catch (e) {}
    return {};
}

function writeWarnings(data) {
    try { const dir = './data'; if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(CALL_WARN_PATH, JSON.stringify(data, null, 2)); } catch (e) {}
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

function getModeText(mode, warnLimit) {
    switch(mode) {
        case 'block': return '🚫 Block Immediately';
        case 'warn': return `⚠️ Warn & Block (${warnLimit} calls)`;
        default: return '📵 Decline Only';
    }
}

async function anticallCommand(sock, chatId, message, args) {
    try {
        const state = readState();
        const sub = (args || '').trim().toLowerCase();
        const parts = sub.split(' ');
        const action = parts[0];

        if (!action) {
            const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = state.enabled ? '🟢' : '🔴';
            await sock.sendMessage(chatId, {
                text: `📞 *ANTI-CALL SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `⚙️ *Mode:* ${getModeText(state.mode, state.warnLimit)}\n` +
                      `🔢 *Warn Limit:* ${state.warnLimit} calls\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .anticall on - Enable anti-call\n` +
                      `└ .anticall off - Disable anti-call\n` +
                      `└ .anticall decline - Decline only\n` +
                      `└ .anticall block - Block immediately\n` +
                      `└ .anticall warn - Warn then block\n` +
                      `└ .anticall warncount <1-10> - Set warn limit\n` +
                      `└ .anticall message <text> - Custom message\n` +
                      `└ .anticall status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .anticall warncount 5\n` +
                      `└ .anticall warn`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (action === 'status') {
            const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = state.enabled ? '🟢' : '🔴';
            const msgPreview = state.message.substring(0, 80) + (state.message.length > 80 ? '...' : '');
            await sock.sendMessage(chatId, {
                text: `📞 *ANTI-CALL STATUS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `⚙️ *Mode:* ${getModeText(state.mode, state.warnLimit)}\n` +
                      `🔢 *Warn Limit:* ${state.warnLimit} calls\n\n` +
                      `💬 *Message:*\n_${msgPreview}_\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 Use @{caller} to mention the caller.`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (action === 'on') {
            if (state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already *ON*.\n\n💡 Use .anticall off to disable.`, ...channelInfo }); return; }
            writeState({ ...state, enabled: true });
            await sock.sendMessage(chatId, { text: `✅ *ANTI-CALL ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will be auto-handled.\n⚙️ Mode: ${getModeText(state.mode, state.warnLimit)}\n\n💡 Use .anticall block/decline/warn to change.`, ...channelInfo });
            return;
        }

        if (action === 'off') {
            if (!state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already *OFF*.\n\n💡 Use .anticall on to enable.`, ...channelInfo }); return; }
            writeState({ ...state, enabled: false });
            await sock.sendMessage(chatId, { text: `❌ *ANTI-CALL DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will no longer be handled.`, ...channelInfo });
            return;
        }

        if (action === 'decline') {
            if (state.mode === 'decline' && state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already in *Decline Mode*.\n\n💡 Use .anticall block or .anticall warn to switch.`, ...channelInfo }); return; }
            writeState({ ...state, mode: 'decline', enabled: true });
            await sock.sendMessage(chatId, { text: `📵 *DECLINE MODE ACTIVATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will be declined.\n👤 Callers will NOT be blocked.\n💬 Custom message will be sent.`, ...channelInfo });
            return;
        }

        if (action === 'block') {
            if (state.mode === 'block' && state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already in *Block Mode*.\n\n💡 Use .anticall decline or .anticall warn to switch.`, ...channelInfo }); return; }
            writeState({ ...state, mode: 'block', enabled: true });
            await sock.sendMessage(chatId, { text: `🚫 *BLOCK MODE ACTIVATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will be rejected.\n👤 Callers will be blocked immediately.\n💬 Block message will be sent.`, ...channelInfo });
            return;
        }

        if (action === 'warn') {
            if (state.mode === 'warn' && state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already in *Warn Mode* (${state.warnLimit} calls).\n\n💡 Use .anticall decline or .anticall block to switch.`, ...channelInfo }); return; }
            writeState({ ...state, mode: 'warn', enabled: true });
            await sock.sendMessage(chatId, { text: `⚠️ *WARN MODE ACTIVATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will be declined with warning.\n👤 Callers blocked after *${state.warnLimit}* calls.\n\n💡 Use .anticall warncount <number> to change limit.`, ...channelInfo });
            return;
        }

        if (action === 'warncount') {
            const count = parseInt(parts[1]);
            if (!count || count < 1 || count > 10) {
                await sock.sendMessage(chatId, { text: `⚠️ *INVALID COUNT*\n\n━━━━━━━━━━━━━━━━━━━━\n📌 Choose between 1-10 calls.\n\n✨ *Example:*\n└ .anticall warncount 5`, ...channelInfo });
                return;
            }
            if (state.warnLimit === count) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n🔢 Warn limit is already *${count}* calls.\n\n💡 No changes needed.`, ...channelInfo }); return; }
            writeState({ ...state, warnLimit: count });
            await sock.sendMessage(chatId, { text: `🔢 *WARN LIMIT UPDATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Callers will be blocked after *${count}* calls.\n\n⚙️ Current mode: ${getModeText(state.mode, count)}`, ...channelInfo });
            return;
        }

        if (action === 'message') {
            const newMessage = sub.substring(7).trim();
            if (!newMessage) {
                await sock.sendMessage(chatId, { text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .anticall message <text>\n\n✨ *Example:*\n└ .anticall message Hello @{caller}, I'm busy!\n\n💡 Use @{caller} to mention the caller.`, ...channelInfo });
                return;
            }
            writeState({ ...state, message: newMessage });
            await sock.sendMessage(chatId, { text: `💬 *CUSTOM MESSAGE SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📝 *New Message:*\n_${newMessage}_\n\n💡 @{caller} will be replaced with caller's name.`, ...channelInfo });
            return;
        }
    } catch (error) { console.error('❌ Anti-call command error:', error); }
}

// ═══════════════════════════════════════
// CALL HANDLER - Deduplicated
// ═══════════════════════════════════════

const processedCalls = new Set();

async function handleAnticall(sock, calls) {
    try {
        const state = readState();
        if (!state.enabled) return;

        for (const call of calls) {
            const callId = call.id || call.callId;
            if (callId && processedCalls.has(callId)) continue;
            if (callId) { processedCalls.add(callId); setTimeout(() => processedCalls.delete(callId), 10000); }

            const callerJid = call.from || call.peerJid || call.chatId;
            if (!callerJid) continue;

            try {
                const callerNumber = callerJid.split('@')[0];
                try { if (typeof sock.rejectCall === 'function' && call.id) await sock.rejectCall(call.id, callerJid); else if (typeof sock.sendCallOfferAck === 'function' && call.id) await sock.sendCallOfferAck(call.id, callerJid, 'reject'); } catch (e) {}

                let msg;
                if (state.mode === 'block') {
                    msg = `╭──❍「 *CALL DETECTED* 」❍\n├• 👋 Hello @${callerNumber}\n├• 📞 Your call was auto-declined\n├• 🚫 Blocking you right away\n├• 🤖 Owner may unblock you later\n╰───★─☆─♪♪─❍\n\n╭──❍「 *WALLYJAYTECH-MD* 」❍\n╰───★─☆─♪♪─❍`;
                    setTimeout(async () => { try { await sock.updateBlockStatus(callerJid, 'block'); } catch (e) {} }, 2000);
                } else if (state.mode === 'warn') {
                    const warnCount = addCallWarning(callerJid);
                    const limit = state.warnLimit || 3;
                    if (warnCount >= limit) {
                        msg = `╭──❍「 *CALL DETECTED* 」❍\n├• 👋 Hello @${callerNumber}\n├• 📞 You've called ${limit} times\n├• 🚫 You are now *BLOCKED*\n├• 🤖 Owner may unblock you later\n╰───★─☆─♪♪─❍\n\n╭──❍「 *WALLYJAYTECH-MD* 」❍\n╰───★─☆─♪♪─❍`;
                        setTimeout(async () => { try { await sock.updateBlockStatus(callerJid, 'block'); } catch (e) {} resetCallWarnings(callerJid); }, 2000);
                    } else {
                        msg = `╭──❍「 *CALL DETECTED* 」❍\n├• 👋 Hello @${callerNumber}\n├• 📞 Your call was auto-declined\n├• ⚠️ Warning *${warnCount}/${limit}*\n├• 🚫 Blocked after ${limit - warnCount} more call(s)\n╰───★─☆─♪♪─❍\n\n╭──❍「 *WALLYJAYTECH-MD* 」❍\n╰───★─☆─♪♪─❍`;
                    }
                } else {
                    msg = state.message.replace(/\{caller\}/g, callerNumber);
                }
                
                await sock.sendMessage(callerJid, { text: msg, mentions: [callerJid] });
            } catch (e) {}
        }
    } catch (error) { console.error('Error in handleAnticall:', error); }
}

module.exports = { anticallCommand, readState, handleAnticall };
