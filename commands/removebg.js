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
 * WALLYJAYTECH-MD - Remove Background Command (.removebg)
 * Powered by Remove.BG via WALLYJAYTECH Proxy
 * Features: Reply to image | Send with caption | Loading animation
 * Professional Version
 */

const fetch = require('node-fetch');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const PROXY_URL = 'https://gemini-proxy-10a1.onrender.com/v1/removebg';

const BAR_FRAMES = [
    '[□□□□□□□□□□] 0%',
    '[■□□□□□□□□□] 10%',
    '[■■□□□□□□□□] 20%',
    '[■■■□□□□□□□] 30%',
    '[■■■■□□□□□□] 40%',
    '[■■■■■□□□□□] 50%',
    '[■■■■■■□□□□] 60%',
    '[■■■■■■■□□□] 70%',
    '[■■■■■■■■□□] 80%',
    '[■■■■■■■■■□] 90%',
    '[■■■■■■■■■■] 100%'
];

async function getImageBuffer(sock, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        console.log('Quoted message exists:', !!quoted);
        console.log('Quoted has image:', !!quoted?.imageMessage);

        if (quoted?.imageMessage) {
            console.log('Downloading quoted image...');
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            console.log('Quoted image downloaded, size:', buffer.length);
            return buffer;
        }
        
        if (message.message?.imageMessage) {
            console.log('Downloading caption image...');
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            console.log('Caption image downloaded, size:', buffer.length);
            return buffer;
        }

        console.log('No image found');
        return null;
    } catch (error) {
        console.error('getImageBuffer error:', error.message);
        return null;
    }
}

module.exports = {
    name: 'removebg',
    alias: ['rmbg', 'nobg'],
    category: 'tools',
    desc: 'Remove background from images',
    async exec(sock, message, args) {
        const chatId = message.key.remoteJid;
        let loadingMsg;
        let interval;

        try {
            const imageBuffer = await getImageBuffer(sock, message);

            if (!imageBuffer) {
                return await sock.sendMessage(chatId, {
                    text: `╭──◆「 *REMOVE BACKGROUND* 」◆\n` +
                          `├\n` +
                          `├◇ 📸 Remove image backgrounds\n` +
                          `├◇ 🎯 Powered by Remove.BG API\n` +
                          `├\n` +
                          `├◇ *📖 Usage:*\n` +
                          `├  └ Reply to an image with .removebg\n` +
                          `├  └ Send image with .removebg caption\n` +
                          `├\n` +
                          `├◇ *✨ Example:*\n` +
                          `├  └ Reply to a photo → .removebg\n` +
                          `├\n` +
                          `╰─┬─★─☆─♪♪─◆\n\n` +
                          `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                          `╰───★─☆─♪♪─◆`
                }, { quoted: message });
            }

            // Progress bar animation (1 second per frame)
            loadingMsg = await sock.sendMessage(chatId, {
                text: `Removing bg ${BAR_FRAMES[0]}`
            });

            let frame = 0;
            interval = setInterval(async () => {
                try {
                    if (frame < BAR_FRAMES.length - 1) {
                        frame++;
                        await sock.sendMessage(chatId, {
                            edit: loadingMsg.key,
                            text: `Removing bg ${BAR_FRAMES[frame]}`
                        });
                    }
                } catch (e) {}
            }, 1000);

            const base64Image = imageBuffer.toString('base64');
            console.log('Base64 image length:', base64Image.length);

            // Send to proxy
            const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/octet-stream',
        'x-bot-repo': 'wallyjaytechh/WALLYJAYTECH-MD'
    },
    body: imageBuffer
});

            console.log('Proxy response status:', response.status);

            clearInterval(interval);

            if (!response.ok) {
                console.log('Proxy error:', response.status);
                if (response.status === 401) throw new Error('UNAUTHORIZED');
                if (response.status === 402) throw new Error('LIMIT');
                throw new Error('FAILED');
            }

            const data = await response.json();
            console.log('Proxy response has image:', !!data.image);
            const resultBuffer = Buffer.from(data.image, 'base64');

            // Show done
            await sock.sendMessage(chatId, {
                edit: loadingMsg.key,
                text: `Removing done ${BAR_FRAMES[10]}`
            });

            await sock.sendMessage(chatId, {
                image: resultBuffer,
                caption: `╭──◆「 *BACKGROUND REMOVED* 」◆\n` +
                         `├\n` +
                         `├◇ ✅ Successfully processed!\n` +
                         `├◇ 🎯 Powered by Remove.BG\n` +
                         `├\n` +
                         `╰─┬─★─☆─♪♪─◆\n\n` +
                         `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                         `╰───★─☆─♪♪─◆`
            }, { quoted: message });

        } catch (error) {
            console.error('Removebg error:', error.message);
            if (interval) { clearInterval(interval); interval = null; }
            if (loadingMsg) { try { await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Failed [■■■■■■□□□□]' }); } catch (e) {} }

            let errorMsg = `╭──◆「 *REMOVAL FAILED* 」◆\n` +
                          `├\n` +
                          `├◇ ❌ Unable to remove background\n` +
                          `├◇ 💡 Try a different image\n` +
                          `├\n` +
                          `╰─┬─★─☆─♪♪─◆\n\n` +
                          `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                          `╰───★─☆─♪♪─◆`;

            if (error.message === 'LIMIT') {
                errorMsg = `╭──◆「 *API LIMIT* 」◆\n` +
                          `├\n` +
                          `├◇ 💳 Remove.BG credits exhausted\n` +
                          `├◇ 💡 Try again later\n` +
                          `├\n` +
                          `╰─┬─★─☆─♪♪─◆\n\n` +
                          `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                          `╰───★─☆─♪♪─◆`;
            }

            await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
        }
    }
};
