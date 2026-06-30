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
 * Powered by Cloudflare Workers AI — Free, generous daily limits
 * Models: SDXL | FLUX Schnell
 * Professional Version
 */

const fetch = require('node-fetch');
const settings = require('../settings');

// ═══════════════════════════════════════
// CLOUDFLARE CONFIG (from settings.js)
// ═══════════════════════════════════════

const CF_ACCOUNT_ID = settings.cloudflareAccountId;
const CF_API_TOKEN = settings.cloudflareApiToken;

const MODELS = {
    sdxl: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    flux: '@cf/black-forest-labs/flux-1-schnell'
};

const STYLES = [
    'photorealistic', 'anime', '3d', 'digital-painting', 
    'oil-painting', 'pixel-art', 'cyberpunk', 'fantasy', 
    'watercolor', 'sketch', 'cinematic', 'portrait'
];

// ═══════════════════════════════════════
// IMAGE GENERATION
// ═══════════════════════════════════════

async function generateImage(prompt, style, model) {
    const fullPrompt = style ? `${prompt}, ${style} style` : prompt;
    const modelPath = MODELS[model] || MODELS.sdxl;

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${modelPath}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CF_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: fullPrompt })
        }
    );

    if (!response.ok) throw new Error('GENERATION_FAILED');

    const data = await response.json();

    if (!data.success) {
        const errorMsg = data.errors?.[0]?.message || 'Unknown error';
        if (errorMsg.includes('NSFW')) throw new Error('NSFW_BLOCKED');
        if (errorMsg.includes('Authentication')) throw new Error('AUTH_FAILED');
        throw new Error('GENERATION_FAILED');
    }

    const base64 = data.result?.image;
    if (!base64) throw new Error('NO_IMAGE');

    return Buffer.from(base64, 'base64');
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

        if (!fullInput) {
            return sendMsg(sock, chatId,
                `╭──◆「 *AI IMAGE GENERATION* 」◆\n` +
                `├\n` +
                `├◇ 🎨 Generate stunning AI images\n` +
                `├◇ ☁️ Powered by Cloudflare AI\n` +
                `├◇ 🆓 Free — Generous daily limits\n` +
                `├\n` +
                `├◇ *📖 Usage:*\n` +
                `├  └ .generate <prompt>\n` +
                `├  └ .generate <prompt> | <style>\n` +
                `├  └ .generate <prompt> | <style> | <model>\n` +
                `├\n` +
                `├◇ *🤖 Models:*\n` +
                `├  └ sdxl (default)\n` +
                `├  └ flux\n` +
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
                `├  └ .generate futuristic city | cyberpunk | flux\n` +
                `├\n` +
                `╰─┬─★─☆─♪♪─◆\n\n` +
                `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                `╰───★─☆─♪♪─◆`, message);
        }

        // Parse: prompt | style | model
        let prompt = fullInput;
        let style = '';
        let model = 'sdxl';

        if (fullInput.includes('|')) {
            const parts = fullInput.split('|').map(p => p.trim());
            prompt = parts[0] || prompt;
            
            for (let i = 1; i < parts.length; i++) {
                const part = parts[i].toLowerCase();
                if (STYLES.includes(part)) {
                    style = part;
                } else if (MODELS[part]) {
                    model = part;
                }
            }
        }

        await sock.sendMessage(chatId, { react: { text: '🎨', key: message.key } });

        await sendMsg(sock, chatId,
            `╭──◆「 *GENERATING IMAGE* 」◆\n` +
            `├\n` +
            `├◇ 🎨 *Prompt:* ${prompt}\n` +
            `${style ? `├◇ 🎯 *Style:* ${style}\n` : ''}` +
            `├◇ 🤖 *Model:* ${model.toUpperCase()}\n` +
            `├◇ ☁️ *Engine:* Cloudflare AI\n` +
            `├\n` +
            `├◇ ⏳ Creating your masterpiece...\n` +
            `├\n` +
            `╰─┬─★─☆─♪♪─◆\n\n` +
            `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
            `╰───★─☆─♪♪─◆`, message);

        const imageBuffer = await generateImage(prompt, style, model);

        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `╭──◆「 *IMAGE GENERATED* 」◆\n` +
                     `├\n` +
                     `├◇ 🎨 *Prompt:* ${prompt}\n` +
                     `${style ? `├◇ 🎯 *Style:* ${style}\n` : ''}` +
                     `├◇ 🤖 *Model:* ${model.toUpperCase()}\n` +
                     `├◇ ✅ *Status:* Success!\n` +
                     `├\n` +
                     `╰─┬─★─☆─♪♪─◆\n\n` +
                     `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                     `╰───★─☆─♪♪─◆`,
        }, { quoted: message });

    } catch (error) {
        console.error('❌ Generate error');
        
        let errorMsg = `╭──◆「 *GENERATION FAILED* 」◆\n├\n├◇ ❌ Unable to generate image\n├◇ 💡 Try a different prompt\n├◇ 🔄 Wait a moment & retry\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        
        if (error.message === 'NSFW_BLOCKED') {
            errorMsg = `╭──◆「 *CONTENT BLOCKED* 」◆\n├\n├◇ 🚫 Prompt blocked by filter\n├◇ 💡 Try a different description\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        }
        
        if (error.message === 'AUTH_FAILED') {
            errorMsg = `╭──◆「 *AUTH FAILED* 」◆\n├\n├◇ 🔑 Cloudflare token invalid\n├◇ 💡 Check settings.js\n├\n╰─┬─★─☆─♪♪─◆\n\n╭──◆「 *WALLYJAYTECH-MD* 」◆\n╰───★─☆─♪♪─◆`;
        }
        
        await sendMsg(sock, chatId, errorMsg, message);
    }
}

module.exports = generateCommand;
