//════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════//
//                                                                                                                                                            //
//                                                             𝐖𝐀𝐋𝐋𝐘𝐉𝐀𝐘𝐓𝐄𝐂𝐇-𝐌𝐃 𝐁𝐎𝐓                                                                         //
//                                                                                                                                                            //
//                                                                  𝐕 : 1.0.0                                                                                 //
//                                                                                                                                                            //
//                                                                                                                                                            //
//                ██╗    ██╗ █████╗ ██╗     ██╗  ██╗   ██╗   ██╗ █████╗ ██╗   ██╗████████╗███████╗ ██████╗██╗  ██╗      ███╗   ███╗██████╗                 //
//                ██║    ██║██╔══██╗██║     ██║  ╚██╗ ██╔╝   ██║██╔══██╗╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔════╝██║  ██║      ████╗ ████║██╔══██╗              //
//                ██║ █╗ ██║███████║██║     ██║   ╚████╔╝    ██║███████║ ╚████╔╝    ██║   █████╗  ██║     ███████║█████╗██╔████╔██║██║  ██║               //
//                ██║███╗██║██╔══██║██║     ██║    ╚██╔╝██   ██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██║     ██╔══██║╚════╝██║╚██╔╝██║██║  ██║               //
//                ╚███╔███╔╝██║  ██║███████╗███████╗██║ ╚█████╔╝██║  ██║   ██║      ██║   ███████╗╚██████╗██║  ██║      ██║ ╚═╝ ██║██████╔╝              //
//                 ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝      ╚═╝     ╚═╝╚═════╝                 //
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

const fetch = require('node-fetch');

const PROXY_URL = 'https://gemini-proxy-10a1.onrender.com/v1/gemini';

const LOADING_FRAMES = [
    'Thinking [■□□□□□□□□□]',
    'Thinking [■■□□□□□□□□]',
    'Thinking [■■■□□□□□□□]',
    'Thinking [■■■■□□□□□□]',
    'Thinking [■■■■■□□□□□]',
    'Thinking [■■■■■■□□□□]',
    'Thinking [■■■■■■■□□□]',
    'Thinking [■■■■■■■■□□]',
    'Thinking [■■■■■■■■■□]'
];

function wrapText(text, maxLen = 30) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    for (const word of words) {
        if ((current + word).length > maxLen && current.length > 0) {
            lines.push(current.trim());
            current = word;
        } else {
            current += (current ? ' ' : '') + word;
        }
    }
    if (current) lines.push(current.trim());
    return lines;
}

async function geminiCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *GEMINI AI* 」◆\n` +
                      `├\n` +
                      `├◇ 🤖 Powered by Google Gemini\n` +
                      `├◇ 🆓 Free — No key needed\n` +
                      `├\n` +
                      `├◇ *📖 Usage:*\n` +
                      `├  └ .gemini <question>\n` +
                      `├\n` +
                      `├◇ *✨ Examples:*\n` +
                      `├  └ .gemini write a poem\n` +
                      `├  └ .gemini explain gravity\n` +
                      `├  └ .gemini code a login form\n` +
                      `├\n` +
                      `╰─┬─★─☆─♪♪─◆\n\n` +
                      `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                      `╰───★─☆─♪♪─◆`
            }, { quoted: message });
        }

        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        // Loading animation
        const loadingMsg = await sock.sendMessage(chatId, { text: LOADING_FRAMES[0] });
        let frame = 0;
        const interval = setInterval(async () => {
            try {
                if (frame < LOADING_FRAMES.length) {
                    await sock.sendMessage(chatId, { edit: loadingMsg.key, text: LOADING_FRAMES[frame] });
                    frame++;
                }
            } catch (e) {}
        }, 600);

        // Call Gemini proxy
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: query })
        });
        const data = await response.json();
        const answer = data.reply;

        clearInterval(interval);
        await sock.sendMessage(chatId, { delete: loadingMsg.key });

        if (!answer) throw new Error('NO_RESPONSE');

        // Wrap lines to max 30 chars
        const rawLines = answer.split('\n');
        let formattedAnswer = '';
        for (const line of rawLines) {
            if (line.trim().length === 0) {
                formattedAnswer += '├\n';
            } else {
                const wrapped = wrapText(line, 30);
                for (const w of wrapped) {
                    formattedAnswer += `├◇ ${w}\n`;
                }
            }
        }

        await sock.sendMessage(chatId, {
            text: `╭──◆「 *GEMINI AI* 」◆\n` +
                  `├\n` +
                  formattedAnswer +
                  `├\n` +
                  `╰─┬─★─☆─♪♪─◆\n\n` +
                  `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                  `╰───★─☆─♪♪─◆`
        }, { quoted: message });

    } catch (error) {
        console.error('Gemini error');
        await sock.sendMessage(chatId, {
            text: `╭──◆「 *GEMINI AI* 」◆\n` +
                  `├\n` +
                  `├◇ ❌ Failed to get response\n` +
                  `├◇ 💡 Try again later\n` +
                  `├\n` +
                  `╰─┬─★─☆─♪♪─◆\n\n` +
                  `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                  `╰───★─☆─♪♪─◆`
        }, { quoted: message });
    }
}

module.exports = geminiCommand;
