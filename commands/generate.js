// Auto-install dependencies
const { execSync } = require('child_process');
try {
    require.resolve('jimp');
} catch (e) {
    console.log('Installing jimp...');
    execSync('npm install jimp', { stdio: 'inherit' });
    console.log('jimp installed successfully!');
}

const fetch = require('node-fetch');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

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

const LOGO_PATH = path.join(__dirname, '..', 'assets', 'wlt-md-watermark.png');

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

async function addWatermark(imageBuffer) {
    try {
        // Check if logo exists
        if (!fs.existsSync(LOGO_PATH)) {
            console.log('Logo not found, skipping watermark');
            return imageBuffer;
        }

        const image = await Jimp.read(imageBuffer);
        const logo = await Jimp.read(LOGO_PATH);

        // Resize logo to moderate size (max 180px wide, maintain aspect ratio)
        const logoWidth = logo.bitmap.width;
        const logoHeight = logo.bitmap.height;
        const maxWidth = 180;
        if (logoWidth > maxWidth) {
            logo.resize(maxWidth, Jimp.AUTO);
        }

        // Position at bottom right with 20px padding
        const x = image.bitmap.width - logo.bitmap.width - 20;
        const y = image.bitmap.height - logo.bitmap.height - 20;

        // Set logo opacity to 80%
        logo.opacity(0.8);

        // Composite logo onto image
        image.composite(logo, x, y);

        return await image.getBufferAsync(Jimp.MIME_JPEG);
    } catch (err) {
        console.error('Watermark error:', err.message);
        return imageBuffer;
    }
}

async function sendMsg(sock, chatId, text, quoted) {
    return sock.sendMessage(chatId, { text }, quoted ? { quoted } : {});
}

async function generateCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = text.split(' ').slice(1);
        let typedInput = args.join(' ').trim();

        // Check for clean mode
        let cleanMode = false;
        if (typedInput.toLowerCase().startsWith('clean')) {
            cleanMode = true;
            typedInput = typedInput.slice(5).trim();
        }

        // Get quoted message text
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        let quotedText = '';
        if (quotedMessage) {
            quotedText = quotedMessage.conversation || 
                        quotedMessage.extendedTextMessage?.text || 
                        quotedMessage.imageMessage?.caption || 
                        quotedMessage.videoMessage?.caption || '';
        }

        // Typed input always wins over quoted text
        let fullInput;
        if (typedInput) {
            fullInput = typedInput;
        } else if (quotedText) {
            fullInput = quotedText;
        } else {
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
                `├  └ .generate clean <prompt>\n` +
                `├  └ Reply to a message with .generate\n` +
                `├  └ Reply + type to override\n` +
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
                `├  └ .generate clean futuristic city\n` +
                `├  └ Reply to a photo with .generate\n` +
                `├\n` +
                `├◇ *💡 Note:*\n` +
                `├  └ .generate = image with watermark\n` +
                `├  └ .generate clean = image without\n` +
                `├        watermark\n` +
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

        // Start progress bar + image generation at same time
        const loadingMsg = await sock.sendMessage(chatId, { text: `Generating prompt ${BAR_FRAMES[0]}` });
        const imagePromise = generateImage(prompt, style);

        // Play animation (1 second per bar)
        for (let frame = 1; frame < BAR_FRAMES.length; frame++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `Generating prompt ${BAR_FRAMES[frame]}` });
            } catch (e) {}
        }

        // Wait for image
        let imageBuffer = await imagePromise;

        // Add watermark unless clean mode
        if (!cleanMode) {
            imageBuffer = await addWatermark(imageBuffer);
        }

        // Done
        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `Generating done ${BAR_FRAMES[10]}` });

        // Send result
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `╭──◆「 *IMAGE GENERATED* 」◆\n` +
                     `├\n` +
                     `├◇ 🎨 *Prompt:* ${prompt}\n` +
                     `${style ? `├◇ 🎯 *Style:* ${style}\n` : ''}` +
                     `├◇ ✅ *Status:* Success!\n` +
                     `${cleanMode ? `├◇ 🧹 *Mode:* Clean (no watermark)\n` : ''}` +
                     `├\n` +
                     `╰─┬─★─☆─♪♪─◆\n\n` +
                     `╭──◆「 *WALLYJAYTECH-MD* 」◆\n` +
                     `╰───★─☆─♪♪─◆`,
        }, { quoted: message });

    } catch (error) {
        console.error('Generate error:', error.message);
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
