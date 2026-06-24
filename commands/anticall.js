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
 * Auto-updates message template on version change
 */

const fs = require('fs');
const settings = require('../settings');

const ANTICALL_PATH = './data/anticall.json';

const defaultConfig = {
    enabled: false,
    blockCallers: false,
    message: `╭──❍「 CALL REJECTED 」❍\n├• 👋 Hello @{caller}\n├• 📞 Your call was auto-declined\n├• 💬 Please send a text message\n├• 🤖 I'll respond when available\n╰───★─☆─♪♪─❍\n\n╭──❍「 WALLYJAYTECH-MD 」❍\n╰───★─☆─♪♪─❍`
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
            const preserved = { enabled: data.enabled, blockCallers: data.blockCallers };
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

async function anticallCommand(sock, chatId, message, args) {
    try {
        const state = readState();
        const sub = (args || '').trim().toLowerCase();
        const action = sub.split(' ')[0];

        if (!action) {
            const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = state.enabled ? '🟢' : '🔴';
            const mode = state.blockCallers ? '🚫 Block Callers' : '📵 Decline Only';
            await sock.sendMessage(chatId, {
                text: `📞 *ANTI-CALL SETTINGS*\n\n━━━━━━━━━━━━━━━━━━━━\n${statusIcon} *Status:* ${status}\n⚙️ *Mode:* ${mode}\n\n━━━━━━━━━━━━━━━━━━━━\n📖 *Commands:*\n└ .anticall on - Enable\n└ .anticall off - Disable\n└ .anticall block - Block callers\n└ .anticall decline - Decline only\n└ .anticall message <text> - Custom message\n└ .anticall status - Show settings\n\n💡 *Example:*\n└ .anticall on\n└ .anticall message Hello @{caller}!`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (action === 'status') {
            const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const mode = state.blockCallers ? '🚫 Block Callers' : '📵 Decline Only';
            const msgPreview = state.message.substring(0, 80) + (state.message.length > 80 ? '...' : '');
            await sock.sendMessage(chatId, { text: `📞 *ANTI-CALL STATUS*\n\n━━━━━━━━━━━━━━━━━━━━\n🟢 *Status:* ${status}\n⚙️ *Mode:* ${mode}\n\n💬 *Message:*\n_${msgPreview}_\n\n💡 Use @{caller} to mention caller.`, ...channelInfo });
            return;
        }

        if (action === 'on') {
            if (state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY ENABLED*`, ...channelInfo }); return; }
            writeState({ ...state, enabled: true });
            await sock.sendMessage(chatId, { text: `✅ *ANTI-CALL ENABLED*\n\n📞 Calls auto-rejected.`, ...channelInfo });
            return;
        }

        if (action === 'off') {
            if (!state.enabled) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY DISABLED*`, ...channelInfo }); return; }
            writeState({ ...state, enabled: false });
            await sock.sendMessage(chatId, { text: `❌ *ANTI-CALL DISABLED*`, ...channelInfo });
            return;
        }

        if (action === 'block') {
            if (state.enabled && state.blockCallers) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*`, ...channelInfo }); return; }
            writeState({ ...state, enabled: true, blockCallers: true });
            await sock.sendMessage(chatId, { text: `🚫 *BLOCK MODE ON*\n\n📞 Calls rejected & callers blocked.`, ...channelInfo });
            return;
        }

        if (action === 'decline') {
            if (state.enabled && !state.blockCallers) { await sock.sendMessage(chatId, { text: `⚠️ *ALREADY SET*`, ...channelInfo }); return; }
            writeState({ ...state, enabled: true, blockCallers: false });
            await sock.sendMessage(chatId, { text: `📵 *DECLINE MODE ON*\n\n📞 Calls declined, callers NOT blocked.`, ...channelInfo });
            return;
        }

        if (action === 'message') {
            const newMessage = sub.substring(7).trim();
            if (!newMessage) { await sock.sendMessage(chatId, { text: `⚠️ *USAGE:* .anticall message <text>`, ...channelInfo }); return; }
            writeState({ ...state, message: newMessage });
            await sock.sendMessage(chatId, { text: `💬 *MESSAGE SET*\n\n📝 _${newMessage}_`, ...channelInfo });
            return;
        }
    } catch (error) { console.error('❌ Anti-call command error:', error); }
}

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
                try { if (typeof sock.rejectCall === 'function' && call.id) await sock.rejectCall(call.id, callerJid); else if (typeof sock.sendCallOfferAck === 'function' && call.id) await sock.sendCallOfferAck(call.id, callerJid, 'reject'); } catch (e) {}
                if (!antiCallNotified.has(callerJid)) {
                    antiCallNotified.add(callerJid);
                    setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                    const msg = state.message.replace(/\{caller\}/g, callerNumber);
                    await sock.sendMessage(callerJid, { text: msg, mentions: [callerJid] });
                }
                if (state.blockCallers) { setTimeout(async () => { try { await sock.updateBlockStatus(callerJid, 'block'); } catch (e) {} }, 2000); }
            } catch (e) {}
        }
    } catch (error) { console.error('Error in handleAnticall:', error); }
}

module.exports = { anticallCommand, readState, handleAnticall };
