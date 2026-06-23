//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                            //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                         //
//                                                                                                                                                            //
//                                                                  𝐕 : 1.0.0                                                                                 //
//                                                                                                                                                            //
//                                                                                                                                                            //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                    //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗                   //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║                   //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║                   //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝                   //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                    //
//                                                                                                                                                            //
//                                                                 𝐂𝐎𝐏𝐘𝐑𝐈𝐆𝐇𝐓 2025                                                                            //
//                                                                                                                                                            //
//                                                                                                                                                            //
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
 */

const fs = require('fs');

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
        if (!fs.existsSync(ANTICALL_PATH)) {
            const dir = './data';
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(ANTICALL_PATH, JSON.stringify(defaultConfig, null, 2));
            return { ...defaultConfig };
        }
        return { ...defaultConfig, ...JSON.parse(fs.readFileSync(ANTICALL_PATH, 'utf8')) };
    } catch {
        return { ...defaultConfig };
    }
}

function writeState(config) {
    try {
        const dir = './data';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(ANTICALL_PATH, JSON.stringify({ ...defaultConfig, ...config }, null, 2));
    } catch (error) {
        console.error('❌ Error writing anticall config:', error);
    }
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
                text: `📞 *ANTI-CALL SETTINGS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `⚙️ *Mode:* ${mode}\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 *Commands:*\n` +
                      `└ .anticall on - Enable anti-call\n` +
                      `└ .anticall off - Disable anti-call\n` +
                      `└ .anticall block - Block callers\n` +
                      `└ .anticall decline - Decline only\n` +
                      `└ .anticall message <text> - Set custom message\n` +
                      `└ .anticall status - Show settings\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Example:*\n` +
                      `└ .anticall on\n` +
                      `└ .anticall message Hello @{caller}, I'm busy!`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (action === 'status') {
            const status = state.enabled ? '✅ ENABLED' : '❌ DISABLED';
            const statusIcon = state.enabled ? '🟢' : '🔴';
            const mode = state.blockCallers ? '🚫 Block Callers' : '📵 Decline Only';
            const msgPreview = state.message.substring(0, 80) + (state.message.length > 80 ? '...' : '');

            await sock.sendMessage(chatId, {
                text: `📞 *ANTI-CALL STATUS*\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `${statusIcon} *Status:* ${status}\n` +
                      `⚙️ *Mode:* ${mode}\n\n` +
                      `💬 *Message:*\n_${msgPreview}_\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 Use @{caller} in your message to mention the caller.`,
                ...channelInfo
            }, { quoted: message });
            return;
        }

        if (action === 'on') {
            if (state.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already *ON*.\n\n💡 Use .anticall off to disable.`,
                    ...channelInfo
                });
                return;
            }
            writeState({ ...state, enabled: true });
            await sock.sendMessage(chatId, {
                text: `✅ *ANTI-CALL ENABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Incoming calls will be auto-rejected.\n⚙️ Mode: ${state.blockCallers ? 'Block Callers' : 'Decline Only'}\n\n💡 Use .anticall block or .anticall decline to change mode.`,
                ...channelInfo
            });
            return;
        }

        if (action === 'off') {
            if (!state.enabled) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already *OFF*.\n\n💡 Use .anticall on to enable.`,
                    ...channelInfo
                });
                return;
            }
            writeState({ ...state, enabled: false });
            await sock.sendMessage(chatId, {
                text: `❌ *ANTI-CALL DISABLED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will no longer be auto-handled.`,
                ...channelInfo
            });
            return;
        }

        if (action === 'block') {
            if (state.enabled && state.blockCallers) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already in *Block Mode*.\n\n💡 Use .anticall decline to switch.`,
                    ...channelInfo
                });
                return;
            }
            writeState({ ...state, enabled: true, blockCallers: true });
            await sock.sendMessage(chatId, {
                text: `🚫 *BLOCK MODE ACTIVATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will be rejected.\n👤 Callers will be blocked.\n💬 Custom message sent before block.`,
                ...channelInfo
            });
            return;
        }

        if (action === 'decline') {
            if (state.enabled && !state.blockCallers) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *ALREADY SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Anti-Call is already in *Decline Mode*.\n\n💡 Use .anticall block to switch.`,
                    ...channelInfo
                });
                return;
            }
            writeState({ ...state, enabled: true, blockCallers: false });
            await sock.sendMessage(chatId, {
                text: `📵 *DECLINE MODE ACTIVATED*\n\n━━━━━━━━━━━━━━━━━━━━\n📞 Calls will be declined.\n👤 Callers will NOT be blocked.\n💬 Custom message will be sent.`,
                ...channelInfo
            });
            return;
        }

        if (action === 'message') {
            const newMessage = sub.substring(7).trim();
            if (!newMessage) {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *USAGE*\n\n━━━━━━━━━━━━━━━━━━━━\n📖 .anticall message <text>\n\n✨ *Example:*\n└ .anticall message Hello @{caller}, I'm busy!\n\n💡 Use @{caller} to mention the caller.`,
                    ...channelInfo
                });
                return;
            }
            writeState({ ...state, message: newMessage });
            await sock.sendMessage(chatId, {
                text: `💬 *CUSTOM MESSAGE SET*\n\n━━━━━━━━━━━━━━━━━━━━\n📝 *New Message:*\n_${newMessage}_\n\n💡 @{caller} will be replaced with caller's name.`,
                ...channelInfo
            });
            return;
        }
    } catch (error) {
        console.error('❌ Anti-call command error:', error);
    }
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

                try {
                    if (typeof sock.rejectCall === 'function' && call.id) {
                        await sock.rejectCall(call.id, callerJid);
                    } else if (typeof sock.sendCallOfferAck === 'function' && call.id) {
                        await sock.sendCallOfferAck(call.id, callerJid, 'reject');
                    }
                    console.log(`📞 Call from ${callerNumber} rejected`);
                } catch (rejectError) {
                    console.error('Error rejecting call:', rejectError);
                }

                if (!antiCallNotified.has(callerJid)) {
                    antiCallNotified.add(callerJid);
                    setTimeout(() => antiCallNotified.delete(callerJid), 60000);

                    const customMessage = state.message.replace(/\{caller\}/g, callerNumber);
                    await sock.sendMessage(callerJid, {
                        text: customMessage,
                        mentions: [callerJid]
                    });
                    console.log(`💬 Sent anti-call message to ${callerNumber}`);
                }

                if (state.blockCallers) {
                    setTimeout(async () => {
                        try {
                            await sock.updateBlockStatus(callerJid, 'block');
                            console.log(`🚫 Blocked caller: ${callerNumber}`);
                        } catch (blockError) {
                            console.error('Error blocking caller:', blockError);
                        }
                    }, 2000);
                }

            } catch (error) {
                console.error('Error in anti-call handler:', error);
            }
        }
    } catch (error) {
        console.error('Error in handleAnticall:', error);
    }
}

module.exports = { anticallCommand, readState, handleAnticall };
