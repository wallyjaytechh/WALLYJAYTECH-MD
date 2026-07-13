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
const fs = require('fs');
const path = require('path');

const PROXY_URL = 'https://gemini-proxy-10a1.onrender.com';

function getSenderNumber(message) {
    const rawJid = message.key.participant || message.key.remoteJid;
    const senderJid = rawJid.endsWith('@lid') ? (message.key.remoteJidAlt || rawJid) : rawJid;
    return senderJid.split('@')[0].split(':')[0];
}

async function checkPremium(number) {
    try {
        const res = await fetch(`${PROXY_URL}/v1/premium/check/${number}`);
        const data = await res.json();
        return data.premium === true;
    } catch (e) {
        return false;
    }
}

const LOADING_FRAMES = [
    'Coding [■□□□□□□□□□]',
    'Coding [■■□□□□□□□□]',
    'Coding [■■■□□□□□□□]',
    'Coding [■■■■□□□□□□]',
    'Coding [■■■■■□□□□□]',
    'Coding [■■■■■■□□□□]',
    'Coding [■■■■■■■□□□]',
    'Coding [■■■■■■■■□□]',
    'Coding [■■■■■■■■■□]'
];

const EXT_MAP = {
    'javascript': 'js', 'js': 'js', 'typescript': 'ts', 'ts': 'ts',
    'python': 'py', 'py': 'py', 'html': 'html', 'css': 'css',
    'dart': 'dart', 'java': 'java', 'cpp': 'cpp', 'c++': 'cpp',
    'c': 'c', 'csharp': 'cs', 'cs': 'cs', 'ruby': 'rb', 'rb': 'rb',
    'php': 'php', 'swift': 'swift', 'kotlin': 'kt', 'kt': 'kt',
    'go': 'go', 'rust': 'rs', 'rs': 'rs', 'sql': 'sql',
    'json': 'json', 'xml': 'xml', 'yaml': 'yml', 'yml': 'yml',
    'bash': 'sh', 'sh': 'sh', 'powershell': 'ps1', 'ps1': 'ps1',
    'r': 'r', 'scala': 'scala', 'perl': 'pl', 'lua': 'lua',
    'jsx': 'jsx', 'tsx': 'tsx', 'vue': 'vue', 'svelte': 'svelte',
    'dockerfile': 'dockerfile', 'docker': 'dockerfile',
    'markdown': 'md', 'md': 'md', 'makefile': 'makefile'
};

function wrapFeedback(text, maxLen = 25) {
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
        if ((current + ' ' + word).length > maxLen && current.length > 0) {
            lines.push(current.trim());
            current = word;
        } else {
            current += (current ? ' ' : '') + word;
        }
    }
    if (current) lines.push(current.trim());
    return lines;
}

async function codeCommand(sock, chatId, message) {
    let loadingMsg;

    try {
        // 🔒 PREMIUM CHECK
        const senderNumber = getSenderNumber(message);
        const isPremium = await checkPremium(senderNumber);
        if (!isPremium) {
            return sock.sendMessage(chatId, {
                text: '╭──◆「 *PREMIUM ONLY* 」◆\n├\n├◇ 💎 This command is premium\n├◇ 🔓 Use .subscribe to upgrade\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰──★─☆─♪♪─◆'
            }, { quoted: message });
        }

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *AI CODE GENERATOR* 」◆\n` +
                    `├\n` +
                    `├◇ 💻 Generate code with AI\n` +
                    `├◇ 🤖 GPT-4o + Llama + Pollinations\n` +
                    `├◇ 🆓 Free via GitHub Models\n` +
                    `├\n` +
                    `├◇ *📖 Usage:*\n` +
                    `├  └ .code <prompt>\n` +
                    `├\n` +
                    `├◇ *✨ Examples:*\n` +
                    `├  └ .code login form in html\n` +
                    `├  └ .code python fibonacci function\n` +
                    `├  └ .code discord bot in js\n` +
                    `├\n` +
                    `╰─┬─★─☆─♪♪─◆\n\n` +
                    `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                    `╰───★─☆─♪♪─◆`
            }, { quoted: message });
        }

        loadingMsg = await sock.sendMessage(chatId, { text: LOADING_FRAMES[0] });

        let frame = 0;
        const interval = setInterval(async () => {
            try { if (frame < LOADING_FRAMES.length - 1) { frame++; await sock.sendMessage(chatId, { edit: loadingMsg.key, text: LOADING_FRAMES[frame] }); } } catch (e) {}
        }, 600);

        const response = await fetch(`${PROXY_URL}/v1/code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-bot-repo': 'wallyjaytechh/WALLYJAYTECH-MD'
            },
            body: JSON.stringify({ prompt: query })
        });

        const data = await response.json();
        const answer = data.reply;
        const usedModel = data.model || 'AI';

        clearInterval(interval);

        if (!answer || answer.length < 10) throw new Error('NO_RESPONSE');

        const codeBlockMatch = answer.match(/```[\s\S]*?```/);
        const cleanCode = codeBlockMatch
            ? codeBlockMatch[0].replace(/```\w*\n?/g, '').replace(/```/g, '').trim()
            : answer.trim();

        const langMatch = codeBlockMatch ? codeBlockMatch[0].match(/```(\w+)/) : null;
        const lang = langMatch ? langMatch[1].toLowerCase() : '';
        const extension = EXT_MAP[lang] || 'txt';

        const fileMatch = answer.match(/FILENAME:\s*(\w+)/i);
        const fileNameWord = (fileMatch ? fileMatch[1] : 'code').toLowerCase();
        const fileName = `${fileNameWord}.${extension}`;

        const feedbackRaw = answer.replace(/```[\s\S]*?```/g, '').replace(/FILENAME:\s*\w+/i, '').trim();
        const allFeedbackLines = wrapFeedback(feedbackRaw, 25);

        const mid = Math.ceil(allFeedbackLines.length / 2);
        const rawFeedbackLines = allFeedbackLines.slice(0, mid);
        const demoFeedbackLines = allFeedbackLines.slice(mid);

        let rawFeedbackOutput = '';
        for (const line of rawFeedbackLines) rawFeedbackOutput += `├◇ ${line.toLowerCase()}\n`;

        let demoFeedbackOutput = '';
        const demoLinesToUse = demoFeedbackLines.length > 0 ? demoFeedbackLines : rawFeedbackLines;
        for (const line of demoLinesToUse) demoFeedbackOutput += `├◇ ${line.toLowerCase()}\n`;

        const outputDir = './output';
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

        const txtFileName = `${fileNameWord}.txt`;
        const txtPath = path.join(outputDir, txtFileName);
        fs.writeFileSync(txtPath, cleanCode);

        let demoFileName, demoContent;
        if (extension === 'html') {
            demoFileName = fileName;
            demoContent = cleanCode;
        } else {
            demoFileName = `${fileNameWord}_preview.html`;
            demoContent = `<pre><code>${cleanCode.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
        }
        const demoPath = path.join(outputDir, demoFileName);
        fs.writeFileSync(demoPath, demoContent);

        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Done [■■■■■■■■■■]' });

        await sock.sendMessage(chatId, {
            document: fs.readFileSync(txtPath),
            fileName: txtFileName,
            mimetype: 'text/plain',
            caption: `╭──◆「 *RAW CODE* 」◆\n` +
                `├\n` +
                `├◇ *💻 File:* ${txtFileName}\n` +
                `├\n` +
                `├◇ *📝 Feedback:*\n` +
                rawFeedbackOutput +
                `├\n` +
                `├◇ *🤖 Model:* ${usedModel}\n` +
                `├\n` +
                `╰─┬─★─☆─♪♪─◆\n\n` +
                `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                `╰───★─☆─♪♪─◆`
        }, { quoted: message });

        await sock.sendMessage(chatId, {
            document: fs.readFileSync(demoPath),
            fileName: demoFileName,
            mimetype: 'text/html',
            caption: `╭──◆「 *${extension === 'html' ? 'LIVE PREVIEW' : 'CODE PREVIEW'}* 」◆\n` +
                `├\n` +
                `├◇ *💻 File:* ${demoFileName}\n` +
                `├\n` +
                `├◇ *📝 Feedback:*\n` +
                demoFeedbackOutput +
                `├\n` +
                `├◇ *🤖 Model:* ${usedModel}\n` +
                `├\n` +
                `╰─┬─★─☆─♪♪─◆\n\n` +
                `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                `╰───★─☆─♪♪─◆`
        }, { quoted: message });

        fs.unlinkSync(txtPath);
        fs.unlinkSync(demoPath);

    } catch (error) {
        console.error('Code error:', error.message);
        if (loadingMsg) { try { await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Failed [■■■■■■□□□□]' }); } catch (e) {} }
        await sock.sendMessage(chatId, {
            text: `╭──◆「 *CODE FAILED* 」◆\n├\n├◇ ❌ Unable to generate code\n├◇ 💡 Try a different prompt\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });
    }
}

module.exports = codeCommand;
