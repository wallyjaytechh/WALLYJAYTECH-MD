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

const fetch = require('node-fetch');
const PROXY_URL = 'https://gemini-proxy-10a1.onrender.com';

function getSenderNumber(message) {
    const rawJid = message.key.participant || message.key.remoteJid;
    const senderJid = rawJid.endsWith('@lid') ? (message.key.remoteJidAlt || rawJid) : rawJid;
    return senderJid.split('@')[0].split(':')[0];
}

async function setpremiumCommand(sock, chatId, message) {
    try {
        const senderNumber = getSenderNumber(message);
        const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1);
        const targetNumber = args[0];
        if (!targetNumber) {
            return sock.sendMessage(chatId, { text: '❌ Usage: .setpremium <number>' }, { quoted: message });
        }

        const res = await fetch(`${PROXY_URL}/v1/premium/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminNumber: senderNumber, targetNumber })
        });
        const data = await res.json();

        if (res.status === 401) {
            return sock.sendMessage(chatId, { text: '╭──◆「 *PREMIUM* 」◆\n├\n├◇ ❌ Admin only\n├\n╰─┬─★─☆─♪♪─◆' }, { quoted: message });
        }

        const expDate = new Date(data.expires).toLocaleDateString('en-GB');
        return sock.sendMessage(chatId, {
            text: `╭──◆「 *PREMIUM ADDED* 」◆\n├\n├◇ ✅ ${targetNumber}\n├◇ 📅 Expires: ${expDate}\n├◇ ⏳ 31 days remaining\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to add premium user' }, { quoted: message });
    }
}

async function rmpremiumCommand(sock, chatId, message) {
    try {
        const senderNumber = getSenderNumber(message);
        const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1);
        const targetNumber = args[0];
        if (!targetNumber) {
            return sock.sendMessage(chatId, { text: '❌ Usage: .rmpremium <number>' }, { quoted: message });
        }

        const res = await fetch(`${PROXY_URL}/v1/premium/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminNumber: senderNumber, targetNumber })
        });

        if (res.status === 401) {
            return sock.sendMessage(chatId, { text: '╭──◆「 *PREMIUM* 」◆\n├\n├◇ ❌ Admin only\n├\n╰─┬─★─☆─♪♪─◆' }, { quoted: message });
        }

        return sock.sendMessage(chatId, {
            text: `╭──◆「 *PREMIUM REMOVED* 」◆\n├\n├◇ ❌ ${targetNumber}\n├◇ Premium access revoked\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to remove premium user' }, { quoted: message });
    }
}

async function listpremiumCommand(sock, chatId, message) {
    try {
        const senderNumber = getSenderNumber(message);
        const res = await fetch(`${PROXY_URL}/v1/premium/list`, {
            headers: { 'x-user-number': senderNumber }
        });
        if (res.status === 401) {
            return sock.sendMessage(chatId, { text: '╭──◆「 *PREMIUM* 」◆\n├\n├◇ ❌ Admin only\n├\n╰─┬─★─☆─♪♪─◆' }, { quoted: message });
        }
        const data = await res.json();

        let msg = `╭──◆「 *PREMIUM USERS* 」◆\n├\n`;
        msg += `├◇ 📊 Total: ${data.total}\n`;
        msg += `├◇ 🟢 Active: ${data.active}\n`;
        msg += `├◇ 🔴 Inactive: ${data.inactive}\n`;
        msg += `├\n├◇ *All Users:*\n`;
        for (const u of data.users) {
            const icon = u.active ? '🟢' : '🔴';
            msg += `├◇ ${icon} ${u.number}\n`;
        }
        msg += `├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;

        await sock.sendMessage(chatId, { text: msg }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch premium list' }, { quoted: message });
    }
}

async function checkplanCommand(sock, chatId, message) {
    try {
        const args = (message.message?.conversation || message.message?.extendedTextMessage?.text || '').split(' ').slice(1);
        const targetNumber = args[0];
        if (!targetNumber) {
            return sock.sendMessage(chatId, { text: '❌ Usage: .checkplan <number>' }, { quoted: message });
        }

        const res = await fetch(`${PROXY_URL}/v1/premium/status/${targetNumber}`);
        const data = await res.json();

        if (!data.premium) {
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *PREMIUM STATUS* 」◆\n├\n├◇ 👤 User: ${targetNumber}\n├◇ ❌ Not a premium user\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
            }, { quoted: message });
        }

        const statusEmoji = data.status === 'Active' ? '✅' : '❌';
        const startDate = new Date(data.started).toLocaleDateString('en-GB');
        const expDate = new Date(data.expires).toLocaleDateString('en-GB');

        let msg = `╭──◆「 *PREMIUM STATUS* 」◆\n├\n`;
        msg += `├◇ 👤 User: ${data.number}\n`;
        msg += `├◇ ${statusEmoji} Status: ${data.status}\n`;
        if (data.status === 'Active') {
            msg += `├◇ 📅 Started: ${startDate}\n`;
            msg += `├◇ 📅 Expires: ${expDate}\n`;
            msg += `├◇ ⏳ ${data.remainingDays} days remaining\n`;
            msg += `├◇ 🟢 Online: ${data.isOnline ? 'Yes' : 'No'}\n`;
        } else {
            msg += `├◇ 📅 Expired: ${expDate}\n`;
            msg += `├◇ ⚠️ ${data.expiredDaysAgo} days ago\n`;
        }
        msg += `├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;

        await sock.sendMessage(chatId, { text: msg }, { quoted: message });

    } catch (e) {
        await sock.sendMessage(chatId, { text: '❌ Failed to check plan' }, { quoted: message });
    }
}

module.exports = { setpremiumCommand, rmpremiumCommand, listpremiumCommand, checkplanCommand };
