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

/**
 * WALLYJAYTECH-MD - AI Image Generation Command (.generate)
 * Powered by FLUX AI (Pollinations) — Free forever, no limits, no token
 * Features: Multiple styles | Background generation | Smooth progress bar
 * Professional Version
 */

const fetch = require('node-fetch');

const STYLES = [
    'photorealistic', 'anime', '3d', 'digital-painting', 
    'oil-painting', 'pixel-art', 'cyberpunk', 'fantasy', 
    'watercolor', 'sketch', 'cinematic', 'portrait'
];

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

async function generateImage(prompt, style) {
    const fullPrompt = style 
        ? `${prompt}, ${style} style, high quality, detailed` 
        : `${prompt}, high quality, detailed`;

    const response = await fetch(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1024&height=1024&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000000)}`
    );

    if (!response.ok) throw new Error('GENERATION_FAILED');

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function sendMsg(sock, chatId, text, quoted) {
    return sock.sendMessage(chatId, { text }, quoted ? { quoted } : {});
}

async function generateCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1);
        const fullInput = args.join(' ').trim();

        if (!fullInput) {
            return sendMsg(sock, chatId,
                `╭──◆「 *AI IMAGE GENERATION* 」◆\n` +
                `├\n` +
                `├◇ 🎨 Generate stunning AI images\n` +
                `├◇ 🤖 Powered by FLUX AI\n` +
                `├◇ 🆓 Free forever — No limits\n` +
                `├\n` +
                `├◇ *📖 Usage:*\n` +
                `├  └ .generate <prompt>\n` +
                `├  └ .generate <prompt> | <style>\n` +
                `├\n` +
                `├◇ *🎨 Styles:*\n` +
                `├  └ photorealistic, anime, 3d\n` +
                `├  └ digital-painting, oil-painting\n` +
                `├  └ pixel-art, cyberpunk, fantasy\n` +
                `├  └ watercolor, sketch, cinematic\n` +
                `├  └ portrait\n` +
                `├\n` +
                `├◇ *✨ Examples:*\n` +
                `├  └ .generate a beautiful sunset\n` +
                `├  └ .generate dragon warrior | anime\n` +
                `├  └ .generate futuristic city | cyberpunk\n` +
                `├\n` +
                `╰─┬─★─☆─♪♪─◆\n\n` +
                `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                `╰───★─☆─♪♪─◆`, message);
        }

        let prompt = fullInput;
        let style = '';

        if (fullInput.includes('|')) {
            const parts = fullInput.split('|').map(p => p.trim());
            prompt = parts[0];
            if (parts[1] && STYLES.includes(parts[1].toLowerCase())) {
                style = parts[1].toLowerCase();
            }
        }

        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });

        const loadingMsg = await sock.sendMessage(chatId, { 
            text: `Generating prompt ${BAR_FRAMES[0]}` 
        });

        const imagePromise = generateImage(prompt, style);

        for (let frame = 1; frame < BAR_FRAMES.length; frame++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, {
                    edit: loadingMsg.key,
                    text: `Generating prompt ${BAR_FRAMES[frame]}`
                });
            } catch (e) {}
        }

        const imageBuffer = await imagePromise;

        await sock.sendMessage(chatId, {
            edit: loadingMsg.key,
            text: `Generating done ${BAR_FRAMES[10]}`
        });

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `╭──◆「 *IMAGE GENERATED* 」◆\n` +
                     `├\n` +
                     `├◇ 🎨 *Prompt:* ${prompt}\n` +
                     `${style ? `├◇ 🎯 *Style:* ${style}\n` : ''}` +
                     `├◇ ✅ *Status:* Success!\n` +
                     `├\n` +
                     `╰─┬─★─☆─♪♪─◆\n\n` +
                     `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                     `╰───★─☆─♪♪─◆`,
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Generate error');

        await sendMsg(sock, chatId,
            `╭──◆「 *GENERATION FAILED* 」◆\n` +
            `├\n` +
            `├◇ ❌ Unable to generate image\n` +
            `├◇ 💡 Try a different prompt\n` +
            `├◇ 🔄 Wait a moment & retry\n` +
            `├\n` +
            `╰─┬─★─☆─♪♪─◆\n\n` +
            `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
            `╰───★─☆─♪♪─◆`, message);
    }
}

module.exports = generateCommand;
