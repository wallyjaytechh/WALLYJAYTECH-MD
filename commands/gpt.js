const fetch = require('node-fetch');

const PROXY_URL = 'https://gemini-proxy-10a1.onrender.com/v1/gpt';

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

async function gptCommand(sock, chatId, message) {
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

        if (quotedText && query) query = `Regarding this: "${quotedText}"\n\n${query}`;
        else if (quotedText) query = quotedText;

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *GPT AI* 」◆\n├\n├◇ 🤖 Powered by GPT-5.4\n├◇ 🆓 Free — No key needed\n├\n├◇ *📖 Usage:*\n├  └ .gpt <question>\n├  └ Reply to a message with .gpt\n├\n├◇ *✨ Examples:*\n├  └ .gpt write a poem\n├  └ .gpt explain gravity\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
            }, { quoted: message });
        }

        // Send thinking message FIRST (so it shows as chat preview)
        loadingMsg = await sock.sendMessage(chatId, { text: LOADING_FRAMES[0] });
        
        // THEN react to user's message
        await sock.sendMessage(chatId, { react: { text: '🤖', key: message.key } });

        let frame = 0;
        interval = setInterval(async () => {
            try { if (frame < LOADING_FRAMES.length - 1) { frame++; await sock.sendMessage(chatId, { edit: loadingMsg.key, text: LOADING_FRAMES[frame] }); } } catch (e) {}
        }, 600);

        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-bot-origin': 'wallyjaytechh/WALLYJAYTECH-MD'
            },
            body: JSON.stringify({ prompt: query })
        });
        const data = await response.json();
        let answer = data.reply;

        clearInterval(interval);
        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Done [■■■■■■■■■■]' });

        if (!answer) throw new Error('NO_RESPONSE');

        const rawLines = answer.split('\n');
        let output = '';
        for (const line of rawLines) {
            if (line.trim().length === 0) {
                output += '├\n';
            } else {
                const wrapped = wrapText(line.trim(), 30);
                for (const w of wrapped) output += `├◇ ${w}\n`;
            }
        }

        await sock.sendMessage(chatId, {
            text: `╭──◆「 *GPT AI* 」◆\n├\n` + output + `├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });

    } catch (error) {
        if (interval) { clearInterval(interval); interval = null; }
        if (loadingMsg) { try { await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Failed [■■■■■■□□□□]' }); } catch (e) {} }
        await sock.sendMessage(chatId, {
            text: `╭──◆「 *GPT AI* 」◆\n├\n├◇ ❌ Failed to get response\n├◇ 💡 Try again later\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });
    }
}

module.exports = gptCommand;
