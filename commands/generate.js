// Auto-install sharp
const { execSync } = require('child_process');
try {
    require.resolve('sharp');
} catch (e) {
    console.log('Installing sharp...');
    execSync('npm install sharp', { stdio: 'inherit' });
    console.log('sharp installed successfully!');
}

const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

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
        if (!fs.existsSync(LOGO_PATH)) {
            console.log('Logo not found, skipping watermark');
            return imageBuffer;
        }

        // Get image dimensions
        const metadata = await sharp(imageBuffer).metadata();
        const imgWidth = metadata.width;
        const imgHeight = metadata.height;

        // Resize logo to 200px wide
        const logoBuffer = await sharp(LOGO_PATH)
            .resize(200)
            .toBuffer();

        // Get logo dimensions
        const logoMeta = await sharp(logoBuffer).metadata();
        const logoWidth = logoMeta.width;
        const logoHeight = logoMeta.height;

        // Position bottom right with 30px padding
        const x = imgWidth - logoWidth - 30;
        const y = imgHeight - logoHeight - 30;

        // Composite logo onto image
        return await sharp(imageBuffer)
            .composite([{ input: logoBuffer, top: y, left: x }])
            .jpeg()
            .toBuffer();

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

        const loadingMsg = await sock.sendMessage(chatId, { text: `Generating prompt ${BAR_FRAMES[0]}` });
        const imagePromise = generateImage(prompt, style);

        for (let frame = 1; frame < BAR_FRAMES.length; frame++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            try {
                await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `Generating prompt ${BAR_FRAMES[frame]}` });
            } catch (e) {}
        }

        let imageBuffer = await imagePromise;

        if (!cleanMode) {
            imageBuffer = await addWatermark(imageBuffer);
        }

        await sock.sendMessage(chatId, { edit: loadingMsg.key, text: `Generating done ${BAR_FRAMES[10]}` });

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
