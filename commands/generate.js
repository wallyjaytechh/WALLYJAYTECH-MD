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
 * Features: Multiple styles | Smooth progress bar animation
 * Professional Version
 */

const fetch = require('node-fetch');

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════

const STYLES = [
    'photorealistic', 'anime', '3d', 'digital-painting', 
    'oil-painting', 'pixel-art', 'cyberpunk', 'fantasy', 
    'watercolor', 'sketch', 'cinematic', 'portrait'
];

// ═══════════════════════════════════════
// PROGRESS BAR FRAMES
// ═══════════════════════════════════════

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

// ═══════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════

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

// ═══════════════════════════════════════
// SEND MESSAGE (NO NEWSLETTER)
// ═══════════════════════════════════════

async function sendMsg(sock, chatId, text, quoted) {
    const opts = { text };
    if (quoted) {
        opts.contextInfo = {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363420618370733@newsletter',
                newsletterName: '‎',
                serverMessageId: -1
            }
        };
    }
    return sock.sendMessage(chatId, opts, quoted ? { quoted } : {});
}

// ═══════════════════════════════════════
// COMMAND HANDLER
// ═══════════════════════════════════════

async function generateCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1);
        const fullInput = args.join(' ').trim();

        // ═══ Help Menu ═══
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

        // ═══ Parse prompt & style ═══
        let prompt = fullInput;
        let style = '';

        if (fullInput.includes('|')) {
            const parts = fullInput.split('|').map(p => p.trim());
            prompt = parts[0];
            if (parts[1] && STYLES.includes(parts[1].toLowerCase())) {
                style = parts[1].toLowerCase();
            }
        }

        // ═══ React ═══
        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });

        // ═══ Start Progress Bar Animation (2s per frame) ═══
        const loadingMsg = await sock.sendMessage(chatId, { 
            text: `Generating prompt ${BAR_FRAMES[0]}` 
        });

        let frame = 0;
        let animationDone = false;

        const interval = setInterval(async () => {
            try {
                frame++;
                if (frame < BAR_FRAMES.length) {
                    await sock.sendMessage(chatId, {
                        edit: loadingMsg.key,
                        text: `Generating prompt ${BAR_FRAMES[frame]}`
                    });
                } else if (frame === BAR_FRAMES.length) {
                    await sock.sendMessage(chatId, {
                        edit: loadingMsg.key,
                        text: `Generating done ${BAR_FRAMES[10]}`
                    });
                    animationDone = true;
                    clearInterval(interval);
                }
            } catch (e) {
                clearInterval(interval);
            }
        }, 2000);

        // ═══ Generate Image (runs while animation plays) ═══
        const imageBuffer = await generateImage(prompt, style);

        // ═══ Wait for animation to finish if still running ═══
        if (!animationDone) {
            clearInterval(interval);
            await sock.sendMessage(chatId, {
                edit: loadingMsg.key,
                text: `Generating done ${BAR_FRAMES[10]}`
            });
        }

        // ═══ Send Result ═══
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
