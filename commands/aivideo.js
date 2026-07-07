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
 * WALLYJAYTECH-MD - AI Video Generation Command (.aivideo)
 * Powered by Hugging Face Gradio Spaces — Free forever
 * Features: Text-to-Video | Loading animation
 * Professional Version
 */

const { Client } = require('@gradio/client');
const fs = require('fs');
const path = require('path');

const LOADING_FRAMES = [
    'Generating video [■□□□□□□□□□]',
    'Generating video [■■□□□□□□□□]',
    'Generating video [■■■□□□□□□□]',
    'Generating video [■■■■□□□□□□]',
    'Generating video [■■■■■□□□□□]',
    'Generating video [■■■■■■□□□□]',
    'Generating video [■■■■■■■□□□]',
    'Generating video [■■■■■■■■□□]',
    'Generating video [■■■■■■■■■□]'
];

async function aivideoCommand(sock, chatId, message) {
    let loadingMsg;

    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = text.split(' ').slice(1).join(' ').trim();

        if (!query) {
            return sock.sendMessage(chatId, {
                text: `╭──◆「 *AI VIDEO GENERATION* 」◆\n` +
                      `├\n` +
                      `├◇ 🎬 Generate AI videos from text\n` +
                      `├◇ 🤖 Powered by Hugging Face\n` +
                      `├◇ 🆓 Free — No limits\n` +
                      `├\n` +
                      `├◇ *📖 Usage:*\n` +
                      `├  └ .aivideo <prompt>\n` +
                      `├\n` +
                      `├◇ *✨ Example:*\n` +
                      `├  └ .aivideo a cat walking on beach\n` +
                      `├\n` +
                      `╰─┬─★─☆─♪♪─◆\n\n` +
                      `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                      `╰───★─☆─♪♪─◆`
            }, { quoted: message });
        }

        loadingMsg = await sock.sendMessage(chatId, { text: LOADING_FRAMES[0] });

        let frame = 0;
        const interval = setInterval(async () => {
            try {
                if (frame < LOADING_FRAMES.length - 1) {
                    frame++;
                    await sock.sendMessage(chatId, { edit: loadingMsg.key, text: LOADING_FRAMES[frame] });
                }
            } catch (e) {}
        }, 2000);

        const app = await Client.connect("Wan-AI/Wan2.1-T2V-1.3B-Diffusers");
        const result = await app.predict("/predict", {
            prompt: query,
            negative_prompt: "low quality, blurry, static",
            aspect_ratio: "16:9",
            num_inference_steps: 20
        });

        clearInterval(interval);

        const tempVideoPath = result.data[0]?.path;
        if (!tempVideoPath || !fs.existsSync(tempVideoPath)) throw new Error('No video');

        const outputDir = './output';
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
        const localPath = path.join(outputDir, `aivideo_${Date.now()}.mp4`);
        fs.copyFileSync(tempVideoPath, localPath);

        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Done [■■■■■■■■■■]' });

        await sock.sendMessage(chatId, {
            video: fs.readFileSync(localPath),
            mimetype: 'video/mp4',
            caption: `╭──◆「 *AI VIDEO GENERATED* 」◆\n├\n├◇ 🎬 *Prompt:* ${query}\n├◇ ✅ *Status:* Success!\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });

        fs.unlinkSync(localPath);

    } catch (error) {
        console.error('AI Video error:', error.message);
        if (loadingMsg) { try { await sock.sendMessage(chatId, { edit: loadingMsg.key, text: 'Failed [■■■■■■□□□□]' }); } catch (e) {} }
        await sock.sendMessage(chatId, {
            text: `╭──◆「 *AI VIDEO FAILED* 」◆\n├\n├◇ ❌ Unable to generate video\n├◇ 💡 Try a different prompt\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`
        }, { quoted: message });
    }
}

module.exports = aivideoCommand;
