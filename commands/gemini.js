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
const settings = require('../settings');

const PROXY_URL = settings.geminiProxyUrl || 'https://gemini-proxy-10a1.onrender.com/v1/gemini';

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

function fixFormattingPerLine(text) {
    const lines = text.split('\n');
    const fixed = [];

    for (const line of lines) {
        let l = line;

        // Strip formatting from lines over 30 chars
        if (l.length > 30) {
            l = l.replace(/\*(.+?)\*/g, '$1');
            l = l.replace(/_(.+?)_/g, '$1');
            l = l.replace(/~(.+?)~/g, '$1');
        }

        const boldMatches = l.match(/\*/g);
        if (boldMatches && boldMatches.length % 2 !== 0) l += '*';

        const underCount = (l.match(/_/g) || []).length;
        if (underCount % 2 !== 0) l += '_';

        const strikeMatches = l.match(/~/g);
        if (strikeMatches && strikeMatches.length % 2 !== 0) l += '~';

        const codeMatches = l.match(/```/g);
        if (codeMatches && codeMatches.length % 2 !== 0) l += '```';

        if (l.length > 35 && (l.includes('*') || l.includes('_'))) {
            const splitPoint = l.lastIndexOf(' ', 35);
            if (splitPoint > 10) {
                fixed.push(l.substring(0, splitPoint).trim());
                fixed.push(l.substring(splitPoint + 1).trim());
                continue;
            }
        }

        fixed.push(l);
    }

    return fixed.join('\n');
}

async function geminiCommand(sock, chatId, message) {
    let loadingMsg;
    let interval;

    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1);
        let query = args.join(' ').trim();

        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let quotedText = '';

        if (quotedMessage) {
            quotedText = quotedMessage.conversation || 
                        quotedMessage.extendedTextMessage?.text || 
                        quotedMessage.imageMessage?.caption || 
                        quotedMessage.videoMessage?.caption || '';
        }

        if (quotedText && query) {
            query = `Regarding this: "${quotedText}"\n\n${query}`;
        } else if (quotedText) {
            query = quotedText;
        }

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *GEMINI AI* 」◆\n` +
                      `├\n` +
                      `├◇ 🤖 Powered by Google Gemini\n` +
                      `├◇ 🆓 Free — No key needed\n` +
                      `├\n` +
                      `├◇ *📖 Usage:*\n` +
                      `├  └ .gemini <question>\n` +
                      `├  └ Reply to a message with .gemini\n` +
                      `├  └ Reply with .gemini <question>\n` +
                      `├\n` +
                      `├◇ *✨ Examples:*\n` +
                      `├  └ .gemini write a poem\n` +
                      `├  └ .gemini explain gravity\n` +
                      `├\n` +
                      `╰─┬─★─☆─♪♪─◆\n\n` +
                      `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                      `╰───★─☆─♪♪─◆`
            }, { quoted: message });
        }

        loadingMsg = await sock.sendMessage(chatId, { text: LOADING_FRAMES[0] });
        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        let frame = 0;
        interval = setInterval(async () => {
            try {
                if (frame < LOADING_FRAMES.length - 1) {
                    frame++;
                    await sock.sendMessage(chatId, { edit: loadingMsg.key, text: LOADING_FRAMES[frame] });
                }
            } catch (e) {}
        }, 600);

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-bot-repo': 'wallyjaytechh/WALLYJAYTECH-MD'
            },
            body: JSON.stringify({ prompt: query })
        });
        const data = await response.json();
        let answer = data.reply;

        clearInterval(interval);
        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Done [■■■■■■■■■■]' });

        if (!answer) throw new Error('NO_RESPONSE');

        answer = answer.replace(/\n---\n/g, '\n\n');
        answer = answer.replace(/\n[-_]{3,}\n/g, '\n\n');
        answer = answer.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
        answer = fixFormattingPerLine(answer);

        const rawLines = answer.split('\n');
        let output = '';
        for (const line of rawLines) {
            if (line.trim().length === 0) {
                output += '├\n';
            } else {
                const wrapped = wrapText(line.trim(), 40);
                for (const w of wrapped) {
                    output += `├◇ ${w}\n`;
                }
            }
        }

        await sock.sendMessage(chatId, {
            text: `╭──◆「 *GEMINI AI* 」◆\n` +
                  `├\n` +
                  output +
                  `├\n` +
                  `╰─┬─★─☆─♪♪─◆\n\n` +
                  `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                  `╰───★─☆─♪♪─◆`
        }, { quoted: message });

    } catch (error) {
        console.error('Gemini error');

        if (interval) {
            clearInterval(interval);
            interval = null;
        }

        if (loadingMsg) {
            try {
                await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Failed [■■■■■■□□□□]' });
            } catch (e) {}
        }

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
